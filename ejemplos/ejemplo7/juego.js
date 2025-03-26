class Juego {
  constructor() {
    this.chaboncitos = [];
    this.obstaculos = []; //
    this.app = new PIXI.Application();
    this.contadorDeFrame = 0;
    this.ancho = 800;
    this.alto = 600;
    this.mouse = { x: 0, y: 0 };
    this.teclado={}

    let promesa = this.app.init({
      width: this.ancho,
      height: this.alto,
      backgroundColor: 0xffffff  
    });

    promesa.then((e) => {
      document.body.appendChild(this.app.canvas);
      window.__PIXI_APP__ = this.app;
      this.app.ticker.add(() => {
        this.gameLoop();
      });

      this.app.canvas.onmousemove = (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      };

      window.onkeydown = (e) => {
        this.teclado[e.key]=true
      }

      window.onkeyup = (e) => {
       delete  this.teclado[e.key]
      }

      this.ponerChaboncitos(1);
      this.ponerObstaculos(30);
    });
  }

  gameLoop(time) {
    this.time = time;

    this.contadorDeFrame++;

    
    for (let i = 0; i < this.obstaculos.length; i++) {
      this.obstaculos[i].update(time);
    }


    for (let i = 0; i < this.chaboncitos.length; i++) {
      this.chaboncitos[i].update(time);
    }

    // if(this.chaboncitos.length <500) {
    //     this.ponerChaboncitos(500);

    // }
  }

  ponerObstaculos(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      this.obstaculos.push(
        new Obstaculo(
          Math.random() * this.ancho,
          Math.random() * this.alto,
          this.app,
          i,
          this
        )
      );
    }
  }
  ponerChaboncitos(cantidad) {
    for (let i = 0; i < cantidad; i++) {
      this.chaboncitos.push(
        new Chaboncito(
          Math.random() * this.ancho,
          Math.random() * this.alto,
          this.app,
          i,
          this
        )
      );
    }
  }
}
