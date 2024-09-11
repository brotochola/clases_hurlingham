class Chaboncito {

    constructor(x, y, app, i, juego) {
        this.juego = juego
        this.i = i
        this.app = app
        this.x = x
        this.y = y

        this.velocidadX = 0
        this.velocidadY = 0

        this.aceleracionX = 0
        this.aceleracionY = 0

        this.aceleracionParaCaminar = 4

        this.velMax = 3

        this.listo = false

        this.llegueAlPiso = false


        this.ancho = 20
        this.alto = 50
        // this.ponerCuadrado()
        this.cargarSpriteAnimado()

        // this.graphics = new PIXI.Graphics()
        //     .circle(this.x, this.y,  10)
        //     .fill(0xff0000);


        // //EMPIEZA LA CARGA DE 1.PNG
        // const texture = PIXI.Assets.load('./1.png').then(e => {

        //     //investigar "arro functions de js"
        //     // ()=>{}
        //     // function(){}


        //     //TERMINO LA CARGA DE 1.PNG
        //     //GENERAMOS UN SPRITE CON LA IMAGEN

        //     this.sprite = PIXI.Sprite.from(e)

        //     //Y LA AGREGAMOS AL STAGE
        //     app.stage.addChild(this.sprite)
        //     this.listo = true

        // })






    }



    ponerCuadrado() {
        this.sprite = new PIXI.Graphics()
            .rect(0, 0, this.ancho, this.alto)
            .fill(getRandomColor());

        this.sprite.pivot.set(this.ancho * 0.5, this.alto)

        this.juego.app.stage.addChild(this.sprite)
    }

    irALaIzq() {
        // if (this.llegueAlPiso) {
        this.aceleracionX = -this.aceleracionParaCaminar
        // }
    }
    irALaDer() {
        // if (this.llegueAlPiso) {
        this.aceleracionX = this.aceleracionParaCaminar
        // }
    }
    saltar() {
        console.log("saltar")
        if (this.llegueAlPiso) {
            // this.y -= 10
            this.aceleracionY = -45
            this.llegueAlPiso = false
        }

    }

    async cargarSpriteAnimado() {
        let json = await PIXI.Assets.load('texture.json')
        this.sprite = new PIXI.AnimatedSprite(json.animations["corriendo"])
        this.sprite.animationSpeed = 0.1
        this.sprite.loop = true
        this.sprite.play()
        this.app.stage.addChild(this.sprite)

        this.sprite.anchor.set(0.5, 1);
        this.sprite.currentFrame = Math.floor(Math.random() * 8)

        this.listo = true
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
        } else if (!this.llegueAlPiso) {
            this.agregarGravedad()
        }
    }

    friccion() {
        this.velocidadX *= 0.9
        this.velocidadY *= 0.9
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

    noPasarPorObstaculos() {
        for (let i = 0; i < this.juego.obstaculos.length; i++) {
          let obs = this.juego.obstaculos[i];
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
    detectarColisionesConObstaculos() {
        for (let i = 0; i < this.juego.obstaculos.length; i++) {
            let obs = this.juego.obstaculos[i]
            let yoTemporal = { ...this, x: this.x + this.velocidadX, y: this.y + this.velocidadY }
            if (isOverlap(yoTemporal, obs)) {
                console.log("colision")
                if (this.x > obs.x + obs.ancho / 2) {
                    console.log("colision desde la derecha")
                    this.velocidadX = 0
                } else if (this.x < obs.x - obs.ancho / 2) {
                    console.log("izq")
                    this.velocidadX = 0
                }

                if (this.y > obs.y - obs.alto) {
                    console.log("arriba")
                    this.llegueAlPiso = true
                    this.y = obs.y - obs.alto
                    this.velocidadY = 0

                } else if (this.y - this.alto < obs.y) {
                    console.log("abajo")
                }
            } else {
                this.llegueAlPiso = false
            }
        }
    }

    update(time) {
        if (!this.listo) return


        // console.log(this.aceleracionX,this.velocidadX)
        this.time = time

        // this.agregarGravedad()


        //ACELERACION
        this.velocidadX += this.aceleracionX
        this.velocidadY += this.aceleracionY


        this.aceleracionX = 0
        this.aceleracionY = 0


        this.friccion()
        this.limitarAVelocidaMaxima()


        // this.detectarColisionesConObstaculos()
        this.noPasarPorObstaculos()


        //APLICAR LA VELOCIDAD SOBRE LA POSICION
        this.x += this.velocidadX
        this.y += this.velocidadY

        this.limitarYPorELPiso()

        //friccion
        // this.velocidadX *= 0.98
        // this.velocidadY *= 0.98


        // this.cambiarOrdenEnZ()


        // this.evaluarSiLlegueAlLimiteDeLaPantalla()
        // this.cuandoLlegaAlMArgenAparecePorElOtroLado()

        this.manejarDireccionDelSprite()
        this.cambiarVelocidadDeReproduccionDelSpriteAnimado()

        //APLICAR X E Y A LA POSICION DEL GRAFICO EN EL STAGE DE PIXI
        this.sprite.x = this.x
        this.sprite.y = this.y

    }
    cambiarVelocidadDeReproduccionDelSpriteAnimado() {
        this.sprite.animationSpeed = Math.abs(this.velocidadX) * 0.1
    }
    manejarDireccionDelSprite() {
        if (this.velocidadX > 0) {
            this.sprite.scale.x = 1
        } else if (this.velocidadX < 0) {
            this.sprite.scale.x = -1
        }
    }

    cambiarOrdenEnZ() {
        this.sprite.zIndex = this.y
    }

    cuandoLlegaAlMArgenAparecePorElOtroLado() {
        this.x = this.x % this.juego.ancho
        this.y = this.y % this.juego.alto
    }

    evaluarSiLlegueAlLimiteDeLaPantalla() {
        let margen = 100
        if (this.x > this.juego.ancho - margen) {
            //margen derecho
            this.velocidadX = -Math.abs(this.velocidadX)
        } else if (this.x < margen) {
            //margen izq
            this.velocidadX = Math.abs(this.velocidadX)
        }

        //EN Y
        if (this.y > this.juego.alto - margen) {
            //margen derecho
            this.velocidadY = -Math.abs(this.velocidadY)
        } else if (this.y < margen) {
            //margen izq
            this.velocidadY = Math.abs(this.velocidadY)
        }


    }

    aplicarAceleracion(x, y) {
        this.aceleracionX = x
        this.aceleracionY = y
    }
}