class Juego {
  constructor(callback) {
    // this.app = new PIXI.Application();
    this.teclado = {};
    this.contadorDeFrame = 0;
    this.ancho = window.innerWidth * 4;
    this.alto = window.innerHeight * 4;
    this.tamanoCelda = 45;

    this.gravedad = 500;

    this.app = new PIXI.Application({
      width: this.ancho,
      height: this.alto,
      backgroundColor: 0x000000,
    });

    this.escala = 1;

    this.entidades = [];
    this.presas = [];
    this.depredadores = [];
    this.obstaculos = [];

    this.contadorDeFrame = 0;

    this.colores = {
      mana: 0x5a63ae,
      vida: 0xcb455e,
    };

    this.distanceLookUpTable = new DistanceLookUpTable(this);
    // promesa.then((e) => {
    this.juegoListo();
    if (callback instanceof Function) callback(this);
    // });
    // PIXI.Assets.load("./img/circulo.png");
  }

  cargarNivel(url) {
    fetch(url).then((e) => {
      e.json().then((data) => {
        this.nivel = data;

        for (let i = 0; i < this.nivel.entidades.length; i++) {
          let enti = this.nivel.entidades[i];
          if (enti.tipo.toLowerCase() == "presa") {
            this.agregarPresa(enti);
          } else if (enti.tipo.toLowerCase() == "obstaculo") {
            this.agregarObstaculo(enti);
          } else if (enti.tipo.toLowerCase() == "depredador") {
            this.agregarDepredador(enti);
          }
        }
      });
    });
  }

  guardarNivel() {
    let nivel = { entidades: [] };
    for (let e of this.entidades) {
      nivel.entidades.push(e.serializar());
    }

    console.log(nivel);
  }

  crearContenedorParaMetaBalls() {
    this.contenedorParaMetaBalls = new PIXI.Container();
    this.contenedorParaMetaBalls.name = "contenedorParaMetaBalls";

    // this.blurFilter = new PIXI.filters.BlurFilter(8, 10, 1, 5);
    // this.blurFilter.blur = 25;
    // this.blurFilter.autoFit = true;

    const shaderQueDaTextura = `
// texture based 3D value noise by iq - https://www.shadertoy.com/view/4sfGzS
float noise( in vec3 x )
{
    vec3 i = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	vec2 uv = (i.xy+vec2(37.0,17.0)*i.z) + f.xy;
	vec2 rg = textureLod( iChannel0, (uv+0.5)/256.0, 0.0).yx;
	return mix( rg.x, rg.y, f.z );
}

// Metaballs and analytic normals from Klems' https://www.shadertoy.com/view/4dj3zV
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 a, q, p, gradient, normal, dir;
    float b, dist, bdist;
    dir = normalize(vec3((2.*fragCoord.xy-iResolution.xy)/min(iResolution.x,iResolution.y), 1.7));
    p = vec3(0, 0, -3);
    for(int i = 0; i < 200; i++) {
        q = p; // save current position
        p += dir * dist; // step
        gradient = vec3(0);
        dist = 1.;
        for(float j = 0.; j < 3.; j++) {
            vec3 ballp = sin(vec3(1,3,0) * j + iTime); // ball position
            ballp.z=2.0;
            b = dot(a = p - ballp, a);
            // gradient += a / (b * b); // actual normals
            gradient += a / sqrt(b); // Shane's fur grooming tip
            dist -= .5 / b;
        }
        normal = normalize(gradient);
        bdist = dist;
        if(i>90 && dist<.01) {
            dist += noise(normal*60.);
            dist *= .02;
        }
     }
    vec3 col = normal.yyy*.4+.5;
    if(dist<.1) col = col * vec3(.9,.3,.5) + .1;
    else col = col * vec3(.7,.8,.5);
    fragColor.rgb = col * (1.+bdist);
}`;

    const todoRojo = `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        if(color.a>0.7){
          gl_FragColor = vec4(color.a, color.a, color.a, color.a*0.2);  
        }else if(color.a>=0.5 && color.a<=0.7){
          gl_FragColor = vec4(color.r, color.g, color.b, color.a);  
        }else if(color.a>=0.1 && color.a<0.49){
          gl_FragColor = vec4(color.r, color.g, color.b,color.a*2.0);    


        }else{
          gl_FragColor = vec4(color.r, color.g, color.b,0.0);    
        }
        
      }
    `;

    // const fragSource = [
    //   "precision mediump float;",
    //   "varying vec2 vTextureCoord;",
    //   "uniform sampler2D uSampler;",
    //   "uniform float threshold;",
    //   "uniform float mr;",
    //   "uniform float mg;",
    //   "uniform float mb;",
    //   "void main(void)",
    //   "{",
    //   "    vec4 color = texture2D(uSampler, vTextureCoord);",
    //   "    vec3 mcolor = vec3(mr, mg, mb);",
    //   "    if (color.a > threshold) {",
    //   "       gl_FragColor = vec4(mcolor, 1.0);",
    //   "    } else {",
    //   "       gl_FragColor = vec4(vec3(0.0), 0.0);",
    //   "    }",
    //   "}",
    // ].join("\n");

    this.uniformsData = {
      threshold: 0.1,
      mr: 255.0 / 255.0,
      mg: 255.0 / 255.0,
      mb: 255.0 / 255.0,
    };
    // const thresholdFilter = new PIXI.Filter(null, fragSource);

    const thresholdFilter = new PIXI.Filter(null, todoRojo, this.uniformsData);
    this.contenedorParaMetaBalls.filters = [thresholdFilter];
    // this.contenedorParaMetaBalls.cacheAsBitmap = false;
    this.contenedorPrincipal.addChild(this.contenedorParaMetaBalls);
    // stage.filterArea = renderer.screen;
    this.contenedorParaMetaBalls.filterArea = this.app.renderer.screen;
  }

