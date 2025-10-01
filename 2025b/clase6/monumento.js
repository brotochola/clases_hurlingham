class Monumento extends EntidadEstatica {
  constructor(x, y, juego, tipo, scaleX) {
    super(x, y, juego, tipo);

    this.scaleX = scaleX || 1;
    this.tipo = tipo;
    this.container.label = "monumento_" + this.tipo + "_" + this.id;
    this.isometric = true;
    this.crearSprite();
    this.juego.obstaculos.push(this);
  }

  calcularRadio() {
    this.radio = this.sprite.width * 0.33; //creo q este ratio va bien
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("/assets/pixelart/" + this.tipo + ".png")
    );

    this.calcularRadio();
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {}
}
