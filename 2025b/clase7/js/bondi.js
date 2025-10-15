class Bondi extends EntidadEstatica {
  constructor(x, y, juego, tipo, scaleX) {
    super(x, y, juego);

    this.radio = 10;
    this.scaleX = scaleX || 1;
    this.tipo = tipo || Math.floor(Math.random() * 4) + 1;
    this.container.label = "bondi" + this.id;
    this.isometric = true;
    this.crearSprite();
    this.juego.obstaculos.push(this);
  }

  async crearSprite() {
    // Load the full spritesheet
    const texture = await PIXI.Assets.load(
      "assets/pixelart/bondi" + this.tipo + ".png"
    );

    // Create sprite with the specific car texture
    this.sprite = new PIXI.Sprite(texture);

    // this.sprite.anchor.set(0.5, 0.72);
    this.sprite.anchor.set(0.5, 1);

    this.container.addChild(this.sprite);
    this.calcularRadio();
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {}
}
