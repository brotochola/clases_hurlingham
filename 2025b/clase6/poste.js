class Poste extends EntidadEstatica {
  constructor(x, y, juego, scaleX) {
    super(x, y, juego);
    this.vida = 1;
    this.radio = 4;
    this.scaleX = scaleX || 1;
    this.container.label = "poste" + this.id;
    this.crearSprite();
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("/assets/pixelart/poste.png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {}
}
