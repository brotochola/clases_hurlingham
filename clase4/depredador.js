class Depredador extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.lado = 10;
    this.velMax = 3+Math.random();
    this.accMax = 0.05+Math.random()*0.05;
    this.crearGrafico();

    this.distanciaParaFrenar = 100;
  }

  crearGrafico() {
    this.grafico = new PIXI.Graphics()
      .rect(0, 0, this.lado, this.lado / 2)
      .fill(0xff0000);
    this.container.addChild(this.grafico);
  }

  perseguir(aQuien) {
    if (!aQuien) return;

    //steering = desired_velocity - velocity

    let vectorQApuntaAlTarget = { x: aQuien.x - this.x, y: aQuien.y - this.y };
    //NORMALIZAR UN VECTOR ES LLEVAR SU DISTANCIA A 1 (LA DISTANCIA ES LA HIPOTENUSA DEL TRIANGULO RECTANGULO Q SE GENERA ENTRE 0,0 Y EL PUNTO x,y DEL VECTOR)
    let vectorNormalizado = normalizeVector(vectorQApuntaAlTarget);
    //ESTA ES EL VECTOR DE VELOCIDAD AL CUAL QUEREMOS IR PARA LLEGAR AL OBJETIVO
    let velocidadDeseadaNormalizada = {
      x: vectorNormalizado.x * this.velMax,
      y: vectorNormalizado.y * this.velMax,
    };

    //SI EL OBJETIVO ESTA A UNA DISTANCIA MENOR A LA DISTANCIA PARA FRENAR, LA VELOCIDAD DESEADA ES 0, Y ASI VA BAJANDO SU VELOCIDAD
    // this.distanciaAlObjetivo = distancia(this, aQuien);
    // if (this.distanciaAlObjetivo < this.distanciaParaFrenar) {
    //   velocidadDeseadaNormalizada = {
    //     x: 0,
    //     y: 0,
    //   };
    // }

    //SI LA VELOCIDAD DESEADA ES 0 SI LA DIST AL OBJETIVO ES POCA, ESTO VA A HACER Q LA FUERZA Q SE APLICA SEA LA VELOCIDAD INVERTIDA
    //ES DECIR FRENAR
    let fuerzaParaGirar = {
      x: velocidadDeseadaNormalizada.x - this.velocidad.x,
      y: velocidadDeseadaNormalizada.y - this.velocidad.y,
    };

    //LLEGAR:

    this.aplicarFuerza(fuerzaParaGirar.x, fuerzaParaGirar.y);
  }

  buscarPresaMasCercana() {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.juego.presas) {
      let dist = distancia(this, dep);
      if (dist < distMenor) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual
  }


  update() {
    //EJECUTA EL METODO UPDATE DE LA CLASE DE LA CUAL ESTA HEREDA
    this.presa=this.buscarPresaMasCercana()

    this.perseguir(this.presa);

    super.update();
  }
}
