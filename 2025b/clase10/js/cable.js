class Cable {
  static cables = {};
  static makeHash(poste1, poste2) {
    return [poste1, poste2]
      .sort((a, b) => a.id - b.id)
      .map((p) => p.id)
      .join("_");
  }
  static crearCable(poste1, poste2, juego) {
    const hash = this.makeHash(poste1, poste2);
    if (Cable.cables[hash]) {
      return Cable.cables[hash];
    }
    const cable = new Cable(poste1, poste2, juego);
    Cable.cables[hash] = cable;
    return cable;
  }
  constructor(poste1, poste2, juego) {
    this.poste1 = poste1;
    this.poste2 = poste2;
    this.juego = juego;
    juego.cables.push(this);

    // Variable para controlar cuánto se pandea el cable hacia abajo
    this.desviacionPandeo = Math.random() * 40 + 40; // píxeles de desviación hacia abajo

    this.poste1.esperarAQueTengaSpriteCargado(() => {
      this.poste2.esperarAQueTengaSpriteCargado(() => {
        this.dibujarCable();
      });
    });
  }

  dibujarCable() {
    // this.juego.graficoParaCables.clear();
    // this.juego.graficoParaCables.lineStyle(20, 0x000000, 1);

    // Posiciones de inicio y fin del cable (en la parte superior de cada poste)
    const x1 = this.poste1.getPosicionCentral().x;
    const y1 =
      this.poste1.getPosicionCentral().y - this.poste1.container.height * 0.9;
    const x2 = this.poste2.getPosicionCentral().x;
    const y2 =
      this.poste2.getPosicionCentral().y - this.poste2.container.height * 0.9;

    // Punto de control para la curva (punto medio pandeado hacia abajo)
    const puntoControlX = (x1 + x2) / 2;
    const puntoControlY = (y1 + y2) / 2 + this.desviacionPandeo;

    this.juego.graficoParaCables.moveTo(x1, y1);
    this.juego.graficoParaCables.quadraticCurveTo(
      puntoControlX,
      puntoControlY,
      x2,
      y2
    );

    this.juego.graficoParaCables.stroke({ color: 0x222222, width: 1.5 });

    // console.log(
    //   "dibujando cable",
    //   this.poste1.getPosicionCentral().x,
    //   this.poste1.getPosicionCentral().y,
    //   "-->",
    //   this.poste2.getPosicionCentral().x,
    //   this.poste2.getPosicionCentral().y
    // );
  }
}
