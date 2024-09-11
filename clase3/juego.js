class Juego {
    constructor() {
        this.obstaculos = []
        this.chaboncitos = []
        this.app = new PIXI.Application();
        this.contadorDeFrame = 0
        this.ancho = 800
        this.alto = 500

        this.gravedad = 2

        let promesa = this.app.init({ width: this.ancho, height: this.alto })

        this.ponerListeners()

        promesa.then(e => {
            document.body.appendChild(this.app.canvas);
            window.__PIXI_APP__ = this.app;
            this.app.ticker.add(() => {
                this.gameLoop()
            })

            this.ponerChaboncitos(1)
            this.ponerObstaculos(20)

        })


    }

    ponerListeners() {
        console.log("#poner listeners")
        window.onkeydown = (e) => {
            if (e.key == "w") {
                this.chaboncitos[0].saltar()
            } else if (e.key == "a") {
                this.chaboncitos[0].irALaIzq()
            } else if (e.key == "d") {
                this.chaboncitos[0].irALaDer()
            }

        }
    }

    gameLoop(time) {

        this.time = time

        this.contadorDeFrame++

        for (let i = 0; i < this.chaboncitos.length; i++) {
            this.chaboncitos[i].update(time)
        }
        for (let i = 0; i < this.obstaculos.length; i++) {
            this.obstaculos[i].update(time)
        }

    }
    ponerObstaculos(cantidad) {
        for (let i = 0; i < cantidad; i++) {
            this.obstaculos.push(new Obstaculo(Math.random() * 500, Math.random() * 500,  this))
        }
    }
    ponerChaboncitos(cantidad) {
        for (let i = 0; i < cantidad; i++) {
            this.chaboncitos.push(new Chaboncito(Math.random() * 500, Math.random() * 500, this.app, i, this))
        }
    }
}