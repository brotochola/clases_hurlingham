class Farol extends EntidadEstatica {
  constructor(x, y, juego, tipo, scaleX) {
    super(x, y, juego);
    this.radioLuz = 500;
    this.radio = 10;
    this.tipo = tipo || Math.floor(Math.random() * 2) + 1;
    this.scaleX = scaleX || 1;
    this.container.label = "arbol" + this.id;
    this.crearSprite();
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("/assets/pixelart/farol" + this.tipo + ".png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {}

  actualizarLineas() {
    // Obtener todos los objetos que pueden estar iluminados
    const todosLosObjetos = [
      ...this.juego.personas,
      // ...this.juego.arboles,
      // ...this.juego.autos,
      // ...this.juego.monumentos,
      // ...this.juego.objetosInanimados,
    ];

    // Dibujar líneas a todos los objetos dentro del radioLuz
    for (let objeto of todosLosObjetos) {
      // Evitar dibujarse líneas a sí mismo si está en objetosInanimados
      if (objeto === this) continue;

      // Calcular distancia desde el farol hasta el objeto
      const distancia = calcularDistancia(this.posicion, objeto.posicion);

      // Si el objeto está dentro del radioLuz, dibujar línea
      if (distancia <= this.radioLuz) {
        // this.juego.graficoSombrasProyectadas.setStrokeStyle(1, 0xffff00, 1); // Línea amarilla opaca

        // Calcular puntos tangentes al círculo del objeto
        const dx = objeto.posicion.x - this.posicion.x;
        const dy = objeto.posicion.y - this.posicion.y;
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

        // Puntos tangentes en el círculo del objeto (desde el farol)
        const puntoTangente1x =
          this.posicion.x + Math.cos(angulo1) * distanciaHastaTangente;
        const puntoTangente1y =
          this.posicion.y + Math.sin(angulo1) * distanciaHastaTangente;
        const puntoTangente2x =
          this.posicion.x + Math.cos(angulo2) * distanciaHastaTangente;
        const puntoTangente2y =
          this.posicion.y + Math.sin(angulo2) * distanciaHastaTangente;

        // Extender las líneas tangentes hacia el lado opuesto al farol por la misma distancia
        const factorExtensionDeLaSombra =
          objeto.container.height * 0.66 + distancia * 0.1;
        const puntoFinal1x =
          puntoTangente1x + Math.cos(angulo1) * factorExtensionDeLaSombra;
        const puntoFinal1y =
          puntoTangente1y + Math.sin(angulo1) * factorExtensionDeLaSombra;
        const puntoFinal2x =
          puntoTangente2x + Math.cos(angulo2) * factorExtensionDeLaSombra;
        const puntoFinal2y =
          puntoTangente2y + Math.sin(angulo2) * factorExtensionDeLaSombra;

        // Dibujar el trapecio de sombra proyectada

        // Calcular punto de control para la curva (más alejado del farol)
        const centroX = (puntoFinal1x + puntoFinal2x) / 2;
        const centroY = (puntoFinal1y + puntoFinal2y) / 2;
        const extensionCurva = objeto.radio + distancia * 0.15; // Factor para que la curva sea sutil
        const puntoControlX =
          centroX + Math.cos(anguloAlCentro) * extensionCurva;
        const puntoControlY =
          centroY + Math.sin(anguloAlCentro) * extensionCurva;

        this.juego.graficoSombrasProyectadas.moveTo(
          puntoTangente1x,
          puntoTangente1y
        );
        this.juego.graficoSombrasProyectadas.lineTo(puntoFinal1x, puntoFinal1y);

        // Dibujar curva en lugar de línea recta para el lado alejado
        this.juego.graficoSombrasProyectadas.quadraticCurveTo(
          puntoControlX,
          puntoControlY, // Punto de control de la curva
          puntoFinal2x,
          puntoFinal2y // Punto final de la curva
        );

        this.juego.graficoSombrasProyectadas.lineTo(
          puntoTangente2x,
          puntoTangente2y
        );

        // Calcular punto de control para la curva del lado cercano al farol
        const centroTangenteX = (puntoTangente1x + puntoTangente2x) / 2;
        const centroTangenteY = (puntoTangente1y + puntoTangente2y) / 2;
        const extensionCurvaCercana = objeto.radio; // Curva más sutil en el lado cercano
        const puntoControlCercanoX =
          centroTangenteX - Math.cos(anguloAlCentro) * extensionCurvaCercana;
        const puntoControlCercanoY =
          centroTangenteY - Math.sin(anguloAlCentro) * extensionCurvaCercana;

        // Dibujar curva para conectar de vuelta al punto inicial
        this.juego.graficoSombrasProyectadas.quadraticCurveTo(
          puntoControlCercanoX,
          puntoControlCercanoY, // Punto de control de la curva cercana
          puntoTangente1x,
          puntoTangente1y // Punto inicial
        );

        let cantDecantSombra = (this.radioLuz ** 1.5 / distancia ** 2) * 0.33;
        if (cantDecantSombra > 0.33) cantDecantSombra = 0.33;
        if (cantDecantSombra < 0) cantDecantSombra = 0;

        this.juego.graficoSombrasProyectadas.fill({
          color: 0x000000,
          alpha: cantDecantSombra,
        });

        // if (this.juego.stroke) this.juego.graficoSombrasProyectadas.stroke();
      }
    }
  }
}
