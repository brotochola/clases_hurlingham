class Pasto extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 0, juego);

    this.juego = juego;

    this.debug = 0;

    this.velocidadDeMovimientoRandom = Math.random() * 0.5 + 0.5;

    let cualPasto = Math.floor(Math.random() * 2) + 1;

    let url = "./img/pasto" + cualPasto + ".png";

    this.decorado = true;

    let texture = PIXI.Texture.from(url);
    texture.baseTexture.on("loaded", () => {
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.scale.set(1.5 + Math.random() * 0.5);
      // this.radio=this.juego.grid.cellSize*0.5
      this.sprite.anchor.set(0.5, 1);

      this.container.addChild(this.sprite);

      this.actualizarZIndex();
      this.container.scale.x = Math.random() > 0.5 ? 1 : -1;
      this.actualizarPosicionEnGrid();
    });

    // this.cargarSpriteAnimado(url,300,300,0,e=>{
    //     console.log(e)
    // })
  }
  update() {
    if(!this.sprite) return
    this.sprite.skew.x =
      Math.sin(
        this.juego.contadorDeFrames * 0.04 * this.velocidadDeMovimientoRandom
      ) * 0.1;
    super.update();
  }
}
