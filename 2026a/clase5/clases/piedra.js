class Piedra extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.juego.piedras.push(this);

    this.static = true;

    // this.tipoDePiedra = Math.floor(Math.random() * 4) + 1;

    this.sprite = new PIXI.Sprite(juego.piedra1);
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
  }
}
