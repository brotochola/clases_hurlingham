class Conejito {
  //defino las propiedades q tiene mi clase, aunq podria no definirlas
  sprite;
  id;

  constructor(texture, x, y, juego) {
    //guarda una referencia a la instancia del juego
    this.juego = juego;
    //generamos un ID para este conejito
    this.id = Math.floor(Math.random() * 99999999);

    // tomo como parametro la textura y creo un sprite
    this.sprite = new PIXI.Sprite(texture);
    //le asigno x e y al sprite
    this.sprite.x = x;
    this.sprite.y = y;

    //establezco el punto de pivot en el medio:
    this.sprite.anchor.set(0.5);

    //random entre 0 y 1
    this.velocidadX = Math.random() * 10;
    this.velocidadY = Math.random() * 10;

    //agrego el sprite al stage
    //this.juego es una referencia a la instancia de la clase Juego
    //a su vez el juego tiene una propiedad llamada pixiApp, q es la app de PIXI misma,
    //q a su vez tiene el stage. Y es el Stage de pixi q tiene un metodo para agregar 'hijos'
    //(el stage es como un container/nodo)
    this.juego.pixiApp.stage.addChild(this.sprite);
  }

  getOtrosConejitos() {
    return this.juego.conejitos;
  }

  tick() {
    //este metodo tick se ejecuta en cada frame

    //cada vez que llega este conejito a los bordes, rebota, con una nueva velocidad
    //pero para el lado opuesto del que venia.

    // if (this.sprite.x > this.juego.width) {
    //   this.velocidadX = -Math.random();
    // }

    // if (this.sprite.y > this.juego.height) {
    //   this.velocidadY = -Math.random();
    // }

    // if (this.sprite.x < 0) {
    //   this.velocidadX = Math.random();
    // }

    // if (this.sprite.y < 0) {
    //   this.velocidadY = Math.random();
    // }

    //ejemplo mas realista
    if (this.sprite.x > this.juego.width || this.sprite.x < 0) {
      //si la coordenada X de este conejito es mayor al ancho del stage,
      //o si la coordenada X.. es menor q 0 (o sea q se fue por el lado izquierdo)
      //multiplicamos por -0.99, o sea que se invierte el signo (si era positivo se hace negativo y vicecversa)
      //y al ser 0.99 pierde 1% de velocidad
      this.velocidadX *= -0.99;
    }

    if (this.sprite.y > this.juego.height || this.sprite.y < 0) {
      this.velocidadY *= -0.99;
    }

    //pixeles por frame
    this.sprite.x += this.velocidadX;
    this.sprite.y += this.velocidadY;
  }
}
