class SistemaDeIluminacion {
  constructor(juego) {
    this.juego = juego;
    this.activo = false;
    this.inicializado = false;
    this.graficoSombrasProyectadas = null;
    this.renderTexture = null;
    this.spriteDeIluminacion = null;
    this.containerParaRenderizar = null;
    this.spriteNegro = null;
    this.blurParaElGraficoDeSombrasProyectadas = null;

    this.inicializar();

    this.numeroDeDia = 0;
    this.minutoDelDia = 0;
    this.minutosPorDia = 1440;
    this.cantidadDeLuzDelDia = 0.5;
  }
  crearGraficoSombrasProyectadas() {
    // Crear el gráfico de sombras proyectadas
    this.graficoSombrasProyectadas = new PIXI.Graphics();
    this.graficoSombrasProyectadas.zIndex = 3; // Encima del fondo negro y los gradientes
    this.graficoSombrasProyectadas.label = "graficoSombrasProyectadas";
    // No necesita blendMode porque está dentro del containerParaRenderizar

    // Crear el filtro de blur para las sombras
    this.blurParaElGraficoDeSombrasProyectadas = new PIXI.BlurFilter({
      strength: 8,
      quality: 2,
      kernelSize: 5,
    });
    this.graficoSombrasProyectadas.filters = [
      this.blurParaElGraficoDeSombrasProyectadas,
    ];

    // Agregar al containerParaRenderizar en lugar del stage
    this.containerParaRenderizar.addChild(this.graficoSombrasProyectadas);
  }

  inicializar() {
    // Crear el sistema de iluminación después de un pequeño delay
    // para asegurarse de que los faroles estén cargados
    setTimeout(() => {
      this.crearSistemaDeIluminacionConRenderTexture();
      this.crearGraficoSombrasProyectadas(); // Debe ir después porque se agrega al containerParaRenderizar
      this.inicializado = true;
      this.toggle();
    }, 1000);
  }

  crearSistemaDeIluminacionConRenderTexture() {
    // Crear RenderTexture del tamaño de la pantalla
    this.renderTexture = PIXI.RenderTexture.create({
      width: this.juego.width,
      height: this.juego.height,
    });

    // Crear sprite que mostrará la RenderTexture
    this.spriteDeIluminacion = new PIXI.Sprite(this.renderTexture);
    this.spriteDeIluminacion.label = "spriteDeIluminacion";
    this.spriteDeIluminacion.zIndex = Z_INDEX.containerIluminacion;
    this.spriteDeIluminacion.blendMode = "multiply";
    this.spriteDeIluminacion.alpha = 0.99;
    this.juego.pixiApp.stage.addChild(this.spriteDeIluminacion);

    // Crear container temporal para renderizar (no se agrega al stage)
    this.containerParaRenderizar = new PIXI.Container();
    this.containerParaRenderizar.sortableChildren = true;

    // Crear el sprite negro de fondo
    this.spriteNegro = crearSpriteNegro(this.juego.width, this.juego.height);
    this.spriteNegro.label = "spriteNegro";
    this.spriteNegro.zIndex = 1;
    this.containerParaRenderizar.addChild(this.spriteNegro);

    // Crear sprites de gradiente para cada farol
    for (let farol of this.juego.faroles) {
      farol.spriteGradiente = crearSpriteConGradiente(farol.radioLuz, 0xffffcc);
      farol.spriteGradiente.zIndex = 2;
      this.containerParaRenderizar.addChild(farol.spriteGradiente);
    }

    // Establecer la visibilidad inicial
    this.spriteDeIluminacion.visible = this.activo;

    this.crearSpriteAmarilloParaElAtardecer();
  }
  crearSpriteAmarilloParaElAtardecer() {
    this.spriteAmarilloParaElAtardecer = new PIXI.Graphics();
    this.spriteAmarilloParaElAtardecer.label = "spriteAmarilloParaElAtardecer";
    this.spriteAmarilloParaElAtardecer.rect(
      0,
      0,
      this.juego.width,
      this.juego.height
    );
    this.spriteAmarilloParaElAtardecer.fill({
      color: 0xffcc00,
      alpha: 0.5,
    });

    this.spriteAmarilloParaElAtardecer.alpha = 0;
    this.spriteAmarilloParaElAtardecer.zIndex =
      Z_INDEX.spriteAmarilloParaElAtardecer;
    this.spriteAmarilloParaElAtardecer.blendMode = "multiply";
    this.juego.pixiApp.stage.addChild(this.spriteAmarilloParaElAtardecer);
  }

