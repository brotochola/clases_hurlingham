class Obstaculo extends Entidad {
  constructor(x, y, radio, juego) {
    super(x, y, juego);
    this.radio = radio;

    this.crearGrafico();
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics().circle(0, 0, this.radio).fill(0xff0000);
    this.innerContainer.addChild(this.grafico);
  }

  update(){
    // console.log(this.x,this.y)
    super.update()
  }
}
