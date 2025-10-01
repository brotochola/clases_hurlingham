/**
 * CLASE BASE GAMEOBJECT
 *
 * Cálculo isométrico para colisiones:
 * Radio del collider = ancho_imagen × 0.288675
 *
 * Esta fórmula viene de la proyección isométrica donde:
 * - El ángulo de inclinación es 30°
 * - La relación altura/ancho en isometría es √3/6 ≈ 0.288675
 * - Esto nos da el radio del círculo de colisión desde el borde inferior
 *   hasta el 'horizonte' visual de la perspectiva isométrica
 */

class GameObject {
  // Propiedades visuales
  sprite; // Sprite de PIXI.js para renderizado
  id; // Identificador único del objeto

  // Sistema de objetivos para IA
  target; // Objeto que este GameObject está persiguiendo
  perseguidor; // Objeto que está persiguiendo a este GameObject
  isometric = false;

  constructor(x, y, juego) {
    // Rango de visión aleatorio entre 400-700 píxeles
    this.vision = Math.random() * 300 + 400;

    // Sistema de física vectorial 2D
    this.posicion = { x: x, y: y }; // Posición actual en píxeles
    this.velocidad = { x: 0, y: 0 }; // Velocidad en píxeles/frame
    this.aceleracion = { x: 0, y: 0 }; // Aceleración en píxeles/frame²

    // Límites físicos para estabilidad del sistema
    this.aceleracionMaxima = 0.2; // Máxima aceleración aplicable
    this.velocidadMaxima = 3; // Velocidad terminal del objeto

    // Propiedades de colisión y combate
    this.radio = 12; // Radio de colisión en píxeles
    this.rangoDeAtaque = 25 + Math.random() * 10; // Rango aleatorio 25-35 píxeles

    // Referencias del sistema
    this.juego = juego; // Referencia al motor del juego
    this.id = Math.floor(Math.random() * 99999999); // ID único aleatorio

    // Configuración del sistema de renderizado PIXI.js
    this.container = new PIXI.Container(); // Container para agrupar elementos visuales
    this.container.x = x; // Posición inicial X en pantalla
    this.container.y = y; // Posición inicial Y en pantalla

    // Jerarquía de renderizado: Juego -> ContainerPrincipal -> Container -> Sprite
    // El containerPrincipal maneja la cámara y el scrolling del mundo
    this.juego.containerPrincipal.addChild(this.container);
  }

  tick() {
    this.aplicarFisica();
  }

  aplicarFisica() {
    /**
     * SISTEMA DE FÍSICA ESTABLE CON DELTATIME
     *
     * Limitamos deltaTime para evitar inestabilidad cuando los FPS bajan:
     * - FPS normales (60): deltaTime ≈ 1
     * - FPS bajos (15): deltaTime ≈ 4 → limitado a 3
     * - Esto previene saltos extremos en la simulación física
     */
    const deltaTime = Math.min(this.juego.pixiApp.ticker.deltaTime, 3);

    // PASO 1: Aplicar fuerzas acumuladas
    this.limitarAceleracion();

    // Integración de Euler: v = v₀ + a×Δt
    this.velocidad.x += this.aceleracion.x * deltaTime;
    this.velocidad.y += this.aceleracion.y * deltaTime;

    // Resetear aceleración para el próximo frame (fuerzas instantáneas)
    this.aceleracion.x = 0;
    this.aceleracion.y = 0;

    // PASO 2: Aplicar modificadores de velocidad
    this.aplicarFriccion(); // Resistencia al movimiento
    this.limitarVelocidad(); // Velocidad terminal

    // PASO 3: Integrar posición: x = x₀ + v×Δt
    this.posicion.x += this.velocidad.x * deltaTime;
    this.posicion.y += this.velocidad.y * deltaTime;

    // PASO 4: Calcular ángulo de movimiento usando arctangente
    // atan2(y,x) nos da el ángulo en radianes del vector velocidad
    this.angulo = radianesAGrados(
      Math.atan2(this.velocidad.y, this.velocidad.x)
    );
  }