  redimensionarRenderTexture() {
    if (!this.renderTexture || !this.spriteDeIluminacion) return;

    // Destruir la RenderTexture anterior
    this.renderTexture.destroy(true);

    // Crear nueva RenderTexture con el nuevo tamaño
    this.renderTexture = PIXI.RenderTexture.create({
      width: this.juego.width,
      height: this.juego.height,
    });

    // Actualizar la textura del sprite
    this.spriteDeIluminacion.texture = this.renderTexture;

    // Recrear el sprite negro con el nuevo tamaño
    if (this.spriteNegro) {
      this.containerParaRenderizar.removeChild(this.spriteNegro);
      this.spriteNegro.destroy();
    }
    this.spriteNegro = crearSpriteNegro(this.juego.width, this.juego.height);
    this.spriteNegro.label = "spriteNegro";
    this.spriteNegro.zIndex = 1;
    this.containerParaRenderizar.addChild(this.spriteNegro);

    this.spriteAmarilloParaElAtardecer.width = this.juego.width;
    this.spriteAmarilloParaElAtardecer.height = this.juego.height;
  }

  avanzarDia() {
    this.minutoDelDia += this.juego.deltaTime * 0.01;
    if (this.minutoDelDia >= this.minutosPorDia) {
      this.minutoDelDia = 0;
      this.numeroDeDia++;
    }

    const cantidadDeLuzDelDiaProvisoria =
      -Math.cos((this.minutoDelDia / this.minutosPorDia) * Math.PI * 2) + 0.5;

    this.cantidadDeLuzDelDia = cantidadDeLuzDelDiaProvisoria;

    if (this.cantidadDeLuzDelDia > 1) this.cantidadDeLuzDelDia = 1;
    if (this.cantidadDeLuzDelDia < 0) this.cantidadDeLuzDelDia = 0;

    this.horaDelDia = this.minutoDelDia / 60;
  }

  prenderTodosLosFaroles() {
    for (let farol of this.juego.faroles) {
      farol.prender();
    }
  }
  apagarTodosLosFaroles() {
    for (let farol of this.juego.faroles) {
      farol.apagar();
    }
  }
  prenderOApagarTodosLosFarolesSegunLaHoraDelDia() {
    if (this.horaDelDia > 7 && this.horaDelDia < 7.2) {
      this.apagarTodosLosFaroles();
    } else if (this.horaDelDia > 18 && this.horaDelDia < 18.2) {
      this.prenderTodosLosFaroles();
    }
  }

  tick() {
    this.avanzarDia();
    this.actualizarSpriteAmarilloParaElAtardecer();
    this.prenderOApagarTodosLosFarolesSegunLaHoraDelDia();

    if (this.graficoSombrasProyectadas) {
      this.graficoSombrasProyectadas.clear();
    }

    if (this.activo) {
      this.actualizarGradientsDeLosFaroles();
      this.actualizarSpriteDeIluminacion();
    }
  }

  actualizarSpriteAmarilloParaElAtardecer() {
    if (!this.spriteAmarilloParaElAtardecer) return;
    const desde = 16;
    const hasta = 21;
    if (this.horaDelDia < desde || this.horaDelDia > hasta) {
      this.spriteAmarilloParaElAtardecer.alpha = 0;
      return;
    }

    const ratio = (this.horaDelDia - desde) / (hasta - desde);

    let valorAlpha = Math.sin(ratio * Math.PI);
    if (valorAlpha < 0) valorAlpha = 0;
    if (valorAlpha > 1) valorAlpha = 1;

    this.spriteAmarilloParaElAtardecer.alpha = valorAlpha;
  }

