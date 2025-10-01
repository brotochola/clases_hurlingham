class Auto extends EntidadEstatica {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.vida = 1;
    this.radio = 10;
    this.tipo = Math.floor(Math.random() * 4) + 1;
    this.container.label = "auto" + this.id;
    this.crearSprite();
  }

  async crearSprite() {
    // Load the full spritesheet
    const texture = await PIXI.Assets.load(
      "/assets/pixelart/auto" + this.tipo + ".png"
    );

    // Create sprite with the specific car texture
    this.sprite = new PIXI.Sprite(texture);

    this.sprite.anchor.set(0.5, 0.72);

    this.container.addChild(this.sprite);
    this.sprite.scale.x = Math.random() > 0.5 ? 1 : -1;
    this.render();
  }

  tick() {}
}
