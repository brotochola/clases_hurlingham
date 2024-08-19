class Entidad {
  constructor(x, y, juego) {
    //CADA ENTIDAD GUARDA UNA REFERENCIA AL OBJETO DEL JUEGO
    this.juego = juego;
    this.x = x;
    this.y = y;
    this.velocidad = { x: 0, y: 0 };
    this.acc={x:0,y:0}
    //LA ENTIDAD TIENE UNA PROPIEDAD Q ES EL GRAFICO DE PIXI
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, 20, 20)
      .fill(getRandomColor());

    //UNA VEZ Q SE CREA EL GRAFICO SE METE EN EL STAGE
    this.juego.pixiApp.stage.addChild(this.grafico);
  }
  setearVelocidad(x, y) {
    this.velocidad = { x: x, y: y };
  }
  setearFuerza(x,y){
    this.acc.x = x;
    this.acc.y = y;
  }
  update() {
    //FUNCION UPDATE = PENSAR COSAS

    //MIRAR ALREDEDOR Y CONTEMPLAR LAS PROPIAS VARIABLES
    //SEGUN PROPIAS VARIABLES Y EL ENTORNO, CAMBIAR DE ESTADO
    //SEGUN ESTADO HACER COSAS

    //AGREGO LA VELOCIDAD A LA POSICION
    this.velocidad.x += this.acc.x
    this.velocidad.y += this.acc.y
    this.acc.x=0
    this.acc.y=0
    this.x += this.velocidad.x;
    this.y += this.velocidad.y;

    //UNA VEZ LISTOS LOS CALCULOS, PODEMOS MOSTRAR COSAS:
    this.render();
  }

  render() {
    //FUNCION RENDER=MOSTRAR COSAS

    //ACA SE PUEDE DECIDIR QUE SPRITE MOSTRAR

    //ACTUALIZAR POSICION
    this.grafico.x = this.x;
    this.grafico.y = this.y;
  }
}
