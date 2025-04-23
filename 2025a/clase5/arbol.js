class Arbol extends Entidad {
  constructor(x, y, juego) {
    super(x, y, juego);
    this.comida = 1;

    this.cargarSpriteDeArbol();
    this.container.name = "arbol_" + this.id;
  }
  restarComida(quien) {
    if (this.comida > 0) this.comida -= 0.001;
    else {
      this.morir();
    }

    // console.log("arbol", this, this.comida);
  }

  morir() {
    for (let i = 0; i < this.juego.arboles.length; i++) {
      const presa = this.juego.arboles[i];
      if (presa.id == this.id) {
        this.muerta = true;
        this.juego.arboles.splice(i, 1);
        this.container.destroy();
        return;
      }
    }
  }

  async cargarSpriteDeArbol() {
    let texture = await PIXI.Assets.load("arbol.png");

    this.sprite = new PIXI.Sprite(texture);
    this.container.addChild(this.sprite);
    this.sprite.anchor.set(0.5, 1);
    this.yaCargoElSprite = true;
    this.container.x = this.x;
    this.container.y = this.y;
    this.container.zIndex = Math.floor(this.y);
  }

  update() {
    //si el sprite no existe retorna, por lo cual no ejecuta mas nada
    if (!this.sprite) return;
    if (this.muerta) return;

    this.sprite.scale.x = this.comida;
    this.sprite.scale.y = this.comida;
  }
}