  actualizarSpriteDeIluminacion() {
    this.spriteDeIluminacion.alpha = 1 - this.cantidadDeLuzDelDia;

    // Renderizar el container en la RenderTexture
    this.juego.pixiApp.renderer.render({
      container: this.containerParaRenderizar,
      target: this.renderTexture,
      clear: true,
    });
  }

  actualizarGradientsDeLosFaroles() {
    for (let farol of this.juego.faroles) {
      if (!farol.estoyVisibleEnPantalla(1.33)) {
        farol.spriteGradiente.visible = false;
        continue;
      }

      farol.spriteGradiente.visible = true;
      const posicionEnPantalla = farol.getPosicionEnPantalla();
      farol.spriteGradiente.x = posicionEnPantalla.x;
      farol.spriteGradiente.y = posicionEnPantalla.y;
      farol.spriteGradiente.scale.set(this.juego.zoom);

      this.actualizarSombrasProyectadas(farol);
    }
  }

  toggle() {
    this.activo = !this.activo;

    // Alternar visibilidad del sprite de iluminación
    if (this.spriteDeIluminacion) {
      this.spriteDeIluminacion.visible = this.activo;
    }

    // Cambiar el tint de todos los objetos para simular iluminación
    for (let obj of [
      ...this.juego.autos,
      ...this.juego.personas,
      ...this.juego.arboles,
      ...this.juego.monumentos,
    ]) {
      obj.cambiarTintParaSimularIluminacion();
    }
  }

  // Método para obtener el estado actual de la iluminación
  isActivo() {
    return this.activo;
  }

  // Método para establecer el estado de la iluminación
  setActivo(valor) {
    if (this.activo !== valor) {
      this.toggle();
    }
  }

