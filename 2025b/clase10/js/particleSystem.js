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
    this.particulas = []; // Array para iterar en update
    this.particulasActivas = new Set(); // Set para operaciones O(1)
    this.pool = []; // Pool de partículas inactivas reutilizables
    this.maxPoolSize = 100; // Tamaño máximo del pool
    this.pregenerarTexturas();
    this.pregenerarPool();
    this.gravedad = { x: 0, y: 0, z: 0.5 };
  }

  pregenerarPool() {
    // Pre-crear partículas para el pool
    // Esto evita allocation durante el gameplay
    for (let i = 0; i < 300; i++) {
      const particula = new Particula(
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        ParticleSystem.getRandomSangre(),
        this
      );
      particula.sprite.visible = false;
      this.juego.containerPrincipal.addChild(particula.sprite);
      this.pool.push(particula);
    }
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
    let particula;

    // Intentar obtener una partícula del pool
    if (this.pool.length > 0) {
      particula = this.pool.pop();
      particula.reinicializar(pos, velocidadInicial, textura);
    } else {
      // Si el pool está vacío, crear una nueva (fallback)
      particula = new Particula(pos, velocidadInicial, textura, this);
      this.juego.containerPrincipal.addChild(particula.sprite);
    }

    // Activar la partícula
    this.particulas.push(particula);
    this.particulasActivas.add(particula);
    particula.sprite.visible = true;
  }

  quitarParticula(particula) {
    // Remover de las estructuras activas
    this.particulasActivas.delete(particula);

    // OPTIMIZACIÓN: Usar removerDeArrayConSwapAndPop() para O(1) performance
    removerDeArrayConSwapAndPop(this.particulas, particula);

    // Devolver al pool en lugar de destruir
    if (this.pool.length < this.maxPoolSize) {
      particula.reset();
      particula.sprite.visible = false;
      this.pool.push(particula);
    } else {
      // Si el pool está lleno, destruir (esto casi nunca debería pasar)
      this.juego.containerPrincipal.removeChild(particula.sprite);
      particula.sprite.destroy();
    }
  }

  update() {
    for (let i = 0; i < this.particulas.length; i++) {
      this.particulas[i].update(this.gravedad);
    }
  }

  /**
   * Obtiene estadísticas del pool para debugging
   * @returns {Object} Estadísticas del sistema de partículas
   */
  getStats() {
    return {
      activas: this.particulas.length,
      enPool: this.pool.length,
      total: this.particulas.length + this.pool.length,
      poolUsage: `${Math.round(
        (this.particulas.length / (this.particulas.length + this.pool.length)) *
          100
      )}%`,
    };
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

  /**
   * Reinicializa una partícula del pool con nuevos valores
   * Esto es mucho más rápido que crear una nueva partícula
   */
  reinicializar(pos, velocidadInicial, textura) {
    this.posicion.x = pos.x;
    this.posicion.y = pos.y;
    this.posicion.z = pos.z;

    this.velocidad.x = velocidadInicial.x;
    this.velocidad.y = velocidadInicial.y;
    this.velocidad.z = velocidadInicial.z;

    this.sprite.texture = textura;
    this.sprite.x = this.posicion.x;
    this.sprite.y = this.posicion.y + this.posicion.z;
    this.sprite.alpha = 1;
  }

  /**
   * Resetea la partícula a un estado por defecto antes de devolverla al pool
   */
  reset() {
    this.posicion.x = 0;
    this.posicion.y = 0;
    this.posicion.z = 0;
    this.velocidad.x = 0;
    this.velocidad.y = 0;
    this.velocidad.z = 0;
    this.sprite.alpha = 1;
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
