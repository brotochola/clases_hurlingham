class Amigo extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);

    this.bando = 1;

    // Parámetros para el Arrival Behaviour
    this.radioLlegadaAlLider = 50; // Radio donde empieza a desacelerar
    this.radioParaBajarLaVelocidad = this.vision * 0.5;
    this.factorSeguirAlLider = 0.63;
    this.factorCohesion = 0.1; //a los amigos les bajo la cohesion pq igual estan siguiendo al lider
    this.factorAlineacion = 0.05; //a los amigos les bajo la alineacion pq igual estan siguiendo al lider
    this.crearSpritesheetAnimado(this.bando);
  }

  seguirAlLider() {
    if (!this.juego.protagonista) return;
    const dist = calcularDistancia(
      this.posicion,
      this.juego.protagonista.posicion
    );
    if (dist > this.vision) return;

    const difX = this.juego.protagonista.posicion.x - this.posicion.x;
    const difY = this.juego.protagonista.posicion.y - this.posicion.y;

    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    if (dist < this.radioLlegadaAlLider) {
      //esta muy cerca, se aleja
      vectorNuevo.x *= -this.radioLlegadaAlLider / dist;
      vectorNuevo.y *= -this.radioLlegadaAlLider / dist;
    } else if (
      dist < this.radioParaBajarLaVelocidad &&
      dist > this.radioLlegadaAlLider
    ) {
      //si estoy a una distancia q no es al ladito y tampoco es tan lejos.
      return;

      // Reducción más pronunciada cuando están muy cerca
      const factor = (dist / this.radioParaBajarLaVelocidad) ** 3;

      vectorNuevo.x *= factor;
      vectorNuevo.y *= factor;
    } else if (dist < this.vision && dist > this.radioParaBajarLaVelocidad) {
      //esta lejos, va de una
    }

    this.aceleracion.x += vectorNuevo.x * this.factorSeguirAlLider;
    this.aceleracion.y += vectorNuevo.y * this.factorSeguirAlLider;
  }

  tick() {
    if (this.muerto) return;
    this.seguirAlLider();

    this.cohesion();

    this.alineacion();
    this.separacion();

    // this.escapar();
    // this.perseguir();

    this.aplicarFisica();

    this.verificarSiEstoyMuerto();

    this.enemigos = this.buscarPersonasQueNoSonDeMiBando();
    this.amigos = this.buscarPersonasDeMiBando();
    this.enemigoMasCerca = this.buscarEnemigoMasCerca();

    // this.pegarSiEstaEnMiRango();

    this.calcularAnguloYVelocidadLineal();

    if (this.enemigoMasCerca) {
      // this.asignarTarget(this.enemigoMasCerca);
    }
  }
}
