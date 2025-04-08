class ChaboncitoAnimado {
  constructor(juego, spriteSheet, i) {
    this.juego = juego;

    // Creamos el sprite animado usando la animación de caminar
    this.sprite = new PIXI.AnimatedSprite(spriteSheet.animations.caminar);

    // Posición inicial
    this.x = 30 * i;
    this.y = 30 * i;

    // Configuramos el sprite
    this.sprite.anchor.x = 0.5; // Punto de anclaje en el centro horizontal
    this.sprite.anchor.y = 0.5; // Punto de anclaje en el centro vertical
    this.sprite.animationSpeed = 0.1; // Velocidad de la animación
    this.sprite.play(); // Empezamos la animación

    // Lo agregamos al escenario
    this.juego.app.stage.addChild(this.sprite);

    // Damos vuelta algunos sprites para que miren para el otro lado
    if (i > 5) {
      this.sprite.scale.x = -1;
    }
  }

  update() {
    // Movimiento aleatorio
    this.x += (Math.random() - 0.5) * 5;
    this.y += (Math.random() - 0.5) * 5;
    this.render();
  }

  render() {
    // Actualizamos la posición y la profundidad
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.zIndex = this.sprite.y; // Ordenamos por profundidad según la posición Y
  }
}
