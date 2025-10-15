class Persona extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.container.label = "persona - " + this.id;
    this.noPuedoPegarPeroEstoyEnCombate = false;
    this.muerto = false;
    this.bando = 0; //bando default

    this.nombre = generateName();

    this.rateOfFire = 600; //medido en milisegundos
    this.ultimoGolpe = 0;

    this.coraje = Math.random();
    this.vision = Math.random() * 400 + 400;

    this.fuerzaDeAtaque = 0.05 + Math.random() * 0.05;
    this.radio = 7 + Math.random() * 3;
    this.rangoDeAtaque = this.radio * 3;

    this.factorPerseguir = 0.15;
    this.factorEscapar = 0.1;

    this.factorSeparacion = 0.5;
    this.factorCohesion = 0.2;
    this.factorAlineacion = 0.4;

    this.factorRepelerSuavementeObstaculos = 1;

    this.aceleracionMaxima = 0.2;
    this.velocidadMaxima = 3;
    this.amigos = [];

    this.crearSombra();
    this.esperarAQueTengaSpriteCargado(() => {
      this.crearGloboDeDialogo();
      this.crearFSMparaAnimacion();
    });
  }

  crearFSMparaAnimacion() {
    this.animationFSM = new FSM(this, {
      states: {
        idle: IdleAnimationState,
        walk: WalkAnimationState,
        run: RunAnimationState,
        pegar: PegarAnimationState,
        convertirse: ConvertirseAnimationState,
      },
      initialState: "idle",
    });
  }

  evaluarSiMeConviertoEnAmigo() {
    if (this.vida > 0.2 || this.vida < 0.1) return;
    if (this.enemigosCerca.length < this.amigosCerca.length) return;
    if (Math.random() > 0.3) return;
    if (!this.enemigoMasCerca) return;
    if (this.behaviorFSM.currentStateName === "pasadoDeBando") return;

    this.pasarseDeBando(this.enemigoMasCerca.bando);
  }

  hablar(emoji) {
    if (this.hablarTimeout) clearTimeout(this.hablarTimeout);
    this.containerDialogo.visible = true;
    this.textoDeDialogo.text = emoji;
    this.hablarTimeout = setTimeout(() => {
      this.containerDialogo.visible = false;
    }, 1000);
  }

  async crearGloboDeDialogo() {
    this.containerDialogo = new PIXI.Container();
    this.containerDialogo.visible = false;
    this.containerDialogo.y = -this.sprite.height * 0.75;
    this.containerDialogo.zIndex = 9;
    this.containerDialogo.label = "containerDialogo";
    this.container.addChild(this.containerDialogo);
    this.globoDeDialogo = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/globo_de_dialogo.png")
    );
    this.globoDeDialogo.anchor.set(0.6, 1);
    this.globoDeDialogo.scale.set(0.75, 1);

    this.containerDialogo.addChild(this.globoDeDialogo);

    this.textoDeDialogo = new PIXI.Text({
      text: "😊",
      style: {
        fontSize: 18,
        fill: 0xffffff,
        align: "center",
      },
    });
    this.textoDeDialogo.anchor.set(0.5, 1);
    this.textoDeDialogo.y = -15;
    this.textoDeDialogo.x = -4;
    this.textoDeDialogo.label = "textoDeDialogo";
    this.containerDialogo.addChild(this.textoDeDialogo);
  }

  pasarseDeBando(cualBando) {
    const pos = this.posicion;

    this.borrar();
    let amigo;
    if (cualBando == 1) {
      amigo = this.juego.crearUnAmigo(pos.x, pos.y);
    } else {
      amigo = this.juego.crearUnEnemigo(cualBando, pos.x, pos.y);
    }

    amigo.id = this.id;
    amigo.vida = this.vida;
    amigo.coraje = this.coraje;
    amigo.vision = this.vision;
    amigo.nombre = this.nombre;

    amigo.behaviorFSM.setState("pasadoDeBando");
  }

  buscarPersonasDeMiBando() {
    return this.juego.personas.filter(
      (persona) => persona.bando === this.bando && !persona.muerto
    );
  }

  buscarEnemigos() {
    return this.juego.personas.filter(
      (persona) =>
        !persona.muerto &&
        persona.bando !== this.bando &&
        persona.bando != "policia" &&
        persona.bando != "civil"
    );
  }

  getPersonasCerca() {
    const cantDeCeldasQuePuedoVer = Math.ceil(
      this.vision / this.juego.grilla.anchoCelda
    );
    // console.log(
    //   "cantDeCeldasQuePuedoVer",
    //   cantDeCeldasQuePuedoVer,
    //   this.nombre,
    //   this.vision,
    //   this.juego.grilla.anchoCelda
    // );
    const personasQueEstanEnMisCeldasVecinas =
      this.celdaActual.obtenerEntidadesAcaYEnCEldasVecinas(
        cantDeCeldasQuePuedoVer
      );

    return personasQueEstanEnMisCeldasVecinas.filter(
      (persona) =>
        calcularDistancia(this.posicion, persona.posicion) < this.vision &&
        !persona.muerto
    );
  }

  getPersonasCercaVIEJO() {
    return this.juego.personas.filter(
      (persona) =>
        calcularDistancia(this.posicion, persona.posicion) < this.vision &&
        !persona.muerto
    );
  }

  getAmigosCerca() {
    return this.personasCerca.filter((persona) =>
      this.amigos.includes(persona)
    );
  }

  getEnemigosCerca() {
    return this.personasCerca.filter((persona) =>
      this.enemigos.includes(persona)
    );
  }

  buscarObstaculosBienCerquitaMio() {
    this.obstaculosCercaMio = [];
    this.obstaculosConLosQueMeEstoyChocando = [];
    const obstaculosCercasegunLaGrilla = this.celdaActual
      .obtenerEntidadesAcaYEnCEldasVecinas(1)
      .filter((k) => this.juego.obstaculos.includes(k));

    for (let obstaculo of obstaculosCercasegunLaGrilla) {
      const dist = calcularDistancia(
        this.posicion,
        obstaculo.getPosicionCentral()
      );

      const distDeColision = this.radio + obstaculo.radio;
      const distConChangui = distDeColision + this.radio * 10;
      if (dist < distConChangui && dist > distDeColision) {
        this.obstaculosCercaMio.push(obstaculo);
      } else if (dist < distDeColision) {
        this.obstaculosConLosQueMeEstoyChocando.push(obstaculo);
      }
    }
  }

  repelerSuavementeObstaculos() {
    if (this.obstaculosCercaMio.length == 0) return;

    const posicionFutura = {
      x: this.posicion.x + this.velocidad.x * 10,
      y: this.posicion.y + this.velocidad.y * 10,
    };

    let fuerzaRepulsionTotal = { x: 0, y: 0 };

    for (let obstaculo of this.obstaculosCercaMio) {
      const posicionObstaculo = obstaculo.getPosicionCentral();

      // Vector que apunta del obstáculo hacia mi posición futura
      const vectorRepulsion = limitarVector({
        x: posicionFutura.x - posicionObstaculo.x,
        y: posicionFutura.y - posicionObstaculo.y,
      });
      const distancia = Math.sqrt(
        vectorRepulsion.x * vectorRepulsion.x +
          vectorRepulsion.y * vectorRepulsion.y
      );

      // Calcular fuerza inversamente proporcional a la distancia
      // Cuanto más cerca, más fuerza (usando 1/distancia)
      const fuerzaBase = 3; // Factor base de repulsión
      const distanciaMinima = 10; // Distancia mínima para evitar fuerzas extremas
      const fuerzaRepulsion = fuerzaBase / Math.max(distancia, distanciaMinima);

      // Aplicar la fuerza de repulsión
      fuerzaRepulsionTotal.x += vectorRepulsion.x * fuerzaRepulsion;
      fuerzaRepulsionTotal.y += vectorRepulsion.y * fuerzaRepulsion;
    }

    // Aplicar la fuerza total a la aceleración
    this.aceleracion.x +=
      fuerzaRepulsionTotal.x * this.factorRepelerSuavementeObstaculos;
    this.aceleracion.y +=
      fuerzaRepulsionTotal.y * this.factorRepelerSuavementeObstaculos;
  }
  percibirEntorno() {
    // mirar alrededor
    //todos los enemigos
    this.enemigos = this.buscarEnemigos();
    //todos los amigos
    this.amigos = this.buscarPersonasDeMiBando();

    //todas las personas en mi rango de vision
    this.personasCerca = this.getPersonasCerca();
    //de esas personas cuales son amigas
    this.amigosCerca = this.getAmigosCerca();
    //de esas personas cuales son enemigos
    this.enemigosCerca = this.getEnemigosCerca();
    //de los enemigos cerca, el mas cercano
    this.enemigoMasCerca = this.buscarEnemigoMasCerca();

    this.buscarObstaculosBienCerquitaMio();
  }

  noChocarConObstaculos() {
    if (this.obstaculosConLosQueMeEstoyChocando.length == 0) return;
    const posicionFutura = {
      x: this.posicion.x + this.velocidad.x,
      y: this.posicion.y + this.velocidad.y,
    };

    for (let obstaculo of this.obstaculosConLosQueMeEstoyChocando) {
      const posicionObstaculo = obstaculo.getPosicionCentral();
      const vectorRepulsion = {
        x: posicionFutura.x - posicionObstaculo.x,
        y: posicionFutura.y - posicionObstaculo.y,
      };

      this.aceleracion.x += vectorRepulsion.x;
      this.aceleracion.y += vectorRepulsion.y;
    }
  }

  tick() {
    console.warn("cada clase deberia implementar su propio tick");
  }
  calcularAnguloYVelocidadLineal() {
    /**
     * CÁLCULO DE PARÁMETROS DE ANIMACIÓN
     *
     * Ángulo de movimiento:
     * - atan2(y,x) devuelve el ángulo en radianes del vector velocidad
     * - Se suma 180° para ajustar la orientación del sprite
     * - Conversión a grados para facilitar el trabajo con animaciones
     *
     * Velocidad lineal (magnitud del vector):
     * - |v| = √(vx² + vy²)
     * - Se calcula como distancia desde el origen (0,0)
     * - Usado para determinar qué animación reproducir (idle/walk/run)
     */
    this.angulo =
      radianesAGrados(Math.atan2(this.velocidad.y, this.velocidad.x)) + 180;
    this.velocidadLineal = calcularDistancia(this.velocidad, { x: 0, y: 0 });
  }

  async crearSpritesheetAnimado(bando) {
    this.sprite = (
      await AnimatedCharacter.CreateCharacterFromMegaSpritesheet(
        `assets/pixelart/personajes/${bando}.png`,
        64,
        64
      )
    ).character;

    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(0.85, 0.85);
    this.sprite.label = "animatedSprite" + this.id;

    this.container.addChild(this.sprite);
  }

  alineacion() {
    let cont = 0;
    let vectorPromedioDeVelocidades = { x: 0, y: 0 };
    for (const persona of this.amigosCerca) {
      if (persona !== this) {
        const distancia = calcularDistancia(this.posicion, persona.posicion);
        if (distancia < this.vision) {
          cont++;
          vectorPromedioDeVelocidades.x += persona.velocidad.x;
          vectorPromedioDeVelocidades.y += persona.velocidad.y;
        }
      }
    }
    if (cont == 0) return;

    vectorPromedioDeVelocidades.x /= cont;
    vectorPromedioDeVelocidades.y /= cont;

    let vectorNuevo = {
      x: vectorPromedioDeVelocidades.x - this.velocidad.x,
      y: vectorPromedioDeVelocidades.y - this.velocidad.y,
    };
    vectorNuevo = limitarVector(vectorNuevo, 1);
    this.aceleracion.x += this.factorAlineacion * vectorNuevo.x;
    this.aceleracion.y += this.factorAlineacion * vectorNuevo.y;
  }

  cohesion() {
    let cont = 0;
    //verctor vacio donde vamos a ir sumando posiciones
    let vectorPromedioDePosiciones = { x: 0, y: 0 };
    //iteramos por todos los amigos

    for (const persona of this.amigosCerca) {
      if (persona === this || persona === this.juego.protagonista) continue;
      //si la persona ota no soy yo y no es el protagonista
      const distancia = calcularDistancia(this.posicion, persona.posicion);
      const sumaDeRadios = this.radio + persona.radio;
      const distanciaMinima = sumaDeRadios * 3;
      if (distancia < this.vision && distancia > distanciaMinima) {
        //si la persona esta muy cerca no nos acercamos a ella
        cont++;
        vectorPromedioDePosiciones.x += persona.posicion.x;
        vectorPromedioDePosiciones.y += persona.posicion.y;
      }
    }
    if (cont == 0) return;

    vectorPromedioDePosiciones.x /= cont;
    vectorPromedioDePosiciones.y /= cont;

    let vectorNuevo = limitarVector({
      x: vectorPromedioDePosiciones.x - this.posicion.x,
      y: vectorPromedioDePosiciones.y - this.posicion.y,
    });

    const distanciaAlPromedioDePosiciones = calcularDistancia(
      this.posicion,
      vectorPromedioDePosiciones
    );

    const distanciaMinima = this.radio * 14;
    if (distanciaAlPromedioDePosiciones < distanciaMinima) return;

    const factorDistancia = distanciaAlPromedioDePosiciones / distanciaMinima;
    vectorNuevo.x *= factorDistancia;
    vectorNuevo.y *= factorDistancia;

    this.aceleracion.x += this.factorCohesion * vectorNuevo.x;
    this.aceleracion.y += this.factorCohesion * vectorNuevo.y;
  }

  separacion() {
    const personasEnMiCeldaYAlrededores =
      this.celdaActual.obtenerEntidadesAcaYEnCEldasVecinas(1); //this.juego.personas;

    for (const persona of personasEnMiCeldaYAlrededores) {
      if (persona == this) continue;
      const distancia = calcularDistancia(this.posicion, persona.posicion);
      if (distancia > this.radio + persona.radio) continue;
      let vectorNuevo = {
        x: this.posicion.x - persona.posicion.x,
        y: this.posicion.y - persona.posicion.y,
      };

      this.aceleracion.x += vectorNuevo.x;
      this.aceleracion.y += vectorNuevo.y;
    }
  }

  siEstoyPeleandoMirarHaciaMiOponente() {
    if (!this.enemigoMasCerca) return;
    if (!this.behaviorFSM) return;
    if (this.behaviorFSM.currentStateName !== "enCombate") return;
    if (this.distanciaAlEnemigoMasCerca > this.rangoDeAtaque) return;

    this.angulo =
      radianesAGrados(
        Math.atan2(
          this.enemigoMasCerca.posicion.y - this.posicion.y,
          this.enemigoMasCerca.posicion.x - this.posicion.x
        )
      ) + 180;
  }
  verificarSiEstoyMuerto() {
    if (this.vida <= 0) {
      this.morir();
      return;
    }

    this.vida += 0.0001;
    if (this.vida > this.vidaMaxima) this.vida = this.vidaMaxima;
  }

  quitarSombra() {
    if (this.sombra) {
      this.container.removeChild(this.sombra);
      this.sombra.destroy();
      this.sombra = null;
    }
  }

  morir() {
    if (this.muerto) return;
    if (this.animationFSM) this.animationFSM.destroy();
    this.container.label = "persona muerta - " + this.id;
    this.quitarSombra();
    this.quitarBarritaVida();
    this.sprite.changeAnimation("hurt");
    this.sprite.loop = false;
    // Marcar como muerto PRIMERO para evitar que se actualice la barra durante el proceso
    this.muerto = true;

    // this.render();
    // Limpiar la barra de vida DESPUÉS de marcar como muerto

    this.borrarmeComoTargetDeTodos();
    this.quitarmeDeLosArrays();
  }

  quitarmeDeLosArrays() {
    // console.log("quitarmeDeLosArrays", this.id);
    this.juego.personas = this.juego.personas.filter(
      (persona) => persona !== this
    );
    this.juego.enemigos = this.juego.enemigos.filter(
      (persona) => persona !== this
    );
    this.juego.amigos = this.juego.amigos.filter((persona) => persona !== this);

    this.juego.policias = this.juego.policias.filter(
      (persona) => persona !== this
    );

    this.juego.civiles = this.juego.civiles.filter(
      (persona) => persona !== this
    );
  }

  pegarSiEstaEnMiRango() {
    if (
      this.enemigoMasCerca &&
      this.distanciaAlEnemigoMasCerca < this.rangoDeAtaque
    ) {
      if (this.puedoPegar()) {
        this.pegar(this.enemigoMasCerca);
        this.noPuedoPegarPeroEstoyEnCombate = false;
      } else {
        this.noPuedoPegarPeroEstoyEnCombate = true;
      }
    } else {
      this.noPuedoPegarPeroEstoyEnCombate = false;
    }

    if (this.noPuedoPegarPeroEstoyEnCombate) {
      this.velocidad.x *= 0.1;
      this.velocidad.y *= 0.1;
      this.aceleracion.x *= 0.5;
      this.aceleracion.y *= 0.5;
    }
  }
  puedoPegar() {
    return performance.now() > this.rateOfFire + this.ultimoGolpe;
  }

  pegar(enemigo) {
    enemigo.recibirDanio(this.fuerzaDeAtaque, this);
    this.ultimoGolpe = performance.now();

    if (this.animationFSM) this.animationFSM.setState("pegar");
  }

  recibirDanio(danio, deQuien) {
    this.vida -= danio;
    this.juego.particleSystem.hacerQueLeSalgaSangreAAlguien(this, deQuien);
  }

  caminarSinRumbo() {
    if (!this.container || !this.sprite) return;

    if (!this.targetRandom) {
      this.targetRandom = {
        posicion: {
          x: this.juego.anchoDelMapa * Math.random(),
          y: this.juego.altoDelMapa * Math.random(),
        },
      };
    }

    if (
      calcularDistancia(this.posicion, this.targetRandom.posicion) <
      this.distanciaParaLlegarALTarget
    ) {
      this.targetRandom = null;
    }

    if (!this.targetRandom) return;
    if (
      isNaN(this.targetRandom.posicion.x) ||
      isNaN(this.targetRandom.posicion.y)
    )
      debugger;

    // Vector de dirección hacia el objetivo
    const difX = this.targetRandom.posicion.x - this.posicion.x;
    const difY = this.targetRandom.posicion.y - this.posicion.y;

    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    // Aplicar fuerza de persecución escalada por el factor específico del objeto
    this.aceleracion.x += vectorNuevo.x * this.factorPerseguir;
    this.aceleracion.y += vectorNuevo.y * this.factorPerseguir;
  }

  buscarEnemigoMasCerca() {
    /**
     * ALGORITMO DE BÚSQUEDA DEL ENEMIGO MÁS CERCANO
     *
     * Implementa búsqueda lineal optimizada:
     * 1. Inicializar con distancia infinita
     * 2. Iterar por todos los enemigos
     * 3. Calcular distancia euclidiana: d = √((x₂-x₁)² + (y₂-y₁)²)
     * 4. Filtrar por rango de visión
     * 5. Mantener el mínimo encontrado
     *
     * Complejidad: O(n) donde n = número de enemigos
     *
     * Optimización futura posible: Spatial hashing o Quadtree
     * para reducir a O(log n) en escenarios con muchos agentes
     */
    let enemigoMasCerca = null;
    let distanciaMasCerca = Infinity;

    for (let i = 0; i < this.enemigosCerca.length; i++) {
      const enemigo = this.enemigosCerca[i];
      const distancia = calcularDistancia(this.posicion, enemigo.posicion);

      // Actualizar si es más cercano Y está dentro del rango de visión
      if (distancia < distanciaMasCerca && distancia < this.vision) {
        distanciaMasCerca = distancia;
        enemigoMasCerca = enemigo;
      }
    }
    this.distanciaAlEnemigoMasCerca = distanciaMasCerca;
    return enemigoMasCerca;
  }

  cambiarDeAnimacionSegunLaVelocidadYAngulo() {
    if (this.angulo == undefined) {
      return;
    }

    // if (this.muerto) {
    //   this.sprite.changeAnimation("hurt");
    //   // this.sprite.anchor.set(0.5, 0);
    //   // this.sprite.y = -this.sprite.height;
    //   this.sprite.loop = false;
    //   return;
    // }

    // if (this.recienConvertido) {
    //   this.sprite.changeAnimation("spellcast");
    //   this.sprite.loop = false;
    //   return;
    // }

    // if (this.pegando) {
    //   this.sprite.changeAnimation("slash");
    //   this.velocidad.x *= 0.5;
    //   this.velocidad.y *= 0.5;
    //   return;
    // } else if (this.noPuedoPegarPeroEstoyEnCombate) {
    //   this.sprite.changeAnimation("combat");
    //   this.velocidad.x *= 0.7;
    //   this.velocidad.y *= 0.7;
    //   return;
    // }

    // if (this.velocidadLineal > this.velocidadMaxima * 0.7) {
    //   this.sprite.changeAnimation("run");
    //   this.sprite.animationSpeed =
    //     (0.25 * this.velocidadLineal) / this.velocidadMaxima;
    // } else if (this.velocidadLineal > 0.1) {
    //   this.sprite.changeAnimation("walk");
    //   this.sprite.animationSpeed =
    //     0.05 + (0.3 * this.velocidadLineal) / this.velocidadMaxima;
    // } else {
    //   this.sprite.changeAnimation("idle");
    // }

    /**
     * MAPEO DE DIRECCIÓN CARDINAL
     *
     * Divide el espacio en 4 sectores de 90°:
     * - Sector 1: [315°, 45°) → Derecha (sprite: "left")
     * - Sector 2: [45°, 135°) → Abajo (sprite: "up")
     * - Sector 3: [135°, 225°) → Izquierda (sprite: "right")
     * - Sector 4: [225°, 315°) → Arriba (sprite: "down")
     *
     * Nota: Las direcciones del sprite están invertidas debido al
     * sistema de coordenadas y la orientación del spritesheet
     */
    if (this.angulo >= 315 || this.angulo < 45) {
      this.sprite.changeDirection("left");
    } else if (this.angulo >= 45 && this.angulo < 135) {
      this.sprite.changeDirection("up");
    } else if (this.angulo >= 135 && this.angulo < 225) {
      this.sprite.changeDirection("right");
    } else if (this.angulo >= 225 && this.angulo < 315) {
      this.sprite.changeDirection("down");
    }
  }

  render() {
    /**
     * RENDERIZADO CON ORDENAMIENTO EN PROFUNDIDAD
     *
     * 1. Verificaciones de seguridad
     * 2. Sincronización física-visual (super.render())
     * 3. Actualización del sistema de animación

     */
    if (!this.container || !this.sprite) return;
    super.render();

    this.cambiarDeAnimacionSegunLaVelocidadYAngulo();
  }

  borrar() {
    this.juego.containerPrincipal.removeChild(this.container);
    this.quitarBarritaVida();
    this.borrarmeComoTargetDeTodos();
    this.quitarmeDeLosArrays();
    this.container.parent = null;
    this.container = null;
    this.sprite = null;
    if (this.behaviorFSM) this.behaviorFSM.destroy();
    this.behaviorFSM = null;
    if (this.animationFSM) this.animationFSM.destroy();
    this.animationFSM = null;
  }
}