  limitarAceleracion() {
    /**
     * LIMITACIÓN DE ACELERACIÓN
     *
     * Aplica el límite usando la magnitud del vector:
     * Si |a| > aₘₐₓ, entonces a = (a/|a|) × aₘₐₓ
     *
     * Esto mantiene la dirección pero limita la intensidad
     */
    this.aceleracion = limitarVector(this.aceleracion, this.aceleracionMaxima);
  }

  limitarVelocidad() {
    /**
     * VELOCIDAD TERMINAL
     *
     * Implementa velocidad máxima usando la misma fórmula:
     * Si |v| > vₘₐₓ, entonces v = (v/|v|) × vₘₐₓ
     *
     * Simula resistencia del aire o límites físicos del objeto
     */
    this.velocidad = limitarVector(this.velocidad, this.velocidadMaxima);
  }

  aplicarFriccion() {
    /**
     * FRICCIÓN INDEPENDIENTE DEL FRAMERATE
     *
     * Problema: La fricción simple (v *= 0.93) depende del FPS
     * - A 60 FPS: se aplica 60 veces por segundo
     * - A 30 FPS: se aplica 30 veces por segundo → fricción diferente
     *
     * Solución: Convertir fricción por frame a fricción por tiempo
     *
     * Fórmula: fricción_aplicada = fricción_base^(deltaTime/60)
     *
     * Donde:
     * - fricción_base = 0.93^60 ≈ 0.122 (fricción por segundo a 60 FPS)
     * - deltaTime/60 = fracción de segundo transcurrido
     *
     * Esto garantiza que la fricción sea consistente sin importar el FPS
     */
    const friccionPorFrame = 0.93;
    const friccionPorSegundo = Math.pow(friccionPorFrame, 60);
    const deltaTime = Math.min(this.juego.pixiApp.ticker.deltaTime, 3);
    const friccionAplicada = Math.pow(friccionPorSegundo, deltaTime / 60);

    this.velocidad.x *= friccionAplicada;
    this.velocidad.y *= friccionAplicada;
  }

  calcularZindex() {
    const base = 5000;
    return this.isometric
      ? this.posicion.y - this.sprite.width * 0.29 + base
      : this.posicion.y + base;
  }

  getPosicionCentral() {
    if (!this.container) return this.posicion;
    return {
      x: this.posicion.x,
      y: this.posicion.y + this.calcularOffsetY() - this.radio * 0.25,
    };
  }

  calcularOffsetY() {
    if (!this.container) return 0;
    return this.isometric ? -this.container.width * 0.29 : 0;
  }

  rebotar() {
    /**
     * SISTEMA DE REBOTE CON PÉRDIDA DE ENERGÍA
     *
     * Implementa reflexión elástica imperfecta:
     * - Invierte la componente de velocidad perpendicular al borde
     * - Aplica coeficiente de restitución de 0.99 (pérdida del 1% de energía)
     *
     * Fórmula: v_nueva = -v_vieja × coeficiente_restitución
     *
     * Esto simula colisiones realistas donde se pierde energía en el impacto
     */
    if (this.posicion.x > this.juego.width || this.posicion.x < 0) {
      // Rebote horizontal: invierte velocidad X con pérdida de energía
      this.velocidad.x *= -0.99;
    }

    if (this.posicion.y > this.juego.height || this.posicion.y < 0) {
      // Rebote vertical: invierte velocidad Y con pérdida de energía
      this.velocidad.y *= -0.99;
    }
  }
  borrarmeComoTargetDeTodos() {
    this.juego.personas.forEach((persona) => {
      persona.asignarTarget(null);
    });
  }

  asignarTarget(quien) {
    if (quien instanceof Persona && quien.muerto) return;
    this.target = quien;
  }

