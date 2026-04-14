class Conejito {
  constructor(x, y, textura, i) {
    this.id = i;
    // this.x = x;
    // this.y = y;
    this.sprite = new PIXI.Sprite(textura);
    this.sprite.x = x;
    this.sprite.y = y;
    this.velocidadX = Math.random() * 10 - 5; // esto va random entre -5 y 5
    this.velocidadY = Math.random() * 10 - 5;
  }

  moverse() {
    this.sprite.y = this.sprite.y + this.velocidadY; //+ Math.random() * 5 - Math.random() * 10;
    this.sprite.x = this.sprite.x + this.velocidadX; //+ Math.random() * 5 - Math.random() * 10;

    //cuando el conejito se paso del limite inferior del canvas
    if (this.sprite.y > window.innerHeight) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.sprite.y = -this.sprite.height - Math.random() * 100;
    }

    //se va para arriba
    if (this.sprite.y < -this.sprite.height) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.sprite.y = window.innerHeight;
    }

    //se va para la izq
    if (this.sprite.x < -this.sprite.width) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.sprite.x = window.innerWidth;
    }

    //se va para la der
    if (this.sprite.x > window.innerWidth) {
      //lo teletransportamos para arriba de todo (mas alla del limite superior del canvas)
      this.sprite.x = 0;
    }
  }
}