  actualizarSombrasProyectadas(farol) {
    // Obtener todos los objetos que pueden estar iluminados
    const todosLosObjetos = [
      ...this.juego.personas,
      //   ...this.juego.arboles,
      //   ...this.juego.autos,
      // ...this.juego.monumentos,
      // ...this.juego.objetosInanimados,
    ];

    const posDelFarol = farol.getPosicionEnPantalla();
    const zoom = this.juego.zoom;

    // Dibujar líneas a todos los objetos dentro del radioLuz
    for (let objeto of todosLosObjetos) {
      // Evitar dibujarse líneas a sí mismo si está en objetosInanimados
      if (objeto === farol) continue;
      if (!objeto.estoyVisibleEnPantalla(1)) continue;

      // Calcular distancia desde el farol hasta el objeto
      const distancia = calcularDistancia(farol.posicion, objeto.posicion);

      // Si el objeto está dentro del radioLuz, dibujar línea
      if (distancia <= farol.radioLuz) {
        // Calcular puntos tangentes al círculo del objeto
        const dx = objeto.posicion.x - farol.posicion.x;
        const dy = objeto.posicion.y - farol.posicion.y;
        const anguloAlCentro = Math.atan2(dy, dx);

        // Ángulo de las tangentes usando trigonometría: sin(θ) = radio_opuesto / hipotenusa
        const anguloTangente = Math.asin((objeto.radio * 0.66) / distancia);

        // Calcular los dos puntos tangentes
        const angulo1 = anguloAlCentro + anguloTangente;
        const angulo2 = anguloAlCentro - anguloTangente;

        // Distancia desde el farol hasta los puntos tangentes en el círculo
        const distanciaHastaTangente = Math.sqrt(
          distancia * distancia - objeto.radio * objeto.radio
        );
        // const posDelObjetoEnPantalla = objeto.getPosicionEnPantalla();
        // Puntos tangentes en el círculo del objeto (desde el farol)
        // Multiplicar distancias por zoom para convertir a coordenadas de pantalla
        const puntoTangente1x =
          posDelFarol.x + Math.cos(angulo1) * distanciaHastaTangente * zoom;
        const puntoTangente1y =
          posDelFarol.y + Math.sin(angulo1) * distanciaHastaTangente * zoom;
        const puntoTangente2x =
          posDelFarol.x + Math.cos(angulo2) * distanciaHastaTangente * zoom;
        const puntoTangente2y =
          posDelFarol.y + Math.sin(angulo2) * distanciaHastaTangente * zoom;

        // Extender las líneas tangentes hacia el lado opuesto al farol por la misma distancia
        const factorExtensionDeLaSombra =
          objeto.container.height * 0.66 + distancia * 0.1;
        const puntoFinal1x =
          puntoTangente1x +
          Math.cos(angulo1) * factorExtensionDeLaSombra * zoom;
        const puntoFinal1y =
          puntoTangente1y +
          Math.sin(angulo1) * factorExtensionDeLaSombra * zoom;
        const puntoFinal2x =
          puntoTangente2x +
          Math.cos(angulo2) * factorExtensionDeLaSombra * zoom;
        const puntoFinal2y =
          puntoTangente2y +
          Math.sin(angulo2) * factorExtensionDeLaSombra * zoom;

        // Dibujar el trapecio de sombra proyectada

        // Calcular punto de control para la curva (más alejado del farol)
        const centroX = (puntoFinal1x + puntoFinal2x) / 2;
        const centroY = (puntoFinal1y + puntoFinal2y) / 2;
        const extensionCurva = objeto.radio + distancia * 0.15; // Factor para que la curva sea sutil
        const puntoControlX =
          centroX + Math.cos(anguloAlCentro) * extensionCurva * zoom;
        const puntoControlY =
          centroY + Math.sin(anguloAlCentro) * extensionCurva * zoom;

        this.graficoSombrasProyectadas.moveTo(puntoTangente1x, puntoTangente1y);
        this.graficoSombrasProyectadas.lineTo(puntoFinal1x, puntoFinal1y);

        // Dibujar curva en lugar de línea recta para el lado alejado
        this.graficoSombrasProyectadas.quadraticCurveTo(
          puntoControlX,
          puntoControlY, // Punto de control de la curva
          puntoFinal2x,
          puntoFinal2y // Punto final de la curva
        );

        this.graficoSombrasProyectadas.lineTo(puntoTangente2x, puntoTangente2y);

        // Calcular punto de control para la curva del lado cercano al farol
        const centroTangenteX = (puntoTangente1x + puntoTangente2x) / 2;
        const centroTangenteY = (puntoTangente1y + puntoTangente2y) / 2;
        const extensionCurvaCercana = objeto.radio; // Curva más sutil en el lado cercano
        const puntoControlCercanoX =
          centroTangenteX -
          Math.cos(anguloAlCentro) * extensionCurvaCercana * zoom;
        const puntoControlCercanoY =
          centroTangenteY -
          Math.sin(anguloAlCentro) * extensionCurvaCercana * zoom;

        // Dibujar curva para conectar de vuelta al punto inicial
        this.graficoSombrasProyectadas.quadraticCurveTo(
          puntoControlCercanoX,
          puntoControlCercanoY, // Punto de control de la curva cercana
          puntoTangente1x,
          puntoTangente1y // Punto inicial
        );

        let cantDeSombra = (farol.radioLuz ** 1.5 / distancia ** 2) * 0.33;
        if (cantDeSombra > 0.33) cantDeSombra = 0.33;
        if (cantDeSombra < 0) cantDeSombra = 0;

        this.graficoSombrasProyectadas.fill({
          color: 0x000000,
          alpha: cantDeSombra,
        });

        // if (this.juego.stroke) this.graficoSombrasProyectadas.stroke();
      }
    }
  }
}
