class Piedra extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 0, juego);

    this.juego = juego;

    this.debug = 0;
   

    let cualRoca = Math.floor(Math.random() * 4) + 1;
    let url = "./img/roca" + cualRoca + ".png";

    let texture = PIXI.Texture.from(url);
    texture.baseTexture.on("loaded", () => {
      let width = texture.baseTexture.width;
      this.radio=width*0.5
    //   let height = texture.baseTexture.height;
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.anchor.set(0.5, 0.82);

      this.container.addChild(this.sprite);

      this.actualizarZIndex();
      this.container.scale.x = -1;
      this.actualizarPosicionEnGrid();
    });

    // this.cargarSpriteAnimado(url,300,300,0,e=>{
    //     console.log(e)
    // })
  }


}
