class Farol extends EntidadEstatica {
  constructor(x, y, juego, tipo, scaleX) {
    super(x, y, juego);
    juego.faroles.push(this);
    juego.cosasQueDanLuz.push(this);

    this.radio = 11;
    this.alphaNormal = 0.6;
    this.tipo = tipo || Math.floor(Math.random() * 2) + 1;
    this.scaleX = scaleX || 1;
    this.container.label = "arbol" + this.id;
    this.crearSprite().then(() => {
      if (!Juego.CONFIG.usar_grilla) return;
      this.actualizarMiPosicionEnLaGrilla();
      this.celdaActual.agregarAlSetPorClaseYTipo(this);
    });
    this.juego.obstaculos.push(this);
    this.cantidadDeLuz = 1;
    this.radioLuz = 900;
    this.estado = 1;
    this.fallado = Math.random() > 0.95;
    this.funcionando = 1;
  }

  prender() {
    this.estado = 1;
  }
  apagar() {
    this.estado = 0;
  }

  actualizarSegunEstado() {
    if (!this.spriteDeLuz) return;
    this.spriteDeLuz.alpha = this.alphaNormal * this.estado * this.funcionando;
    if (!this.spriteGradiente) return;

    this.spriteGradiente.alpha = this.estado * this.funcionando;
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/farol" + this.tipo + ".png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();

    this.calcularRadioLuz();
    this.crearSpriteDeLuz();
  }

  tick() {
    if (!this.spriteDeLuz) return;
    if (this.fallado && this.estado == 1) {
      this.funcionando = Math.random() < 0.95 ? 1 : 0;
    } else {
      this.funcionando = 1;
    }

    this.actualizarSegunEstado();
  }
}
