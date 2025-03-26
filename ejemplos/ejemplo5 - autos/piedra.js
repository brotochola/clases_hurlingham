class Piedra extends Objeto {
  constructor(x, y, juego) {
    super(x, y, 0, juego);

    this.juego = juego;

    this.debug = 0;

    this.escala = 0.75;

    this.ponerImagen();
  }

  ponerImagen() {
    // Crear un patrón a partir de una imagen

    let cant = 2;
    let cualRoca = Math.floor(Math.random() * cant) + 1;
    let url = "./img/casa" + cualRoca + ".png";

    const image = new Image();

    image.onload = () => {
      // create a texture source
      const source = new PIXI.ImageSource({
        resource: image,
      });

      // create a texture
      const texture = new PIXI.Texture({
        source,
      });

      this.generarSombraDuplicando(texture);

      // Crear un sprite con la textura del patrón
      this.sprite = new PIXI.Sprite(texture);

      this.sprite.scale.set(this.escala);
      this.sprite.anchor.set(0.5, 1);

      //GUARDO EL RADIO DEL OBSTACULO PORQ LO USO PARA DETECTAR COLISIONES CON LOS PERSONAJES
      this.radio = this.sprite.width * 0.5;
      this.container.addChild(this.sprite);

      this.actualizarZIndex();
      this.container.scale.x = -1;
      this.meterEnGrid();
    };

    image.src = url;
  }

  generarSombraDuplicando(texture) {
    this.spriteSombra = new PIXI.Sprite(texture);
    this.spriteSombra.scale.set(this.escala);
    this.spriteSombra.anchor.set(0.5, 1);

    this.spriteSombra.scale.y = -0.5;
    this.spriteSombra.y = -30;

    this.spriteSombra.tint = 0x000000;

    this.spriteSombra.alpha = 0.4;

    this.container.addChild(this.spriteSombra);
  }

  update() {
    this.cambiarAnguloDeLaSombraSegunHora();
    super.update();
  }

  cambiarAnguloDeLaSombraSegunHora() {
    if (this.juego.sol > 0) {
      this.spriteSombra.alpha = this.juego.sol * 0.5;
      let horaOffset = 12 - this.juego.hora;
      if (horaOffset > 0) {
        this.spriteSombra.skew.x = (1 - this.juego.sol) * 1.33;        
      } else {
        this.spriteSombra.skew.x = -(1 - this.juego.sol) * 1.33;        
      }
      this.spriteSombra.scale.y = -1 * (0.9 - this.juego.sol * 0.66);
      
    } else {
      this.spriteSombra.alpha = 0;
    }
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
