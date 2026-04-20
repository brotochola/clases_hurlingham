class Torre extends Casita {
  constructor(x, y, juego, tipo = 1) {
    super(x, y, juego);
    this.radio = 40;
    this.radioDeVision = 300;

    this.tipo = "torre";
    this.tipoDeTorre = tipo;
    this.cooldown = 80;
    this.tiempoDesdeUltimoDisparo = 0;
    this.inicializarSprite(juego.texturas[`torre${tipo}`]);

    this.lineaDisparo = new PIXI.Sprite(PIXI.Texture.WHITE);
    this.lineaDisparo.width = 2;
    this.lineaDisparo.anchor.set(0.5, 0);
    this.lineaDisparo.y = -this.sprite.height * 0.85;
    this.lineaDisparo.visible = false;
    this.container.addChild(this.lineaDisparo);

    juego.torres.push(this);
  }

  update(deltaTimeRatio) {
    super.update(deltaTimeRatio);

    this.tiempoDesdeUltimoDisparo += deltaTimeRatio * (1000 / 60);

    this.enemigosCerca = this.juego.getEnemigosCerca(
      this.posicion.x,
      this.posicion.y,
      this.radioDeVision,
    );

    if (this.enemigosCerca.length === 0) return;
    if (this.tiempoDesdeUltimoDisparo < this.cooldown) return;

    this.dispararA(this.enemigosCerca[0]);
    this.tiempoDesdeUltimoDisparo = 0;
  }

  dispararA(enemigo) {
    enemigo.recibirDaño(0.1);

    const dx = enemigo.posicion.x - this.posicion.x;
    const dy = enemigo.posicion.y - 30 - this.posicion.y - this.lineaDisparo.y;
    this.lineaDisparo.height = Math.hypot(dx, dy);
    this.lineaDisparo.rotation = Math.atan2(-dx, dy);
    this.lineaDisparo.visible = true;

    this.sprite.tint = 0xaa0000;
    setTimeout(() => {
      this.sprite.tint = 0xffffff;
      this.lineaDisparo.visible = false;
    }, 30);
  }
}

window.Torre = Torre;