  juegoListo() {
    this.contenedorPrincipal = new PIXI.Container();
    this.contenedorPrincipal.name = "contenedorPrincipal";

    this.dibujador = new PIXI.Graphics();
    this.contenedorPrincipal.addChild(this.dibujador);

    this.crearContenedorParaMetaBalls();

    this.app.stage.addChild(this.contenedorPrincipal);

    // this.contenedorPrincipal.interactive = true;
    // this.contenedorPrincipal.on('mousedown', () => {
    //   console.log('hello');
    // });

    // this.meterFondo()

    document.body.appendChild(this.app.view);
    //  document.body.appendChild(app.view);
    window.__PIXI_APP__ = this.app;

    this.crearUI();

    this.ponerListeners();

    this.grid = new Grid(this, this.tamanoCelda);

    // this.cargarNivel("nivel1.json");

    //ARRANCAR EL GAMELOOP DPS DE HABER CREADO TODAS LAS COSAS
    this.app.ticker.add((e) => {
      this.gameLoop(e);
    });
  }

  crearUI() {
    this.ui = new PIXI.Container();
    this.ui.name = "UI";
    this.app.stage.addChild(this.ui);

    this.crearTextoDeTiempo();

    // this.cargarImagenes();
  }

  crearTextoDeTiempo() {
    this.tiempoText = new PIXI.Text();
    this.tiempoText.text = "00";
    this.tiempoText.style.fontFamily = "fuente";
    this.tiempoText.style.align = "right";
    this.tiempoText.x = window.innerWidth - 150;
    this.tiempoText.y = 30;
    this.tiempoText.style.fill = "white";
    this.ui.addChild(this.tiempoText);
  }
  setearVida(val) {
    if (!this.barraVida) return;
    let min = 11;
    let max = 180;

    this.barraVida.width = lerp(min, max, val);
  }

  meterFondo() {
    PIXI.Assets.load("img/bg.jpg").then((textura) => {
      this.fondo = new PIXI.Sprite(textura);
      this.fondo.scale.set(10);

      this.contenedorPrincipal.addChild(this.fondo);
    });
  }

  cargarImagenes() {
    PIXI.Assets.load("img/vida.png").then((textura) => {
      this.barraVida = new PIXI.Graphics()
        .rect(0, 0, 10, 25)
        .fill(this.colores.vida);
      this.barraVida.x = 85;
      this.barraVida.y = 49;

      this.ui.addChild(this.barraVida);

      this.imagenVida = new PIXI.Sprite(textura);
      this.imagenVida.scale.set(0.14);
      this.imagenVida.y = 20;
      this.imagenVida.x = 20;
      this.ui.addChild(this.imagenVida);
    });
  }

  calcularDistancia(obj1, obj2) {
    if (obj1.id == obj2.id) return 0;
    return distancia(obj1, obj2);

    // let distLookUpTable = this.distanceLookUpTable.get(obj1, obj2);
    // if (distLookUpTable) {
    //   return distLookUpTable;
    // }

    // let dist = distancia(obj1, obj2);
    // this.distanceLookUpTable.set(obj1, obj2, dist);
    // return dist;
  }

  buscarEntidadMasCercana(x, y) {
    let distMenor = 99999999;
    let cual;

    for (let dep of this.entidades) {
      let dist = distancia({ x: x, y: y }, dep);
      if (dist < distMenor) {
        distMenor = dist;
        cual = dep;
      }
    }

    return cual;
  }

