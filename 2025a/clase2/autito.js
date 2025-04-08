class Autito {
  constructor(juego, resources, i) {
    this.juego = juego;

    this.x = 30 * i;
    this.y = 30 * i;

    this.spriteDelAuto = new PIXI.Sprite(resources.auto.texture);

    this.spriteDelAuto.anchor.x = 0.5;
    this.spriteDelAuto.anchor.y = 0.7;

    this.juego.app.stage.addChild(this.spriteDelAuto);
    if (i > 5) {
      this.spriteDelAuto.scale.x = -1;
    }
  }

  update() {
    //hacer los calculos de donde poner al objeto

    this.x += (Math.random() - 0.5) * 5;
    this.y += (Math.random() - 0.5) * 5;

    this.render();
  }

  render() {
    this.spriteDelAuto.x = this.x;
    this.spriteDelAuto.y = this.y;
    this.spriteDelAuto.zIndex = this.spriteDelAuto.y;
    //poner al objeto en su lugar en la pantalla
  }
}
