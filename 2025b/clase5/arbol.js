class Arbol extends EntidadEstatica {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.vida = 1;
    this.radio = 10;
    this.tipo = Math.floor(Math.random() * 2) + 1;
    this.container.label = "arbol" + this.id;
    this.crearSprite();
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("/assets/pixelart/arbol" + this.tipo + ".png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);

    this.render();
  }

  tick() {}
}
