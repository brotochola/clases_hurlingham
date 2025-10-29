class Celda {
  constructor(juego, anchoCelda, x, y) {
    this.anchoCelda = anchoCelda;
    this.juego = juego;
    // Usar Set en vez de Array para operaciones O(1) en agregar/sacar
    // Set.add() = O(1), Set.delete() = O(1) vs Array.splice() = O(n)
    this.entidadesAca = new Set();
    this.entidadesPorClase = {};
    this.entidadesPorBando = {}; // Almacenamiento optimizado por bando
    this.emisoresLuz = new Set(); // NUEVO: Set específico para faroles/fuegos (cosas con radioLuz)
    this.id = juego.grilla.obtenerHashDePosicion(x, y);
    this.x = x;
    this.y = y;
    this.celdasVecinasCache = {}; // Caché indexado por cantDeCeldasParaMirar
    this.precargarCeldasVecinas();
  }
  precargarCeldasVecinas() {
    setTimeout(() => {
      for (let i = 1; i <= 7; i++) {
        this.obtenerCeldasVecinas(i);
      }
    }, Math.random() * 100 + 100);
  }

  agregarAlSetPorClaseYTipo(quien) {
    let aCualSetVa = quien.constructor.name.toLowerCase();
    if (aCualSetVa === "enemigo") {
      aCualSetVa = "enemigo" + quien.bando;
    }
    if (!this.entidadesPorClase[aCualSetVa])
      this.entidadesPorClase[aCualSetVa] = new Set();
    this.entidadesPorClase[aCualSetVa].add(quien);

    // También guardar por bando si es una Persona (tiene propiedad bando)
    if (quien.bando !== undefined) {
      if (!this.entidadesPorBando[quien.bando])
        this.entidadesPorBando[quien.bando] = new Set();
      this.entidadesPorBando[quien.bando].add(quien);
    }

    // NUEVO: También agregar a emisoresLuz si tiene radioLuz > 0
    if (quien.radioLuz && quien.radioLuz > 0) {
      this.emisoresLuz.add(quien);
    }
  }

  sacarDelSetPorClaseYTipo(quien) {
    let aCualSetVa = quien.constructor.name.toLowerCase();
    if (aCualSetVa === "enemigo") {
      aCualSetVa = "enemigo" + quien.bando;
    }
    if (this.entidadesPorClase[aCualSetVa]) {
      this.entidadesPorClase[aCualSetVa].delete(quien);
    }

    // También sacar del set por bando si corresponde
    if (quien.bando !== undefined && this.entidadesPorBando[quien.bando]) {
      this.entidadesPorBando[quien.bando].delete(quien);
    }

    // NUEVO: También sacar de emisoresLuz si tiene radioLuz
    if (quien.radioLuz && quien.radioLuz > 0) {
      this.emisoresLuz.delete(quien);
    }
  }

  agregame(quien) {
    if (!quien) return;
    // Set.add() es O(1) - más rápido que Array.push() para grandes cantidades
    this.entidadesAca.add(quien);
    this.agregarAlSetPorClaseYTipo(quien);
  }

  sacame(quien) {
    if (!quien) return;
    // Set.delete() es O(1) - MUY superior al Array.splice() que era O(n)
    // Antes: recorría todo el array buscando la entidad
    // Ahora: eliminación directa en tiempo constante
    this.entidadesAca.delete(quien);
    this.sacarDelSetPorClaseYTipo(quien);
  }

  getEnemigosPorBando(bando) {
    return this.entidadesPorClase["enemigo" + bando];
  }

  obtenerEntidadesAcaYEnCEldasVecinas(cantDeCeldasParaMirar) {
    // Obtener celdas vecinas desde el caché
    const celdasVecinas =
      this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    const entidadesCerca = [];

    // Agregar las entidades de esta celda primero
    // Set es iterable, así que spread operator funciona perfecto
    entidadesCerca.push(...this.entidadesAca);

    // Agregar entidades de celdas vecinas
    // Optimizado: una sola pasada sin map/flat/filter intermedios
    for (const celda of celdasVecinas) {
      if (celda && celda.entidadesAca) {
        entidadesCerca.push(...celda.entidadesAca);
      }
    }

    return entidadesCerca;
  }

  obtenerEntidadesPorClaseYTipoAca(clase, tipo) {
    // Si es enemigo, concatenar con el bando (tipo), sino usar solo la clase
    const key = clase === "enemigo" ? clase + tipo : clase;
    return this.entidadesPorClase[key] || new Set();
  }

  obtenerEntidadesPorClaseYTipoAcaYEnCEldasVecinas(
    clase,
    tipo,
    cantDeCeldasParaMirar = 1
  ) {
    const key = clase === "enemigo" ? clase + tipo : clase;
    const celdasVecinas =
      this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    const entidadesCerca = [];

    // Agregar entidades de esta celda
    const entidadesAca = this.entidadesPorClase[key];
    if (entidadesAca) {
      entidadesCerca.push(...entidadesAca);
    }

    // Agregar entidades de celdas vecinas
    for (const celda of celdasVecinas) {
      if (celda && celda.entidadesPorClase[key]) {
        entidadesCerca.push(...celda.entidadesPorClase[key]);
      }
    }

    return entidadesCerca;
  }

  obtenerPersonasPorBandosExcluidosEnCeldasVecinas(
    bandosAExcluir,
    cantDeCeldasParaMirar
  ) {
    const celdasVecinas =
      this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    const personas = [];

    const agregarDeBando = (bando) => {
      // De esta celda
      if (this.entidadesPorBando[bando]) {
        personas.push(...this.entidadesPorBando[bando]);
      }
      // De celdas vecinas
      for (const celda of celdasVecinas) {
        if (celda && celda.entidadesPorBando[bando]) {
          personas.push(...celda.entidadesPorBando[bando]);
        }
      }
    };

    // Iterar todos los bandos posibles (1-7 para pandillas)
    for (let i = 1; i <= 7; i++) {
      if (!bandosAExcluir.includes(i)) {
        agregarDeBando(i);
      }
    }

    // También buscar policías y civiles si no están excluidos
    if (!bandosAExcluir.includes("policia")) agregarDeBando("policia");
    if (!bandosAExcluir.includes("civil")) agregarDeBando("civil");

    return personas;
  }

  obtenerPersonasPorBandoEnCeldasVecinas(bando, cantDeCeldasParaMirar) {
    const celdasVecinas =
      this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    const personas = [];

    // De esta celda
    if (this.entidadesPorBando[bando]) {
      personas.push(...this.entidadesPorBando[bando]);
    }

    // De celdas vecinas
    for (const celda of celdasVecinas) {
      if (celda && celda.entidadesPorBando[bando]) {
        personas.push(...celda.entidadesPorBando[bando]);
      }
    }

    return personas;
  }

  /**
   * NUEVO: Obtener emisores de luz (faroles, fuegos) cercanos
   * Mucho más eficiente que filtrar todas las entidades
   * O(1) acceso directo vs O(n) filtrado
   */
  obtenerEmisoresLuzCercanos(cantDeCeldasParaMirar) {
    const celdasVecinas =
      this.obtenerCeldasVecinas(cantDeCeldasParaMirar) || [];
    const emisores = [];

    // De esta celda
    if (this.emisoresLuz.size > 0) {
      emisores.push(...this.emisoresLuz);
    }

    // De celdas vecinas
    for (const celda of celdasVecinas) {
      if (celda && celda.emisoresLuz && celda.emisoresLuz.size > 0) {
        emisores.push(...celda.emisoresLuz);
      }
    }

    return emisores;
  }

  obtenerCeldasVecinas(cantDeCeldasParaMirar) {
    // Verificar si ya tenemos el resultado en caché para esta distancia
    if (this.celdasVecinasCache[cantDeCeldasParaMirar]) {
      return this.celdasVecinasCache[cantDeCeldasParaMirar];
    }

    let arr = [];
    for (let x = -cantDeCeldasParaMirar; x <= cantDeCeldasParaMirar; x++) {
      for (let y = -cantDeCeldasParaMirar; y <= cantDeCeldasParaMirar; y++) {
        const newGridX = this.x + x;
        const newGridY = this.y + y;

        const celda = this.juego.grilla.obtenerCeldaEnCoordenadas(
          newGridX,
          newGridY
        );
        if (!celda) continue;

        if (this != celda) arr.push(celda);
      }
    }

    // Guardar en caché antes de retornar
    this.celdasVecinasCache[cantDeCeldasParaMirar] = arr;
    return arr;
  }

  dibujar() {
    const graficoDebug = this.juego.graficoDebug;
    if (!graficoDebug) return;

    // Calcular la posición en el mundo
    const posX = this.x * this.anchoCelda;
    const posY = this.y * this.anchoCelda;

    // Color dependiendo de si hay entidades o no
    // Set usa .size en vez de .length
    const color = this.entidadesAca.size > 0 ? 0xff0000 : 0x00ff00;
    const alpha = this.entidadesAca.size > 0 ? 0.3 : 0.1;

    // Dibujar el rectángulo de la celda
    graficoDebug.rect(posX, posY, this.anchoCelda, this.anchoCelda);
    graficoDebug.fill({ color: color, alpha: alpha });
    graficoDebug.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
  }
}
