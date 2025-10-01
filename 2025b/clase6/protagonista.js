/**
 * CLASE PROTAGONISTA - PERSONAJE CONTROLADO POR EL JUGADOR
 *
 * Extiende la clase Persona con características especiales:
 * - Vida prácticamente infinita para evitar game over
 * - Visión ilimitada (puede ver a todos los enemigos)
 * - Bando 1 (diferente de los enemigos)
 * - Control por mouse en lugar de IA automática
 */
class Protagonista extends Persona {
  constructor(x, y, juego) {
    super(x, y, juego);

    // Configuración especial del protagonista
    this.vida = 9287364928348; // Vida prácticamente infinita
    this.vision = Infinity; // Visión ilimitada
    this.bando = 1; // Bando del jugador
    this.crearSpritesheetAnimado(this.bando);
    this.container.label = "prota";
  }

  morir() {
    super.morir();
    // this.juego.finDelJuego();
  }
  recibirDanio(danio) {
    super.recibirDanio(danio);
  }

  tick() {
    /**
     * CICLO DE ACTUALIZACIÓN DEL PROTAGONISTA
     *
     * Diferencias con Persona base:
     * - No usa separación automática (el jugador controla el movimiento)
     * - No ejecuta acciones de combate automáticas
     * - El movimiento se basa en input del mouse
     *
     * Orden de ejecución:
     * 1. Procesar input del jugador (mouse)
     * 2. Aplicar física del movimiento
     * 3. Actualizar contexto de combate
     * 4. Calcular datos de animación
     */
    this.irAlTarget(); // Control por mouse
    this.aplicarFisica(); // Física del movimiento

    this.verificarSiEstoyMuerto();

    // Actualizar contexto táctico
    this.enemigos = this.buscarPersonasQueNoSonDeMiBando();
    this.amigos = this.buscarPersonasDeMiBando();
    this.enemigoMasCerca = this.buscarEnemigoMasCerca();
    this.buscarObstaculosBienCerquitaMio();
    this.noChocarConObstaculos();
    this.repelerSuavementeObstaculos();

    // Datos para animación
    this.calcularAnguloYVelocidadLineal();
  }

  irAlTarget() {
    /**
     * SISTEMA DE CONTROL POR MOUSE
     *
     * Implementa movimiento hacia la posición del último clic:
     *
     * 1. DETECCIÓN DE INPUT:
     *    - Solo actúa si hay un clic registrado (mouse.up)
     *    - mouse.up contiene las coordenadas del último clic
     *
     * 2. CÁLCULO DE DIRECCIÓN:
     *    - Vector = posición_objetivo - posición_actual
     *    - Normalización para obtener dirección pura
     *
     * 3. DESACELERACIÓN PROGRESIVA:
     *    - Zona de frenado = rangoDeAtaque × 3
     *    - Factor cúbico: (distancia/zona_frenado)³
     *    - Esto crea una aproximación suave al objetivo
     *
     * 4. APLICACIÓN DE FUERZA:
     *    - Se suma a la aceleración (no reemplaza)
     *    - Permite combinación con otras fuerzas físicas
     *
     * Resultado: Control responsivo con parada suave
     */
    if (!this.juego.mouse.up) return;

    // Calcular vector hacia el objetivo
    const difX = this.juego.mouse.up.x - this.posicion.x;
    const difY = this.juego.mouse.up.y - this.posicion.y;
    const dist = calcularDistancia(this.posicion, this.juego.mouse.up);

    // Normalizar dirección
    const vectorNuevo = limitarVector({ x: difX, y: difY }, 1);

    // Sistema de desaceleración progresiva
    const distanciaParaEmpezarABajarLaVelocidad = this.rangoDeAtaque * 3;
    if (dist < distanciaParaEmpezarABajarLaVelocidad) {
      // Curva cúbica de desaceleración para aproximación suave
      const factor = (dist / distanciaParaEmpezarABajarLaVelocidad) ** 3;
      vectorNuevo.x *= factor;
      vectorNuevo.y *= factor;
    }

    // Aplicar fuerza de movimiento
    this.aceleracion.x += vectorNuevo.x;
    this.aceleracion.y += vectorNuevo.y;
  }
}
