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
    juego.gameObjects.push(this);
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
    if (!this.sprite) return;
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

    if (
      laDistanciaEntreDosObjetosEsMayorQue(
        this.posicion,
        this.target.posicion,
        this.vision
      ) ||
      laDistanciaEntreDosObjetosEsMenorQue(
        this.posicion,
        this.target.posicion,
        this.rangoDeAtaque
      )
    )
      return;

    const dist = calcularDistancia(this.posicion, this.target.posicion);
    this.distanciaAlTarget = dist;

    // Vector de dirección hacia el objetivo
    const difX = this.target.posicion.x - this.posicion.x;
    const difY = this.target.posicion.y - this.posicion.y;

    // Normalizar el vector para obtener solo la dirección (magnitud = 1)
    // Usar VectorPool para cálculo temporal
    const vectorNuevo = VectorPool.get(difX, difY);
    vectorNuevo.limit(1);

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

    VectorPool.release(vectorNuevo);
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
    if (
      laDistanciaEntreDosObjetosEsMayorQue(
        this.posicion,
        this.perseguidor.posicion,
        this.vision
      )
    )
      return;

    // Vector hacia el perseguidor
    const difX = this.perseguidor.posicion.x - this.posicion.x;
    const difY = this.perseguidor.posicion.y - this.posicion.y;

    // Usar VectorPool para cálculo temporal
    const vectorNuevo = VectorPool.get(difX, difY);
    vectorNuevo.limit(1);

    // Aplicar fuerza en dirección opuesta (huir)
    this.aceleracion.x += -vectorNuevo.x * this.factorEscapar;
    this.aceleracion.y += -vectorNuevo.y * this.factorEscapar;

    VectorPool.release(vectorNuevo);
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

  cambiarAlphaDeLaSombra(alpha) {
    if (!this.sombra) return;
    this.sombra.alpha = alpha * 0.6 + 0.2;
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
  actualizarSiEstoyVisibleEnLaPantalla() {
    this.estoyVisibleEnLaPantallaEnEsteFrame = this.estoyVisibleEnPantalla(1.3);
  }

  cambiarTintParaSimularIluminacion() {
    if (!this.sprite || !this.container) return;
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

  /**
   * OPTIMIZADO: Calcular luz usando grilla espacial
   * Solo considera faroles cercanos en lugar de todos
   */
  calcularLuz() {
    let luz = 0;

    luz += this.juego.sistemaDeIluminacion.cantidadDeLuzDelDia;

    // OPTIMIZACIÓN: Usar grilla para encontrar solo faroles cercanos
    const farolesCercanos = this.obtenerFarolesCercanos();

    for (let farol of farolesCercanos) {
      if (farol.estado == 0) continue;
      const dist = calcularDistanciaCuadrada(farol.posicion, this.posicion);
      luz +=
        (farol.cantidadDeLuz *
          this.juego.distanciaALaQueLosObjetosTienenTodaLaLuz **
            this.juego.factorMagicoArriba) /
        (dist * 5);
    }

    if (luz > 1) luz = 1;
    return luz;
  }

  /**
   * Obtener faroles cercanos usando la grilla espacial
   * OPTIMIZADO: Usa Set específico de emisores de luz en lugar de filtrar todas las entidades
   */
  obtenerFarolesCercanos() {
    if (!Juego.CONFIG.usar_grilla || !this.celdaActual) {
      // Fallback: devolver todos los faroles
      return this.juego.cosasQueDanLuz;
    }

    // Buscar en un radio suficiente para cubrir la luz más lejana posible
    const radioMaximoLuz = 400; // Ajustar según el radioLuz máximo de los faroles
    const celdasABuscar = Math.ceil(
      radioMaximoLuz / this.juego.grilla.anchoCelda
    );

    // OPTIMIZACIÓN: Acceso directo al Set de emisores de luz (O(1))
    // En lugar de filtrar todas las entidades (O(n))
    return this.celdaActual.obtenerEmisoresLuzCercanos(celdasABuscar);
  }

  /**
   * NUEVO APPROACH: Calcular sombras desde la perspectiva del objeto
   * Este método es llamado por el sistema de iluminación para cada objeto visible
   */
  calcularYCrearSombrasProyectadas(sistemaIluminacion) {
    // Solo personas proyectan sombras (por ahora)
    if (!(this instanceof Persona)) return;
    if (this.muerto) return;
    if (!this.estoyVisibleEnLaPantallaEnEsteFrame) return;

    const MAX_SOMBRAS_POR_OBJETO = Juego.CONFIG.max_sombras_por_objeto || 3;
    const MAX_ALPHA_TOTAL = 0.8;

    // Resetear tracking de sombras para este frame
    this.alphaAcumuladoDeSombras = 0;
    if (!this.misSombrasProyectadas) this.misSombrasProyectadas = [];

    // Obtener faroles cercanos
    let farolesCercanos = this.obtenerFarolesCercanos().filter(
      (farol) =>
        farol.estado !== 0 &&
        laDistanciaEntreDosObjetosEsMenorQue(
          this.posicion,
          farol.posicion,
          farol.radioLuz
        )
    );

    // Si no hay faroles cercanos, no hay sombras
    if (farolesCercanos.length === 0) return;

    // Ordenar por distancia (más cercano primero = sombra más intensa)
    farolesCercanos.sort((a, b) => {
      const distA = calcularDistanciaCuadrada(this.posicion, a.posicion);
      const distB = calcularDistanciaCuadrada(this.posicion, b.posicion);
      return distA - distB;
    });

    // Limitar cantidad de faroles a procesar
    const farolesAProcesar = farolesCercanos.slice(0, MAX_SOMBRAS_POR_OBJETO);

    const zoom = this.juego.zoom;

    // Crear sombra para cada farol
    for (let farol of farolesAProcesar) {
      // Si ya alcanzamos el límite de alpha, detener
      if (this.alphaAcumuladoDeSombras >= MAX_ALPHA_TOTAL) break;

      const distancia = calcularDistancia(farol.posicion, this.posicion);
      if (distancia <= 0 || distancia > farol.radioLuz) continue;

      // Obtener sprite del pool
      const spriteSombra = sistemaIluminacion.obtenerSpriteSombraDelPool();
      if (!spriteSombra) continue;

      this.misSombrasProyectadas.push(spriteSombra);

      // Calcular ángulo de la sombra (del farol al objeto)
      const dx = farol.posicion.x - this.posicion.x;
      const dy = farol.posicion.y - this.posicion.y;
      const anguloRadianes = Math.atan2(dy, dx);

      // Posicionar la sombra
      const posObjeto = this.getPosicionEnPantalla();
      const offsetCerca = 10 * zoom;
      spriteSombra.x = posObjeto.x + Math.cos(anguloRadianes) * offsetCerca;
      spriteSombra.y = posObjeto.y + Math.sin(anguloRadianes) * offsetCerca;

      // Rotar según dirección de la luz
      spriteSombra.rotation = anguloRadianes + Math.PI / 2;

      // Escalar según distancia
      const longitudBase = 1.0;
      const factorDistancia = Math.min(distancia / farol.radioLuz, 1);
      const longitudSombra = longitudBase + factorDistancia * 1.5;
      const anchoSombra = this.radio / 10;

      const compensacionEscala = 1 / Juego.CONFIG.escala_textura_sombras;
      spriteSombra.scale.set(
        anchoSombra * 0.5 * zoom * compensacionEscala,
        longitudSombra * 0.5 * zoom * compensacionEscala
      );

      // Calcular alpha según distancia
      let cantDeSombra = (farol.radioLuz ** 1.5 / distancia ** 2) * 0.33;
      if (cantDeSombra > 0.4) cantDeSombra = 0.4;
      if (cantDeSombra < 0.05) cantDeSombra = 0.05;

      // Ajustar para no superar el límite de alpha
      const alphaDisponible = MAX_ALPHA_TOTAL - this.alphaAcumuladoDeSombras;
      if (cantDeSombra > alphaDisponible) {
        cantDeSombra = alphaDisponible;
      }

      spriteSombra.alpha = cantDeSombra;
      this.alphaAcumuladoDeSombras += cantDeSombra;
      spriteSombra.zIndex = 3;
    }
  }

  calcularPosicionEnMundoNoIsometrico() {
    return isometricToCartesian(this.getPosicionCentral());
  }

  actualizarMiPosicionEnLaGrilla() {
    if (!Juego.CONFIG.usar_grilla) return;
    let nuevaCelda = this.juego.grilla.obtenerCeldaEnPosicion(
      this.posicion.x,
      this.posicion.y
    );

    // Si es la misma celda que en el frame anterior, no hacer nada
    if (this.celdaActual === nuevaCelda) {
      return;
    }

    // Sacar de la celda anterior si existe
    if (this.celdaActual) {
      this.celdaActual.sacame(this);
    }

    // Agregar a la nueva celda
    nuevaCelda.agregame(this);

    this.celdaFrameAnterior = this.celdaActual;
    this.celdaActual = nuevaCelda;
  }

  esMiNumeroDeFrame(num = 10) {
    return this.juego.FRAMENUM % num == this.id % num;
  }

  serializar() {
    return {
      clase: this.constructor.name,
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      bando: this.bando,
      vida: this.vida,
      vidaMaxima: this.vidaMaxima,
      radio: this.radio,
      rangoDeAtaque: this.rangoDeAtaque,
      vision: this.vision,
      factorPerseguir: this.factorPerseguir,
      posicion: this.posicion,
      velocidad: this.velocidad,
      aceleracionMaxima: this.aceleracionMaxima,
      velocidadMaxima: this.velocidadMaxima,
    };
  }
}
