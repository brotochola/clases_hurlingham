class Obstaculo {


    constructor(x, y, juego) {
        this.juego = juego


        this.x = x
        this.y = this.juego.alto - 50

        this.velocidadX = 0
        this.velocidadY = 0

        this.aceleracionX = 0
        this.aceleracionY = 0

        this.alto = 50 + Math.random() * 50
        this.ancho = 50 + Math.random() * 50

        this.ponerCuadrado()

    }

    noPasarPorObstaculos() {
        for (let i = 0; i < this.juego.obstaculos.length; i++) {
            let obs = this.juego.obstaculos[i];
            if (this == obs) continue

            // console.log(this.y < obs.y - obs.lado && this.velocidadY > 0);

            if (
                isOverlap(
                    { ...this, y: this.y + this.velocidadY, x: this.x + this.velocidadX },
                    obs
                )
            ) {
                if (this.y < obs.y - obs.alto && this.velocidadY > 0) {
                    // console.log("chocando desde arriba");
                    this.velocidadY = 0;
                    this.llegueAlPiso = true;
                    // obs.aceleracionY++
                } else if (this.y > obs.y && this.velocidadY < 0) {
                    // console.log("chocando desde abajo");
                    this.velocidadY = 0;
                    // obs.aceleracionY--
                } else if (this.x < obs.x - obs.ancho / 2 && this.velocidadX > 0) {
                    // console.log("chocando desde izq");
                    obs.velocidadX++
                    this.velocidadX = 0;
                } else if (this.x > obs.x + obs.ancho / 2 && this.velocidadX < 0) {
                    this.velocidadX = 0;
                    obs.velocidadX--
                    // console.log("chocando desde der");
                }
            }
        }
    }

    ponerCuadrado() {
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, this.ancho, this.alto)
            .fill(getRandomColor());

        this.sprite.pivot.set(this.ancho * 0.5, this.alto)

        this.juego.app.stage.addChild(this.sprite)
    }
    friccion() {
        this.velocidadX *= 0.9
        this.velocidadY *= 0.9
    }


    agregarGravedad() {
        this.aceleracionY = this.juego.gravedad
    }

    limitarYPorELPiso() {
        let changui = 50
        let posicionYDelPiso = this.juego.alto - changui

        if (this.y > posicionYDelPiso) {
            this.velocidadY = 0
            this.y = posicionYDelPiso - 1
            this.llegueAlPiso = true
        } else {
            this.agregarGravedad()
        }
    }

    limitarAVelocidaMaxima() {
        // console.log("llimitar vel")
        if (Math.abs(this.velocidadX) > this.velMax) {
            // console.log("vel mayor a max")
            if (this.velocidadX > 0) {
                // console.log("positiva")
                this.velocidadX = this.velMax
            } else {
                this.velocidadX = -this.velMax
            }
        }
    }
    update(time) {
        // if (!this.listo) return


        this.time = time

        // this.agregarGravedad()


        //ACELERACION
        this.velocidadX += this.aceleracionX
        this.velocidadY += this.aceleracionY


        this.aceleracionX = 0
        this.aceleracionY = 0


        this.friccion()
        this.limitarAVelocidaMaxima()

        this.noPasarPorObstaculos()


        //APLICAR LA VELOCIDAD SOBRE LA POSICION
        this.x += this.velocidadX
        this.y += this.velocidadY

        this.limitarYPorELPiso()


        this.sprite.x = this.x
        this.sprite.y = this.y

    }

}