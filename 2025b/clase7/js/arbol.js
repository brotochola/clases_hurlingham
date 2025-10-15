class Arbol extends EntidadEstatica {
  constructor(x, y, juego, tipo, scaleX) {
    super(x, y, juego);
    this.radio = 12;
    this.scaleX = scaleX || 1;
    this.tipo = tipo || Math.floor(Math.random() * 2) + 1;
    this.container.label = "arbol" + this.id;
    this.crearSprite();
    this.juego.obstaculos.push(this);

    // Para la animación de skew
    this.offsetSkew = Math.random() * Math.PI * 2; // Offset aleatorio para que no todos se muevan igual
    this.velocidadSkew = 0.1 + Math.random() * 0.05; // Velocidad muy lenta
    this.cantidadDeSkew = 0.005 + Math.random() * 0.01;

    this.offsetSkew2 = Math.random() * Math.PI * 2; // Offset aleatorio para que no todos se muevan igual
    this.velocidadSkew2 = 0.1 + Math.random() * 0.05; // Velocidad muy lenta
    this.cantidadDeSkew2 = 0.005 + Math.random() * 0.01;
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/arbol" + this.tipo + ".png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {
    if (this.sprite) {
      // Incrementar el tiempo lentamente

      // Aplicar skew suave usando seno (-0.05 a 0.05 radianes, muy sutil)
      this.sprite.skew.x =
        Math.sin(
          this.juego.ahora * 0.01 * this.velocidadSkew + this.offsetSkew
        ) *
          this.cantidadDeSkew +
        Math.sin(
          this.juego.ahora * 0.03 * this.velocidadSkew2 + this.offsetSkew2
        ) *
          this.cantidadDeSkew2 *
          0.3;
    }
  }
}
