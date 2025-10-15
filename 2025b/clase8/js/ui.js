class UI {
  constructor(juego) {
    this.margen = 30;
    this.juego = juego;
    this.container = new PIXI.Container();
    this.container.label = "ui";
    this.container.zIndex = Z_INDEX.containerUI || 9;
    this.juego.pixiApp.stage.addChild(this.container);
    this.estiloDeTexto = {
      fontSize: 30,
      fontFamily: "PixelifySans",
      fill: 0xffffff,
      fontWeight: "bold",
      stroke: { color: 0x444444, width: 3 },
      align: "right",
    };
    this.crearTextoDeLaHora();
    this.crearIndicadorDeAmigos();
    this.resize();
  }
  crearIndicadorDeAmigos() {
    this.indicadorDeAmigos = new PIXI.Text({
      text: "",
      style: this.estiloDeTexto,
    });
    this.indicadorDeAmigos.anchor.set(1, 0);
    this.indicadorDeAmigos.label = "indicadorDeAmigos";
    this.container.addChild(this.indicadorDeAmigos);
  }

  crearTextoDeLaHora() {
    this.textoDeLaHora = new PIXI.Text({ text: "", style: this.estiloDeTexto });
    this.textoDeLaHora.label = "horaDelDia";
    this.textoDeLaHora.anchor.set(1, 0);
    this.container.addChild(this.textoDeLaHora);
  }

  resize() {
    this.textoDeLaHora.x = this.juego.width - this.margen;
    this.textoDeLaHora.y = this.margen;
    this.indicadorDeAmigos.x = this.juego.width - this.margen;
    this.indicadorDeAmigos.y = this.margen + 50;
  }
  getStringDeBandos() {
    let str = "";
    for (let i = 1; i <= 7; i++) {
      str += `${i}: ${
        this.juego.personas.filter((persona) => persona.bando === i).length
      }\n`;
    }
    return str;
  }

  tick() {
    if (!this.indicadorDeAmigos) return;
    this.indicadorDeAmigos.text = this.getStringDeBandos();

    if (!this.textoDeLaHora) return;
    if (!this.juego.sistemaDeIluminacion) return;
    if (!this.juego.sistemaDeIluminacion.minutoDelDia) return;

    this.textoDeLaHora.text = convertirCantidadDeMinutosDelDiaAStringDeHora(
      this.juego.sistemaDeIluminacion.minutoDelDia
    );
  }
}
