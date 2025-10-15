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
  tieneSpriteCargado = false;
  anchoBarraVida = 20;
  altoBarraVida = 4;
  vida = 1;
  vidaMaxima = 1;

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
    this.id = Math.floor(Math.random() * 9999999999999); // ID único aleatorio

    // Configuración del sistema de renderizado PIXI.js
    this.container = new PIXI.Container(); // Container para agrupar elementos visuales
    this.container.label = "gameObject - " + this.id;
    this.container.x = x; // Posición inicial X en pantalla
    this.container.y = y; // Posición inicial Y en pantalla

    // Jerarquía de renderizado: Juego -> ContainerPrincipal -> Container -> Sprite
    // El containerPrincipal maneja la cámara y el scrolling del mundo
    this.juego.containerPrincipal.addChild(this.container);
  }

  esperarAQueTengaSpriteCargado(callback) {
    if (this.sprite) {
      this.tieneSpriteCargado = true;
      if (callback instanceof Function) callback();
    } else {
      setTimeout(() => {
        this.esperarAQueTengaSpriteCargado(callback);
      }, 100);
    }
  }

  crearBarritaVida() {
    this.containerBarraVida = new PIXI.Container();
    this.containerBarraVida.label = "containerBarraVida";
    this.container.addChild(this.containerBarraVida);

    this.barritaVida = new PIXI.Graphics();
    this.barritaVida.label = "barritaVida";
    this.barritaVida.rect(
      0,
      -this.sprite.height,
      this.anchoBarraVida,
      this.altoBarraVida
    );
    this.barritaVida.fill(0xffffff);

    this.contornoBarraVida = new PIXI.Graphics();
    this.contornoBarraVida.rect(
      0,
      -this.sprite.height,
      this.anchoBarraVida,
      this.altoBarraVida
    );
    this.contornoBarraVida.stroke({ color: 0xffffff, width: 1, alpha: 0.66 });

    this.containerBarraVida.addChild(this.barritaVida);
    this.containerBarraVida.addChild(this.contornoBarraVida);

    this.containerBarraVida.x = -this.anchoBarraVida * 0.5;
  }

  quitarBarritaVida() {
    // Verificar que el contenedor principal exista antes de proceder
    if (!this.containerBarraVida) return;
    this.containerBarraVida.visible = false;
    this.container.removeChild(this.containerBarraVida);

    if (this.barritaVida) {
      try {
        this.containerBarraVida.removeChild(this.barritaVida);
        this.barritaVida.visible = false;
        this.barritaVida.clear();
        this.barritaVida.destroy();
      } catch (e) {
        console.warn("Error al destruir barritaVida:", e);
      }
      this.barritaVida = null;
    }

    if (this.contornoBarraVida) {
      try {
        this.containerBarraVida.removeChild(this.contornoBarraVida);
        this.contornoBarraVida.visible = false;
        this.contornoBarraVida.clear();
        this.contornoBarraVida.destroy();
      } catch (e) {
        console.warn("Error al destruir contornoBarraVida:", e);
      }
      this.contornoBarraVida = null;
    }

    if (this.containerBarraVida) {
      try {
        if (this.container) {
          this.container.removeChild(this.containerBarraVida);
        }
        this.containerBarraVida.visible = false;
        this.containerBarraVida.destroy();
      } catch (e) {
        console.warn("Error al destruir containerBarraVida:", e);
      }
      this.containerBarraVida = null;
    }
  }

  actualizarBarritaVida() {
    if (!this.tieneSpriteCargado) return;
    if (!this.barritaVida || !this.containerBarraVida) return;
    if (this.muerto) return;

    this.barritaVida.width =
      (this.vida / this.vidaMaxima) * this.anchoBarraVida;

    let ratio = this.vida / this.vidaMaxima;
    if (ratio > 1) ratio = 1;
    if (ratio < 0) ratio = 0;

    this.barritaVida.tint = mapColors(0xff0000, 0x7fca34, ratio);
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
    const deltaTime = Math.min(this.juego.ratioDeltaTime, 3);

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
    const deltaTime = Math.min(this.juego.ratioDeltaTime, 3);
    const friccionAplicada = Math.pow(friccionPorSegundo, deltaTime / 60);

    this.velocidad.x *= friccionAplicada;
    this.velocidad.y *= friccionAplicada;
  }

  calcularZindex() {
    const base = this.juego.BASE_Z_INDEX;

    if (!this.sprite) return this.posicion.y + base;

    if (this.isometric) {
      return this.posicion.y - this.sprite.width * 0.29 + base;
    } else {
      if (this.muerto) {
        //como el dibujo de los chabones cuando mueren es q se caen palante...
        return this.posicion.y - this.sprite.height * 0.66 + base;
      } else {
        return this.posicion.y + base;
      }
    }
  }

  // calcularzIndexEnMundoNoIsometrico() {
  //   const base = 50000;
  //   const pos = this.calcularPosicionEnMundoNoIsometrico();
  //   return pos.y + pos.x + base;
  // }

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
      if (persona.target == this) persona.asignarTarget(null);
      if (persona.perseguidor == this) persona.perseguidor = null;
      if (persona.enemigoMasCerca == this) persona.enemigoMasCerca = null;
    });
  }

  asignarTarget(quien) {
    this.target = quien;
  }

  perseguir() {
    if (!this.target) return;

    const dist = calcularDistancia(this.posicion, this.target.posicion);
    this.distanciaAlTarget = dist;
    if (dist > this.vision || dist < this.rangoDeAtaque) return;

    // Vector de dirección hacia el objetivo
    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    // Normalizar el vector para obtener solo la dirección (magnitud = 1)
    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    // if (dist < this.rangoDeAtaque) {
    //   // Curva cúbica de desaceleración: f(x) = (x/r)³
    //   // Esto crea una aproximación suave al objetivo
    //   const factor = (dist / this.rangoDeAtaque) ** 3;
    //   vectorNuevo.x *= factor;
    //   vectorNuevo.y *= factor;
    // }

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
    this.aceleracion.x += -vectorNuevo.x * this.factorEscapar;
    this.aceleracion.y += -vectorNuevo.y * this.factorEscapar;
  }

  asignarVelocidad(x, y) {
    this.velocidad.x = x;
    this.velocidad.y = y;
  }

  render() {
    if (!this.container) return;

    this.container.x = this.posicion.x;
    this.container.y = this.posicion.y;
    try {
      this.container.zIndex = this.calcularZindex();
    } catch (e) {
      console.warn(e);
    }
    try {
      this.cambiarTintParaSimularIluminacion();
    } catch (e) {
      console.warn(e);
    }

    this.actualizarBarritaVida();
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

  getPosicionEnPantalla() {
    let posicionCentral = this.getPosicionCentral();

    return {
      x: posicionCentral.x * this.juego.zoom + this.juego.containerPrincipal.x,
      y: posicionCentral.y * this.juego.zoom + this.juego.containerPrincipal.y,
    };
  }

  async crearSombra() {
    await PIXI.Assets.load({
      alias: "sombra",
      src: "assets/pixelart/sombra.png",
    });
    this.sombra = new PIXI.Sprite(PIXI.Assets.get("sombra"));

    this.sombra.zIndex = -1;
    this.sombra.anchor.set(0.5, 0.5);
    this.sombra.width = this.radio * 3;
    this.sombra.height = this.radio * 1.33;
    this.sombra.alpha = 0.8;
    this.container.addChild(this.sombra);
  }

  estoyVisibleEnPantalla(changui = 1) {
    //el changui es un multiplicador para el tamaño de pantalla
    //1 es el tamaño normal de la pantalla
    //2 es el doble, entonces es como si: si fuera el doble de grande, se veria en pantalla?
    let posicionEnPantalla = this.getPosicionEnPantalla();
    return (
      posicionEnPantalla.x > 0 - this.juego.width * (changui - 1) &&
      posicionEnPantalla.x < this.juego.width * changui &&
      posicionEnPantalla.y > 0 - this.juego.height * (changui - 1) &&
      posicionEnPantalla.y < this.juego.height * changui
    );
  }

  cambiarTintParaSimularIluminacion() {
    if (!this.juego.sistemaDeIluminacion?.isActivo()) {
      this.container.tint = 0xffffff;
      return;
    }
    const luz = this.calcularLuz();

    // Convertir luz (0-1) a valor de gris (0-255)
    const valorGris = Math.floor(luz * 255);
    // Crear color hexadecimal: 0xRRGGBB donde RR=GG=BB para gris
    const colorGris = (valorGris << 16) | (valorGris << 8) | valorGris;
    if (this instanceof Farol && this.sprite) this.sprite.tint = colorGris;
    else this.container.tint = colorGris;
  }

  calcularLuz() {
    let luz = 0;

    luz += this.juego.sistemaDeIluminacion.cantidadDeLuzDelDia;

    for (let farol of this.juego.faroles) {
      if (farol == this || farol.estado == 0) continue;
      const dist = calcularDistancia(farol.posicion, this.posicion);
      luz +=
        (farol.cantidadDeLuz *
          this.juego.distanciaALaQueLosObjetosTienenTodaLaLuz **
            this.juego.factorMagicoArriba) /
        dist ** this.juego.factorMagicoAbajo;
    }

    if (luz > 1) luz = 1;
    return luz;
  }

  calcularPosicionEnMundoNoIsometrico() {
    return isometricToCartesian(this.getPosicionCentral());
  }
}