  perseguir() {
    /**
     * ALGORITMO DE PERSECUCIÓN CON DESACELERACIÓN PROGRESIVA
     *
     * 1. Verificaciones de validez:
     *    - Existe objetivo
     *    - Objetivo dentro del rango de visión
     *
     * 2. Cálculo del vector de dirección:
     *    - Vector = posición_objetivo - posición_actual
     *    - Normalización: vector_unitario = vector / |vector|
     *
     * 3. Desaceleración cerca del objetivo:
     *    - Factor = (distancia / rango_ataque)³
     *    - La potencia cúbica crea una curva suave de desaceleración
     *    - Cuando dist = rango_ataque → factor = 1 (velocidad normal)
     *    - Cuando dist = 0 → factor = 0 (parada completa)
     *
     * 4. Aplicación de fuerza direccional
     */
    if (!this.target) return;
    const dist = calcularDistancia(this.posicion, this.target.posicion);
    if (dist > this.vision) return;

    // Vector de dirección hacia el objetivo
    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    // Normalizar el vector para obtener solo la dirección (magnitud = 1)
    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    if (dist < this.rangoDeAtaque) {
      // Curva cúbica de desaceleración: f(x) = (x/r)³
      // Esto crea una aproximación suave al objetivo
      const factor = (dist / this.rangoDeAtaque) ** 3;
      vectorNuevo.x *= factor;
      vectorNuevo.y *= factor;
    }

    // Aplicar fuerza de persecución escalada por el factor específico del objeto
    this.aceleracion.x += vectorNuevo.x * this.factorPerseguir;
    this.aceleracion.y += vectorNuevo.y * this.factorPerseguir;
  }

  escapar() {
    /**
     * ALGORITMO DE HUIDA
     *
     * Implementa el comportamiento opuesto a perseguir:
     * 1. Calcula vector hacia el perseguidor
     * 2. Invierte la dirección (multiplica por -1)
     * 3. Aplica fuerza en dirección opuesta
     *
     * Fórmula: fuerza_huida = -(posición_perseguidor - posición_actual)
     *
     * Esto crea un comportamiento de evasión realista
     */
    if (!this.perseguidor) return;
    const dist = calcularDistancia(this.posicion, this.perseguidor.posicion);
    if (dist > this.vision) return;

    // Vector hacia el perseguidor
    const difX = this.perseguidor.posicion.x - this.posicion.x;
    const difY = this.perseguidor.posicion.y - this.posicion.y;
    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    // Aplicar fuerza en dirección opuesta (huir)
    this.aceleracion.x += -vectorNuevo.x;
    this.aceleracion.y += -vectorNuevo.y;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  render() {
    this.dibujarCirculo();
    if (!this.container || this.muerto) return;

    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    this.container.zIndex = this.calcularZindex();
    this.cambiarTintParaSimularIluminacion();
  }

  dibujarCirculo() {
    if (!this.juego.graficoDebug) return console.warn("no hay grafico debug");

    // Calcular el offset Y para centrar el círculo con el sprite

    const posicionCentral = this.getPosicionCentral();
    this.juego.graficoDebug.circle(
      posicionCentral.x,
      posicionCentral.y,
      this.radio
    );
    this.juego.graficoDebug.stroke({ color: 0x000000, width: 1 });
  }

  cambiarTintParaSimularIluminacion() {
    if (!this.juego.iluminacion) {
      this.container.tint = 0xffffff;
      return;
    }
    const luz = this.calcularLuz();
    // Convertir luz (0-1) a valor de gris (0-255)
    const valorGris = Math.floor(luz * 255);
    // Crear color hexadecimal: 0xRRGGBB donde RR=GG=BB para gris
    const colorGris = (valorGris << 16) | (valorGris << 8) | valorGris;
    this.container.tint = colorGris;
  }

  calcularLuz() {
    let luz = 0;
    const distanciaALaQueTieneTodaLaLuz = 100;
    for (let farol of this.juego.faroles) {
      const dist = calcularDistancia(farol.posicion, this.posicion);
      luz += distanciaALaQueTieneTodaLaLuz ** 2 / dist ** 2;
    }

    if (luz > 1) luz = 1;
    return luz;
  }
}
