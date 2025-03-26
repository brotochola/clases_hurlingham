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

      //   let height = texture.baseTexture.height;
      this.sprite = new PIXI.Sprite(texture);
      // this.sprite.width=700
      // this.sprite.height=310
      //GUARDO EL RADIO DEL OBSTACULO PORQ LO USO PARA DETECTAR COLISIONES CON LOS PERSONAJES
      this.radio =    this.sprite.width * 0.5;
      // this.radio=this.juego.grid.cellSize*0.5
      this.sprite.anchor.set(0.5, 0.82);

      this.container.addChild(this.sprite);

      this.actualizarZIndex();
      this.container.scale.x = -1;
      this.meterEnGrid();
    });

    // this.cargarSpriteAnimado(url,300,300,0,e=>{
    //     console.log(e)
    // })
  }

  meterEnGrid() {
    this.actualizarPosicionEnGrid();
    //ME FIJO EL ANCHO DE ESTA PIEDRA Y LA METO EN MAS DE UNA CELDA, PARA Q LAS COLISIONES NO SEAN SOLO CON LA CELDA CENTRAL DONDE ESTA LA PIEDRA
    if (this.radio > this.juego.grid.cellSize) {
      let dif = this.radio - this.juego.grid.cellSize;
      let cantCeldasParaCadaLado = Math.ceil(dif / this.juego.grid.cellSize);
      let miCelda = this.juego.grid.getCellPX(
        this.container.x,
        this.container.y
      );
      for (let i = 1; i <= cantCeldasParaCadaLado; i++) {
        //celda para la izq:
        let celdaIzq = this.juego.grid.getCell(miCelda.x - i, miCelda.y);
        celdaIzq.agregar(this);
        //celda der:
        let celdaDer = this.juego.grid.getCell(miCelda.x + i, miCelda.y);
        celdaDer.agregar(this);
      }
    }
  }
}
