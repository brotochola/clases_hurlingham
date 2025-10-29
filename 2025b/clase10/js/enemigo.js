class Enemigo extends Persona {
  constructor(x, y, juego, bando) {
    super(x, y, juego);

    this.bando = bando || Math.floor(Math.random() * 3) + 2;
    this.crearSpritesheetAnimado(this.bando);
    this.crearFSMparaComportamientos();
    this.esperarAQueTengaSpriteCargado(() => {
      this.crearBarritaVida();
    });
  }

  crearFSMparaComportamientos() {
    this.behaviorFSM = new FSM(this, {
      states: {
        idle: IdleBehaviorState,
        enCombate: EnCombateBehaviorState,
        pasadoDeBando: PasadoDeBandoBehaviorState,
        huyendo: HuyendoBehaviorState,
      },
      initialState: "idle",
    });
  }

  tick() {
    if (this.muerto) return;

    this.verificarSiEstoyMuerto();

    this.actualizarMiPosicionEnLaGrilla();

    if (this.behaviorFSM) this.behaviorFSM.update();
  }
}
