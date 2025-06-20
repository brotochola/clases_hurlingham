class Obstaculo extends Entidad {
  constructor(obj) {
    super(obj);
    this.radio = obj.radio;

    this.crearGrafico();
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics().circle(0, 0, this.radio).fill(0xff0000);
    this.innerContainer.addChild(this.grafico);
  }

  serializar() {
    const obj = super.serializar();
    obj.radio = this.radio;
    return obj;
  }
  // update() {
  //   // console.log(this.x,this.y)
  //   super.update();
  // }
}
