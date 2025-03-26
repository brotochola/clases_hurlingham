class Equipo {
  constructor(id, formacion = "433") {
    this.formacion = formacion;
    this.id = id;
    this.nombre = generarNombreAleatorio();

    this.jugadores = [];
    this.cambiarFormacion(formacion);

    this.color=generarColorAleatorio()
    this.colorSecundario=generarColorAleatorio()
  }
  cambiarFormacion(formacion) {
    this.formacion = [];

    for (let i = 0; i < formacion.length; i++) {
      let numero = formacion[i];
      numero = parseInt(numero);
      this.formacion[i] = numero;
    }

    for (let jugador of this.jugadores) {
      jugador.cambiarFormacion(this.formacion);
    }
  }
}
