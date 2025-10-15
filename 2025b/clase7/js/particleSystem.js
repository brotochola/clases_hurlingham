class ParticleSystem {
  static texturas = {};
  static cantTexturas = 10;
  static getRandomSangre() {
    return ParticleSystem.texturas[
      "sangre" + Math.floor(Math.random() * ParticleSystem.cantTexturas)
    ];
  }
  constructor(juego) {
    this.juego = juego;
    this.particulas = [];
    this.pregenerarTexturas();
    this.gravedad = { x: 0, y: 0, z: 0.5 };
  }
  pregenerarTexturas() {
    //creo 10 circulos de sangre
    for (let i = 0; i < ParticleSystem.cantTexturas; i++) {
      //en este objeto propiedad estatica, creo 10 circulos de sangre
      ParticleSystem.texturas["sangre" + i] = crearCirculo(
        2,
        colorToHexString(mapColors(0xff0000, 0xaa0000, Math.random()))
      );
    }

    ParticleSystem.texturas["saliva"] = crearCirculo(1.5, "white");
  }

  hacerQueLeSalgaSangreAAlguien(quien, quienLePega) {
    if (
      !quien ||
      !quienLePega ||
      !quienLePega.posicion ||
      !quienLePega.sprite ||
      !quien.sprite ||
      !quien.posicion
    )
      return;

    const pos = {
      x: quien.posicion.x,
      y: quien.posicion.y,
      z: -quien.sprite.height * 0.9,
    };
    const direccion = limitarVector(
      {
        x: pos.x - quienLePega.posicion.x,
        y: pos.y - quienLePega.posicion.y,
      },
      2
    );

    const cant = 1 + Math.floor(Math.random() * 5);

    for (let i = 0; i < cant; i++) {
      const velocidadInicial = {
        x: direccion.x + Math.random() * 2 - 1,
        y: direccion.y + Math.random() * 2 - 1,
        z: -Math.random() * 3 - 1,
      };
      this.crearUnaParticula(
        pos,
        velocidadInicial,
        ParticleSystem.getRandomSangre()
      );
    }
  }

  crearUnaParticula(pos, velocidadInicial, textura) {
    const particula = new Particula(pos, velocidadInicial, textura, this);
    this.particulas.push(particula);
    this.juego.containerPrincipal.addChild(particula.sprite);
  }

  quitarParticula(particula) {
    this.juego.containerPrincipal.removeChild(particula.sprite);
    this.particulas = this.particulas.filter((p) => p !== particula);
    particula.sprite.destroy();
  }

  update() {
    for (let i = 0; i < this.particulas.length; i++) {
      this.particulas[i].update(this.gravedad);
    }
  }
}

class Particula {
  constructor(pos, velocidadInicial, textura, particleSystem) {
    this.particleSystem = particleSystem;
    this.posicion = { x: pos.x, y: pos.y, z: pos.z };
    this.velocidad = {
      x: velocidadInicial.x,
      y: velocidadInicial.y,
      z: velocidadInicial.z,
    };

    this.textura = textura;
    this.sprite = new PIXI.Sprite(textura);
    this.sprite.x = this.posicion.x;
    this.sprite.y = this.posicion.y + this.posicion.z;
    this.sprite.alpha = 1;
    this.sprite.anchor.set(0.5, 0.5); // Centrar el sprite
  }

  quitar() {
    this.particleSystem.quitarParticula(this);
  }

  update(gravedad) {
    if (this.posicion.z > 0) {
      this.sprite.alpha *= 0.95;

      if (this.sprite.alpha < 0.05) {
        this.quitar();
      }

      return;
    }
    //gravedad
    this.velocidad.z += gravedad.z * this.particleSystem.juego.ratioDeltaTime;

    //vel a pos
    this.posicion.z +=
      this.velocidad.z * this.particleSystem.juego.ratioDeltaTime;
    this.posicion.y +=
      this.velocidad.y * this.particleSystem.juego.ratioDeltaTime;
    this.posicion.x +=
      this.velocidad.x * this.particleSystem.juego.ratioDeltaTime;

    //pos a particula en pantalla
    this.sprite.y = this.posicion.y + this.posicion.z;
    this.sprite.x = this.posicion.x;

    // Actualizar zIndex basado en la posición Y para ordenamiento por profundidad
    this.sprite.zIndex =
      this.posicion.y + this.particleSystem.juego.BASE_Z_INDEX;
  }
}
