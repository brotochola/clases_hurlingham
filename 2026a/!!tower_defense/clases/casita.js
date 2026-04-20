class Casita extends GameObject {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.tipo = "casita";
    this.radio = 30;
    this.estatico = true;

    juego.casitas.push(this);
  }

  inicializarSprite(textura, escala = 1) {
    this.textura = textura;
    this.sprite = new PIXI.Sprite(this.textura);
    this.configurarOrigen(this.sprite);
    this.sprite.scale.set(escala);

    this.container.addChild(this.sprite);
    this.render();
  }
}

window.Casita = Casita;