  ponerListeners() {
    window.onwheel = (e) => {
      this.escala -= e.deltaY / 2000;

      this.contenedorPrincipal.pivot.x =
        e.x - window.innerWidth / 2 / this.escala;
      this.contenedorPrincipal.pivot.y =
        e.y - window.innerHeight / 2 / this.escala;
    };
    window.onmousemove = (e) => {
      let xDelContenedor = e.x + this.contenedorPrincipal.pivot.x;
      let yDelContenedor = e.y + this.contenedorPrincipal.pivot.y;

      this.mouse = { x: e.x, y: e.y };
      if (this.entidadSeleccionada && this.clickEn) {
        this.entidadSeleccionada.x = xDelContenedor;
        this.entidadSeleccionada.y = yDelContenedor;
      }
    };

    window.onkeydown = (e) => {
      // console.log(e);
      this.teclado[e.key.toLowerCase()] = true;
    };
    window.onkeyup = (e) => {
      // console.log(e);
      delete this.teclado[e.key.toLowerCase()];
    };

    // window.onmouseout = () => {
    //   this.clickEn = null;
    // };
    window.onmouseup = () => {
      this.clickEn = null;
    };

    document.body.onmouseleave = () => {
      this.clickEn = null;
    };

    window.onmousedown = (e) => {
      let xDelContenedor = e.x + this.contenedorPrincipal.pivot.x;
      let yDelContenedor = e.y + this.contenedorPrincipal.pivot.y;

      // let grafico=new PIXI.Graphics().rect(xDelContenedor,yDelContenedor,10,10).fill(0xffffff)
      // this.contenedorPrincipal.addChild(grafico)

      // console.log(e.x,e.y, xDelContenedor,yDelContenedor)

      for (let enti of this.entidades) {
        enti.debug = false;
      }

      let entidadMasCerca = this.buscarEntidadMasCercana(
        xDelContenedor,
        yDelContenedor
      );
      this.clickEn = { x: xDelContenedor, y: yDelContenedor };

      let objetoConXeYRelativasAlcontenedorPrincipal = {
        x: xDelContenedor,
        y: yDelContenedor,
      };

      if (
        distancia(objetoConXeYRelativasAlcontenedorPrincipal, entidadMasCerca) <
        50
      ) {
        entidadMasCerca.debug = true;
        this.entidadSeleccionada = entidadMasCerca;
      } else {
        this.entidadSeleccionada = null;
      }
    };
  }
  gameLoop(e) {
    this.objetoTickDePixi = e;

    this.dibujador.clear();

    this.contadorDeFrame++;

    for (let entidad of this.entidades) {
      entidad.update();
      entidad.render();
    }

    // if (this.contadorDeFrame % 10 == 0) {
    //   this.distanceLookUpTable.reset();
    // }

    this.grid.update();

    this.moverCamara();

    this.actualizarUI(e);

    // this.app.renderer.render(this.app.stage);
  }

  actualizarUI(e) {
    ///COSAS DE LA UI
    //PONGO EL TIEMPO ARRIBA A LA DERECHA
    let tiempoInicial = 100;
    let tiempoRestante = tiempoInicial - Math.floor(e.lastTime / 1000);
    this.setearVida(tiempoRestante / 100);
    if (this.contadorDeFrame % 10 == 0)
      this.tiempoText.text = this.app.ticker.FPS.toFixed(2); //tiempoRestante.toString();
  }

  moverCamara() {
    if (this.teclado.a) {
      this.contenedorPrincipal.pivot.x -= 15;
    } else if (this.teclado.d) {
      this.contenedorPrincipal.pivot.x += 15;
    }

    if (this.teclado.w) {
      this.contenedorPrincipal.pivot.y -= 15;
    } else if (this.teclado.s) {
      this.contenedorPrincipal.pivot.y += 15;
    }

    if (!this.entidadSeleccionada) return;
    if (
      this.entidadSeleccionada.tipo == "presa" ||
      this.entidadSeleccionada.tipo == "depredador"
    ) {
      this.contenedorPrincipal.pivot.x = lerp(
        this.contenedorPrincipal.pivot.x,
        this.entidadSeleccionada.x - window.innerWidth / 2 / this.escala,
        0.1
      );
      this.contenedorPrincipal.pivot.y = lerp(
        this.contenedorPrincipal.pivot.y,
        this.entidadSeleccionada.y - window.innerHeight / 2 / this.escala,
        0.1
      );
    }

    this.contenedorPrincipal.scale.set(this.escala);
    //   let valX = -this.entidadSeleccionada.x + window.innerWidth / 2
    //   let valY = -this.entidadSeleccionada.y + window.innerHeight / 2
    //   this.contenedorPrincipal.x = lerp(this.contenedorPrincipal.x, valX, 0.05)
    //   this.contenedorPrincipal.y = lerp(this.contenedorPrincipal.y, valY, 0.05)
    // }
  }

  agregarPresa(obj) {
    let presa = new Presa({ ...obj, juego: this });
    this.entidades.push(presa);
    this.presas.push(presa);
  }
  agregarDepredador(obj) {
    let depre = new Depredador({ ...obj, juego: this });
    this.entidades.push(depre);
    this.depredadores.push(depre);
  }
  agregarObstaculo(obj) {
    let depre = new Obstaculo({ ...obj, juego: this });
    this.entidades.push(depre);
    this.obstaculos.push(depre);
  }
}
