class Entidad {
  constructor(x, y, juego) {
    this.container = new PIXI.Container();
    this.container.name = "contenedorPrincipal"
    this.innerContainer = new PIXI.Container();
    this.innerContainer.name = "innerContainer"
    this.container.addChild(this.innerContainer);
    this.crearContainerDebug();

    this.juego = juego;

    this.id = generateRandomID(8);

    this.juego.contenedorPrincipal.addChild(this.container);

    this.x = x;
    this.y = y;
    this.velocidad = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };

    this.changuiMargenes = 10;
    this.fuerzaParavolverDeLosBordes = FUERZA_PARA_VOLVER;

    this.vectorQApuntaAlPromedioDePosiciones = { x: 0, y: 0 };
    this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento = { x: 0, y: 0 };
    this.vectorPromedioDeVelocidadesDeLosVecinos = { x: 0, y: 0 };

    this.crearGraficosParaDebug();
  }
  crearGraficosParaDebug() {



    this.circuloVisionDebug = new PIXI.Graphics()
      .circle(0, 0, this.vision)
      .stroke(0xffffff);

    this.circuloSeparacionDebug = new PIXI.Graphics()
      .circle(0, 0, this.distanciaLimiteParaEstarCerca)
      .stroke(0xaaffaa);

    this.lineaSeparacionDebug = new PIXI.Graphics();
    this.lineaSeparacionDebug.name = "linea_separacion";

    this.lineaAgrupamientoDebug = new PIXI.Graphics();
    this.lineaAgrupamientoDebug.name = "linea_agrupamiento";

    this.lineaAlineacionDebug = new PIXI.Graphics();
    this.lineaAlineacionDebug.name = "linea_alineacion";

    this.containerDebug.addChild(this.lineaSeparacionDebug);
    this.containerDebug.addChild(this.lineaAgrupamientoDebug);
    this.containerDebug.addChild(this.lineaAlineacionDebug);


    this.containerDebug.addChild(this.circuloSeparacionDebug);
    this.containerDebug.addChild(this.circuloVisionDebug);
  }

  cohesion(arrDeEntidades) {
    if (arrDeEntidades.length == 0) return;

    let promX = 0;
    let promY = 0;
    let total = 0;
    for (let presaCerca of arrDeEntidades) {
      if (presaCerca.dist > this.distanciaLimiteParaEstarCerca) {
        total++;
        promX += presaCerca.presa.x;
        promY += presaCerca.presa.y;
      }
    }

    if (total == 0) return;

    promX /= total;
    promY /= total;

    this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento = {
      x: promX - this.x,
      y: promY - this.y,
    };

    this.aplicarFuerza(
      this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.x *
      this.factorAgruparse,
      this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.y *
      this.factorAgruparse
    );
  }

  dibujarAMedidaQVa() {
    this.juego.dibujador
      .moveTo(this.x - this.velocidad.x, this.y - this.velocidad.y)
      .lineTo(this.x, this.y)
      .stroke(0xffffff);
  }
  crearContainerDebug() {
    this.containerDebug = new PIXI.Container();
    this.containerDebug.visible = false;
    this.containerDebug.name = "containerDebug"

    this.container.addChild(this.containerDebug);
  }

  aplicarFuerza(x, y) {
    this.acc.x += x;
    this.acc.y += y;
  }

  rebotarContraLosBoredes() {
    if (this.x < this.changuiMargenes) {
      //SI ESTOY MAS A LA IZQ Q EL MARGEN IZQ -CHANGUI
      // LA FUERZA Q SE LE APLICA ES DIRECTAMENTE PROPORCIONAL A LA DISTANCIA A LA Q ESTA

      let fuerza =
        distancia(this, { x: this.changuiMargenes, y: this.y }) *
        this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(fuerza, 0);
    } else if (this.x > this.juego.ancho - this.changuiMargenes) {
      //SI ESTOY MAS A LA DER Q EL MARGEN DERECHO-CHANGUI
      let fuerza =
        distancia(this, {
          x: this.juego.ancho - this.changuiMargenes,
          y: this.y,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(-fuerza, 0);
    }

    if (this.y < this.changuiMargenes) {
      //SI ESTOY MAS ARRIBA Q EL CHANGUI PARA ARRIBA
      let fuerza =
        distancia(this, {
          x: this.x,
          y: this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, fuerza);
    } else if (this.y > this.juego.alto - this.changuiMargenes) {
      //ABAJO
      let fuerza =
        distancia(this, {
          x: this.x,
          y: this.juego.alto - this.changuiMargenes,
        }) * this.fuerzaParavolverDeLosBordes;
      this.aplicarFuerza(0, -fuerza);
    }
  }
  evadirObstaculos() {
    let framesParaPredecir = 10;
    let factor = 5000000;

    for (let obs of this.juego.obstaculos) {
      //VEO LA DISTANCIA DESDE DONDE VOY A ESTAR EN 10 FRAMES HASTA EL OBSTACULO
      let dist = distancia(obs, {
        x: this.x + this.velocidad.x * framesParaPredecir,
        y: this.y + this.velocidad.y * framesParaPredecir,
      });

      let distAlCubo = dist * dist * dist;

      if (dist < 0) return;

      if (dist < obs.radio * 3) {
        //SI LA DISTANCIA ES MENOR AL TRIPLE DEL RADIO...
        let vectorQApuntaDelObstaculoHaciaMi = {
          x: this.x + this.velocidad.x - obs.x,
          y: this.y + this.velocidad.y - obs.y,
        };
        //APLICO EL FACTOR DE FUERZA INICIAL Q ES UNA BOCHA, DIVIDIDO LA DIST AL CUBO.
        //LA IDEA ES QUE CUANTO MAS LEJOS MENOS FUERZA Y CUANTO MAS CERCA ESTAS MAS FUERZA EJERCE
        this.aplicarFuerza(
          (vectorQApuntaDelObstaculoHaciaMi.x * factor) / distAlCubo,
          (vectorQApuntaDelObstaculoHaciaMi.y * factor) / distAlCubo
        );
      }

      //SI ESTA TOCANDO EL OBSTACULO (CON 5 PIXELES DE CHANGUI):
      //ESTO ES UNA COLISION DIGAMOS...
      if (dist < obs.radio + 5) {
        //LE APLICO MUCHA MAS FUERZA
        let vectorQApuntaDelObstaculoHaciaMi = {
          x: this.x - obs.x,
          y: this.y - obs.y,
        };
        this.aplicarFuerza(
          vectorQApuntaDelObstaculoHaciaMi.x * factor,
          vectorQApuntaDelObstaculoHaciaMi.y * factor
        );
      }
    }
  }

  update() {
    // if(isNaN(this.acc.x)) debugger
    this.rebotarContraLosBoredes();

    this.acc = limitMagnitude(this.acc, this.accMax);
    // this.velocidad.x =lerp(this.velocidad.x, this.velocidad.x+this.acc.x,0.2)
    // this.velocidad.y = lerp(this.velocidad.y, this.velocidad.y+this.acc.y,0.2)
    this.velocidad.x += this.acc.x;
    this.velocidad.y += this.acc.y;

    this.acc.x = 0;
    this.acc.y = 0;

    this.velocidad = limitMagnitude(this.velocidad, this.velMax);

    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x);

    this.x += this.velocidad.x;
    this.y += this.velocidad.y;

    this.velocidad.x *= 0.99;
    this.velocidad.y *= 0.99;

    if (this.debug) {

      this.actualizarGRraficosDeDebug();
      this.dibujarAMedidaQVa();
    }

  }
  actualizarGRraficosDeDebug() {
    if (this.lineaSeparacionDebug) {
      this.lineaSeparacionDebug
        .clear()
        .moveTo(0, 0)
        .lineTo(
          this.vectorQApuntaAlPromedioDePosiciones.x,
          this.vectorQApuntaAlPromedioDePosiciones.y
        )
        .stroke(0xff0000);
    }

    if (this.lineaAgrupamientoDebug) {
      this.lineaAgrupamientoDebug
        .clear()
        .moveTo(0, 0)
        .lineTo(
          this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.x,
          this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento.y
        )
        .stroke(0x00ff00);
    }

    if (this.lineaAlineacionDebug) {
      this.lineaAlineacionDebug
        .clear()
        .lineTo(
          this.vectorPromedioDeVelocidadesDeLosVecinos.x * 10,
          this.vectorPromedioDeVelocidadesDeLosVecinos.y * 10
        )
        .stroke(0x9999ff);
    }

    if (this.circuloVisionDebug) {
      this.circuloVisionDebug
        .clear()
        .circle(0, 0, this.vision)
        .stroke(0xffffff);
    }
    if (this.circuloSeparacionDebug) {
      this.circuloSeparacionDebug
        .clear()
        .circle(0, 0, this.distanciaLimiteParaEstarCerca)
        .stroke(0xffffff);
    }
  }

  separacion(arrDeEntidades) {
    let promX = 0;
    let promY = 0;

    if (arrDeEntidades.length == 0) return;

    let total = 0;
    for (let presaCerca of arrDeEntidades) {
      if (presaCerca.dist < this.distanciaLimiteParaEstarCerca) {
        total++;
        promX += presaCerca.presa.x;
        promY += presaCerca.presa.y;
      }
    }
    if (total == 0) return;

    promX /= total;
    promY /= total;

    this.vectorQApuntaAlPromedioDePosiciones = {
      x: this.x - promX,
      y: this.y - promY,
    };

    this.aplicarFuerza(
      this.vectorQApuntaAlPromedioDePosiciones.x * this.factorSeparacion,
      this.vectorQApuntaAlPromedioDePosiciones.y * this.factorSeparacion
    );
  }

  alineacion(arrDeEntidades) {
    if (arrDeEntidades.length == 0) return;

    let promVelX = 0;
    let promVelY = 0;

    for (let presa of arrDeEntidades) {
      promVelX += presa.presa.velocidad.x;
      promVelY += presa.presa.velocidad.y;
    }

    promVelX /= arrDeEntidades.length;
    promVelY /= arrDeEntidades.length;

    this.vectorPromedioDeVelocidadesDeLosVecinos = { x: promVelX, y: promVelY };

    let fuerza = {
      x: this.vectorPromedioDeVelocidadesDeLosVecinos.x - this.velocidad.x,
      y: this.vectorPromedioDeVelocidadesDeLosVecinos.y - this.velocidad.y,
    };

    this.aplicarFuerza(
      fuerza.x * this.factorAlineacion,
      fuerza.y * this.factorAlineacion
    );
  }
  buscarDepredadoresCerca() {
    let presasCerca = [];
    for (let presa of this.juego.depredadores) {
      if (presa == this) continue;
      let dist = distancia(presa, this);
      if (dist < this.vision) {
        presasCerca.push({ presa, dist });
      }
    }
    return presasCerca;
  }

  buscarPresasCerca() {
    let presasCerca = [];
    for (let presa of this.juego.presas) {
      if (presa == this) continue;
      let dist = distancia(presa, this);
      if (dist < this.vision) {
        presasCerca.push({ presa, dist });
      }
    }
    return presasCerca;
  }

  render() {
    this.containerDebug.visible = this.debug;

    this.innerContainer.rotation = this.angulo;
    this.container.x = this.x;
    this.container.y = this.y;
  }
}
