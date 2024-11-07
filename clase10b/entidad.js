class Entidad {
  constructor(obj, metaballs) {
    this.tipo = this.constructor.name.toLowerCase(); //me guardo el nombre del construcotr (la clase) para no tener que hacer "instanceof"
    const { x, y, vel, id, juego } = obj;
    this.container = new PIXI.Container();
    this.container.name = "containerDeCadaEntidad";
    this.innerContainer = new PIXI.Container();
    this.innerContainer.name = "innerContainer";
    this.container.addChild(this.innerContainer);
    this.crearContainerDebug();
    this.equipoParaUpdate = Math.floor(Math.random() * 9) + 1;

    this.juego = juego;

    this.generarID(id);

    if (metaballs == "metaballs") {
      this.juego.contenedorParaMetaBalls.addChild(this.container);
    } else {
      this.juego.contenedorPrincipal.addChild(this.container);
    }

    this.x = x;
    this.y = y;
    this.velocidad = vel || { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };

    this.changuiMargenes = 10;
    this.fuerzaParavolverDeLosBordes = FUERZA_PARA_VOLVER;

    this.cantidadMaxDeEntidadesQMiramosParaBoids = 13;

    this.vectorQApuntaAlPromedioDePosiciones = { x: 0, y: 0 };
    this.vectorQApuntaAlPromedioDePosicionesParaAgrupamiento = { x: 0, y: 0 };
    this.vectorPromedioDeVelocidadesDeLosVecinos = { x: 0, y: 0 };

    this.crearGraficosParaDebug();
  }
  generarID(id) {
    if (id) this.id = id;
    else this.id = generateRandomID(8);

    if (this.juego.entidades.map((k) => k.id).includes(this.id)) {
      this.id = generateRandomID(8);
    }
  }
  crearGraficosParaDebug() {
    this.circuloVisionDebug = new PIXI.Graphics();
    this.circuloVisionDebug.drawCircle(0, 0, this.vision);
    this.circuloVisionDebug.lineStyle(1, 0xff0000);

    this.circuloSeparacionDebug = new PIXI.Graphics();
    this.circuloSeparacionDebug.drawCircle(
      0,
      0,
      this.distanciaLimiteParaEstarCerca
    );
    this.circuloSeparacionDebug.lineStyle(1, 0xaaffaa);

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
      if (total >= this.cantidadMaxDeEntidadesQMiramosParaBoids) break;
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
    this.containerDebug.name = "containerDebug";

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

  obtenerObstaculosCerca() {
    if (!this.celda || !this.entidadesCerca) {
      return [];
    }

    return this.entidadesCerca.filter((k) => k.tipo == "obstaculo");
  }

  estaEncuadrada() {
    const globalPosition = this.container.toGlobal(new PIXI.Point(0, 0));
    const containerBounds = this.container.getBounds(); // Obtiene el tamaño considerando las transformaciones

    // Chequear si el contenedor está encuadrado
    return (
      globalPosition.x + containerBounds.width > 0 &&
      globalPosition.y + containerBounds.height > 0 &&
      globalPosition.x < this.juego.app.renderer.width &&
      globalPosition.y < this.juego.app.renderer.height
    );
  }

  evadirObstaculos() {
    let framesParaPredecir = 10;
    let factor = 100000000;

    for (let obs of this.obstaculosCercanos) {
      //VEO LA DISTANCIA DESDE DONDE VOY A ESTAR EN 10 FRAMES HASTA EL OBSTACULO
      let distCuadrada = distanciaCuadrada(obs, {
        x: this.x + this.velocidad.x * framesParaPredecir,
        y: this.y + this.velocidad.y * framesParaPredecir,
      });

      let radioCuadrado = obs.radio ** 2;

      // let distAlCubo = dist * dist;

      if (distCuadrada <= 0) return;

      //SI ESTA TOCANDO EL OBSTACULO (CON 5 PIXELES DE CHANGUI):
      //ESTO ES UNA COLISION DIGAMOS...
      if (distCuadrada < radioCuadrado + 5) {
        //LE APLICO MUCHA MAS FUERZA
        let vectorQApuntaDelObstaculoHaciaMi = {
          x: this.x - obs.x,
          y: this.y - obs.y,
        };
        this.aplicarFuerza(
          vectorQApuntaDelObstaculoHaciaMi.x * factor,
          vectorQApuntaDelObstaculoHaciaMi.y * factor
        );
      } else if (distCuadrada < 3 * radioCuadrado) {
        //SI LA DISTANCIA ES MENOR AL TRIPLE DEL RADIO...
        let vectorQApuntaDelObstaculoHaciaMi = {
          x: this.x + this.velocidad.x - obs.x,
          y: this.y + this.velocidad.y - obs.y,
        };
        //APLICO EL FACTOR DE FUERZA INICIAL Q ES UNA BOCHA, DIVIDIDO LA DIST AL CUBO.
        //LA IDEA ES QUE CUANTO MAS LEJOS MENOS FUERZA Y CUANTO MAS CERCA ESTAS MAS FUERZA EJERCE
        this.aplicarFuerza(
          (vectorQApuntaDelObstaculoHaciaMi.x * factor) / distCuadrada,
          (vectorQApuntaDelObstaculoHaciaMi.y * factor) / distCuadrada
        );
      }
    }
  }
  meToca() {
    return this.juego.contadorDeFrame % this.equipoParaUpdate == 0;
  }

  update() {
    //LOS OBSTACULOS NO TIENEN PORQUÉ REBOTAR, Y PARA MOVERLOS ES MUY MOLESTO
    if (!(this.tipo == "obstaculo")) {
      this.rebotarContraLosBoredes();
    }

    this.acc = limitMagnitude(this.acc, this.accMax);
    // this.velocidad.x =lerp(this.velocidad.x, this.velocidad.x+this.acc.x,0.2)
    // this.velocidad.y = lerp(this.velocidad.y, this.velocidad.y+this.acc.y,0.2)
    this.velocidad.x += this.acc.x;
    this.velocidad.y += this.acc.y;

    this.acc.x = 0;
    this.acc.y = 0;

    this.velocidad = limitMagnitude(this.velocidad, this.velMax);

    this.angulo = Math.atan2(this.velocidad.y, this.velocidad.x);

    this.xAnterior = this.x;
    this.yAnterior = this.y;

    this.x += this.velocidad.x;
    this.y += this.velocidad.y;

    this.velocidad.x *= 0.99;
    this.velocidad.y *= 0.99;

    if (this.debug) {
      // this.actualizarGRraficosDeDebug();
      // this.dibujarAMedidaQVa();
      // this.pintarLaCeldaEnLaQueEstoy();
      this.pintarLaCeldaEnLaQueEstoyYLasDeAlrededor();
    }

    this.actualizarPosicionEnGrid();
  }

  estoyEnLaMismaCeldaQueEnElFrameAnterior() {
    if (isNaN(this.xAnterior) || isNaN(this.yAnterior)) return false;

    if (
      Math.floor(this.x / this.tamanoCelda) ==
        Math.floor(this.xAnterior / this.tamanoCelda) &&
      Math.floor(this.y / this.tamanoCelda) ==
        Math.floor(this.yAnterior / this.tamanoCelda)
    ) {
      return true;
    }

    return false;
  }

  pintarLaCeldaEnLaQueEstoyYLasDeAlrededor() {
    if (!this.celda) return;
    this.juego.dibujador.clear();
    for (let celda of this.celda.obtenerCeldasVecinas()) {
      let x = celda.x * this.juego.tamanoCelda;
      let y = celda.y * this.juego.tamanoCelda;

      // this.juego.dibujador.beginFill(0x00ff00); // Green color
      // this.juego.dibujador.drawRect(0, 0, this.lado, this.lado / 2);
      // this.juego.dibujador.endFill();

      this.juego.dibujador.beginFill(0x00ff00, 0.2);
      this.juego.dibujador.drawRect(
        x,
        y,
        this.juego.tamanoCelda,
        this.juego.tamanoCelda
      );
      this.juego.dibujador.endFill();
    }

    //LA CELDA EN LA Q ESTOY LA PINTO DIFERENTE
    this.juego.dibujador
      .beginFill(0x00ff00, 0.5)
      .drawRect(
        this.celda.x * this.juego.tamanoCelda,
        this.celda.y * this.juego.tamanoCelda,
        this.juego.tamanoCelda,
        this.juego.tamanoCelda
      )
      .endFill();
  }

  pintarLaCeldaEnLaQueEstoy() {
    if (!this.celda) return;
    let x = this.celda.x * this.juego.tamanoCelda;
    let y = this.celda.y * this.juego.tamanoCelda;

    this.juego.dibujador.clear();
    this.juego.dibujador
      .rect(x, y, this.juego.tamanoCelda, this.juego.tamanoCelda)
      .fill(0x00ff00, 0.3);
  }

  actualizarPosicionEnGrid() {
    this.juego.grid.actualizarPosicionDeEntidad(this);
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
      if (total >= this.cantidadMaxDeEntidadesQMiramosParaBoids) break;
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

    let total = 0;
    let prom = { x: 0, y: 0 };

    for (const presa of arrDeEntidades) {
      prom.x += presa.presa.velocidad.x;
      prom.y += presa.presa.velocidad.y;
      total++;

      if (total >= this.cantidadMaxDeEntidadesQMiramosParaBoids) break;
    }

    prom.x /= total;
    prom.y /= total;

    let fuerza = {
      x: prom.x - this.velocidad.x,
      y: prom.y - this.velocidad.y,
    };

    this.aplicarFuerza(
      fuerza.x * this.factorAlineacion,
      fuerza.y * this.factorAlineacion
    );
  }
  buscarDepredadoresCerca() {
    let presasCerca = [];
    for (let presa of this.juego.depredadores) {
      if (presa.id === this.id) continue;
      let dist = this.juego.calcularDistancia(presa, this);
      if (dist < this.vision) {
        presasCerca.push({ presa, dist });
      }
    }
    return presasCerca;
  }

  buscarPresasCerca() {
    let presasCerca = [];
    for (let presa of this.juego.presas) {
      if (presa.id === this.id) continue;
      let dist = this.juego.calcularDistancia(presa, this);
      if (dist < this.vision) {
        presasCerca.push({ presa, dist });
      }
    }
    return presasCerca;
  }

  buscarPresasCercaUsandoGrid() {
    let ret = [];
    if (this.celda) {
      // let entidadesCerca = this.celda.obtenerEntidadesAcaYEnLasCeldasVecinas();

      for (let i = 0; i < this.entidadesCerca.length; i++) {
        let presa = this.entidadesCerca[i];
        if (presa.id === this.id) continue;
        if (presa.tipo == "presa") {
          let dist = this.juego.calcularDistancia(presa, this);
          ret.push({ presa: presa, dist: dist });
        }
      }
    } else {
      return [];
    }

    return ret;
  }

  buscarDepredadoresCercaUsandoGrid() {
    let ret = [];
    if (this.celda) {
      // let entidadesCerca = this.celda.obtenerEntidadesAcaYEnLasCeldasVecinas();

      for (let i = 0; i < this.entidadesCerca.length; i++) {
        let dep = this.entidadesCerca[i];
        if (dep.tipo == "depredador" && dep != this) {
          let dist = this.juego.calcularDistancia(dep, this);
          if (dist < this.vision) {
            ret.push({ presa: dep, dist: dist });
          }
        }
      }
    } else {
      return [];
    }

    return ret;
  }

  buscarPresaMasCercana() {
    let presasCercaOrdenadasPorDist = this.presasCerca.sort((a, b) =>
      a.dist < b.dist ? -1 : 1
    );

    if (presasCercaOrdenadasPorDist[0]) {
      return presasCercaOrdenadasPorDist[0].presa;
    }

    return null;
  }

  buscarDepredadorMasCercano() {
    let depredadoresCercaOrdenadosPorDist = this.depredadoresCerca.sort(
      (a, b) => (a.dist < b.dist ? -1 : 1)
    );

    if (depredadoresCercaOrdenadosPorDist[0]) {
      return depredadoresCercaOrdenadosPorDist[0].presa;
    }

    return null;
  }

  render() {
    this.container.visible = this.estaEncuadrada();
    if (!this.container.visible) return;
    this.containerDebug.visible = this.debug;

    this.innerContainer.rotation = this.angulo;
    this.container.x = this.x;
    this.container.y = this.y;
  }

  serializar() {
    let obj = {};
    obj.id = this.id;
    obj.x = this.x;
    obj.y = this.y;
    obj.tipo = this.constructor.name.toLowerCase();
    obj.vel = { x: this.velocidad.x, y: this.velocidad.y };

    return obj;
  }
}
