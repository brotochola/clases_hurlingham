// Zombie.js

// Asegúrate de que el archivo utils.js esté incluido en tu index.html antes de este script

class Bala extends Objeto {
  constructor(x, y, juego, velX, velY) {
    super(x, y, 10, 1, juego); // Tamaño del zombie
    this.velocidad.x = velX;
    this.velocidad.y = velY;

    this.juego = juego;
    this.grid = juego.grid; // Referencia a la grid
    this.vision = 2;
    // Cargar la textura del sprite desde el <img>
    this.sprite.texture = PIXI.Texture.from("./bala.png");

    // Asegurarse de que el tamaño sea 25x25
    this.sprite.width = 2;
    this.sprite.height = 2;
    this.debug = 0;

    this.juego.app.stage.addChild(this.sprite);
  }

  update() {
    super.update();

    if (
      this.sprite.x < 0 ||
      this.sprite.y > window.innerHeight ||
      this.sprite.y < 0 ||
      this.sprite.x > window.innerWidth
    ) {
      this.borrar();
    }

    let objs = this.getObjetosEnMiCelda().filter((k) => k instanceof Zombie);
    if (objs.length > 0) {
      let elZombieMasCercano;
      let distMin = 99999;
      let cual = null;
      //VEO CUAL ES EL ZOMBIE MS CERCANO CUANDO LA BALA LLEGA A UNA CELDA CON ZOMBIES
      for (let i = 0; i < objs.length; i++) {
        let dist = calculoDeDistanciaRapido(
          this.sprite.x,
          this.sprite.y,
          objs[i].sprite.x,
          objs[i].sprite.y
        );
        if (dist < distMin) {
          distMin = dist;
          cual = i;
        }
      } //for
      //si encontro un zombie
      if (cual != null) {
        objs[cual].recibirTiro();
        this.borrar();
      }
    } //objs.length
  } //update
}
