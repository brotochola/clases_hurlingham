class Poste extends EntidadEstatica {
  constructor(x, y, juego, scaleX) {
    super(x, y, juego);
    this.radio = 10;
    this.scaleX = scaleX || 1;
    this.container.label = "poste" + this.id;
    this.crearSprite();
    this.juego.obstaculos.push(this);
    // this.actualizarMiPosicionEnLaGrilla();
    this.juego.postes.push(this);
    this.cables = [];
  }
  agregarCable(otroPoste) {
    console.log("agregando cable", this.id, otroPoste.id);
    const cable = Cable.crearCable(this, otroPoste, this.juego);
    this.cables.push(cable);
    otroPoste.cables.push(cable);
  }

  async crearSprite() {
    this.sprite = new PIXI.Sprite(
      await PIXI.Assets.load("assets/pixelart/poste.png")
    );
    this.sprite.anchor.set(0.5, 1);
    this.container.addChild(this.sprite);
    this.sprite.scale.x = this.scaleX;
    this.render();
  }

  tick() {}
}
