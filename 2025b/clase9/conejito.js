class Conejito extends GameObject {
  constructor(texture, x, y, juego) {
    super(texture, x, y, juego);

    this.ancho = 26;
    this.alto = 37;

    this.sprite.width = this.ancho;
    this.sprite.height = this.alto;

    this.crearCajitaDeMatterJS();
  }

  aplicameFuerza(x, y) {
    Matter.Body.applyForce(this.cajita, { x: 0.5, y: 0.5 }, { x: x, y: y });
  }

  crearCajitaDeMatterJS() {
    this.cajita = Matter.Bodies.rectangle(
      this.posicion.x,
      this.posicion.y,
      this.ancho * 0.8,
      this.alto * 0.8,
      { restitution: 0.1, friction: 0.1, frictionAir: 0.01 }
    );
    this.cajita.angle = Math.random() * 3;
    Matter.Composite.add(this.juego.engine.world, [this.cajita]);
  }

  getOtrosConejitos() {
    return this.juego.conejitos;
  }
}
