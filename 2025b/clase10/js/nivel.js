class Nivel {
  constructor(jsonUrl, juego, callback) {
    this.juego = juego;
    this.jsonUrl = jsonUrl;
    this.items = [];
    this.callback = callback;
    this.loaded = false;

    this.cargarNivel();

    // this.offsetX = 0;
    // this.offsetY = 0;
  }

  /**
   * Carga el archivo JSON desde la URL especificada
   * @returns {Promise<void>}
   */
  async cargarNivel() {
    const response = await fetch(this.jsonUrl);
    if (!response.ok) {
      throw new Error(
        `Error al cargar el nivel: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    await this.parsearDatos(data);
    // this.ponerCablesEntrePostes();
    this.loaded = true;

    if (this.callback) this.callback();
  }

  ponerCablesEntrePostes() {
    //necesito q esten todos los postes cargados para poder poner los cables
    //sino hacia esto en la clase cable
    for (let poste of this.juego.postes) {
      const postesCercanos =
        poste.celdaActual.obtenerEntidadesPorClaseYTipoAcaYEnCEldasVecinas(
          "poste",
          "",
          2
        );

      for (let otroPoste of postesCercanos) {
        if (otroPoste !== poste) {
          poste.agregarCable(otroPoste);
        }
      }
    }
  }

  detectarLimites() {
    const changuiX = 500;
    const changuiY = 500;
    this.offsetX = 0;
    this.offsetY = 0;
    // Si no hay items, usar offsets por defecto
    if (!this.items || this.items.length === 0) {
      return console.warn("No hay items en el nivel");
    }

    // Encontrar las coordenadas mínimas
    this.minX = this.items[0].x;
    this.minY = this.items[0].y;
    this.maxX = this.items[0].x;
    this.maxY = this.items[0].y;

    this.items.forEach((item) => {
      if (item.background) return;
      if (item.x < this.minX) {
        this.minX = item.x;
      }
      if (item.y < this.minY) {
        this.minY = item.y;
      }
      if (item.x > this.maxX) {
        this.maxX = item.x;
      }
      if (item.y > this.maxY) {
        this.maxY = item.y;
      }
    });

    // Calcular offsets para centrar o posicionar correctamente
    // El offset negativo mueve los elementos hacia el origen
    this.offsetX = 0; //-this.minX + changuiX;
    this.offsetY = 0; //-this.minY + changuiY;
  }

  getLimits() {
    return {
      top: { x: (this.minX + this.maxX) / 2, y: this.minY }, //top
      right: { x: this.maxX, y: (this.minY + this.maxY) / 2 }, //right
      bottom: { x: (this.minX + this.maxX) / 2, y: this.maxY }, //bototm
      left: { x: this.minX, y: (this.minY + this.maxY) / 2 }, //left
    };
  }
  getCenterOfTheLimits() {
    const limits = this.getLimits();

    return {
      x: (limits.left.x + limits.right.x) / 2,
      y: (limits.top.y + limits.bottom.y) / 2,
    };
  }
  getDistanceToLimits(quien) {
    const limits = this.getLimits();
    const top = calcularDistancia(quien.posicion, limits.top);
    const right = calcularDistancia(quien.posicion, limits.right);
    const bottom = calcularDistancia(quien.posicion, limits.bottom);
    const left = calcularDistancia(quien.posicion, limits.left);
    return { top, right, bottom, left };
  }

  /**
   * Parsea los datos del JSON y los asigna a las propiedades de la clase
   * @param {Object} data - Datos del JSON
   */
  async parsearDatos(data) {
    // Cargar items
    if (data.items && Array.isArray(data.items)) {
      this.items = data.items.map((item) => ({
        id: item.id,
        type: item.type,
        x: item.x,
        y: item.y,
        scaleX: item.scaleX || 1,
        scaleY: item.scaleY || 1,
        background: !!item.background,
        isometric: !!item.isometric,
      }));
    }

    // Detectar límites y calcular offsets automáticamente
    this.detectarLimites();

    for (let item of this.items) {
      if (item.type.toLowerCase().startsWith("auto")) {
        const tipoDeAuto = parseInt(item.type.replace("auto", ""));
        const auto = new Auto(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          tipoDeAuto,
          item.scaleX
        );
        this.juego.autos.push(auto);
      } else if (item.type.toLowerCase().startsWith("poste")) {
        const arbol = new Poste(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          item.scaleX
        );
        this.juego.arboles.push(arbol);
      } else if (item.type.toLowerCase().startsWith("arbol")) {
        const tipoDeArbol = parseInt(item.type.replace("arbol", ""));
        const arbol = new Arbol(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          tipoDeArbol,
          item.scaleX
        );
        this.juego.arboles.push(arbol);
      } else if (item.type.toLowerCase().startsWith("palmera")) {
        const palmera = new Arbol(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          3,
          item.scaleX
        );
        this.juego.arboles.push(palmera);
      } else if (item.type.toLowerCase().startsWith("farol")) {
        const tipoDeFarol = parseInt(item.type.replace("farol", ""));
        const farol = new Farol(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          tipoDeFarol,
          item.scaleX
        );
      } else if (item.type.toLowerCase().startsWith("bondi")) {
        const tipoDeBondi = parseInt(item.type.replace("bondi", ""));
        const bondi = new Bondi(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          tipoDeBondi,
          item.scaleX
        );
        this.juego.autos.push(bondi);
      } else if (
        item.type.toLowerCase().startsWith("fuente_agua") ||
        item.type.toLowerCase().startsWith("ministerio_economia") ||
        item.type.toLowerCase().startsWith("monumento_belgrano") ||
        item.type.toLowerCase().startsWith("piramide") ||
        item.type.toLowerCase().startsWith("banco_nacion") ||
        item.type.toLowerCase().startsWith("casa_rosada") ||
        item.type.toLowerCase().startsWith("edificio") ||
        item.type.toLowerCase().startsWith("casa") ||
        item.type.toLowerCase().startsWith("basura") ||
        item.type.toLowerCase().startsWith("cabildo") ||
        item.type.toLowerCase().startsWith("catedral")
      ) {
        // const tipoDeMonumento = parseInt(item.type.replace("monumento", ""));
        const monumento = new Monumento(
          item.x + this.offsetX,
          item.y + this.offsetY,
          this.juego,
          item.type,
          item.scaleX
        );
        this.juego.monumentos.push(monumento);
      } else if (item.background) {
        //cualquier item que tenga puesto backgroudn:true es un fondo y es solo un sprite, no una instancia de ninguna clase nuestra
        const sprite = new PIXI.Sprite(
          await PIXI.Assets.load("assets/pixelart/" + item.type + ".png")
        );
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(item.scaleX, item.scaleY);
        sprite.x = item.x + this.offsetX;
        sprite.y = item.y + this.offsetY;
        this.juego.containerBG.addChild(sprite);
        sprite.label = item.type;
        sprite.zIndex = -99999999 - item.y;
      }
    }
    return 1;
  }

  /**
   * Obtiene todos los items del nivel
   * @returns {Array} Array de items
   */
  obtenerItems() {
    return this.items;
  }

  /**
   * Obtiene items por tipo
   * @param {string} tipo - Tipo de item a buscar
   * @returns {Array} Array de items del tipo especificado
   */
  obtenerItemsPorTipo(tipo) {
    return this.items.filter((item) => item.type === tipo);
  }

  /**
   * Obtiene un item por su ID
   * @param {number} id - ID del item
   * @returns {Object|null} Item encontrado o null
   */
  obtenerItemPorId(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  /**
   * Obtiene items que son elementos de fondo
   * @returns {Array} Array de items de fondo
   */
  obtenerItemsFondo() {
    return this.items.filter((item) => item.background === true);
  }

  /**
   * Obtiene items que NO son elementos de fondo
   * @returns {Array} Array de items que no son de fondo
   */
  obtenerItemsFrente() {
    return this.items.filter((item) => item.background !== true);
  }

  /**
   * Obtiene un asset por su nombre
   * @param {string} nombre - Nombre del asset
   * @returns {string|null} Data URL del asset o null
   */
  obtenerAsset(nombre) {
    return this.assets[nombre] || null;
  }

  /**
   * Obtiene todos los assets disponibles
   * @returns {Object} Objeto con todos los assets
   */
  obtenerAssets() {
    return this.assets;
  }

  /**
   * Obtiene la configuración de la grilla
   * @returns {Object} Configuración de la grilla
   */
  obtenerConfiguracionGrilla() {
    return {
      angle: this.gridAngle,
      size: this.gridSize,
      visible: this.gridVisible,
    };
  }

  /**
   * Obtiene la configuración de la cámara
   * @returns {Object} Configuración de la cámara
   */
  obtenerConfiguracionCamara() {
    return { ...this.camera };
  }

  /**
   * Verifica si el nivel está cargado
   * @returns {boolean} True si el nivel está cargado
   */
  estasCargado() {
    return this.loaded;
  }

  /**
   * Obtiene items dentro de un área rectangular
   * @param {number} x - Coordenada X del área
   * @param {number} y - Coordenada Y del área
   * @param {number} ancho - Ancho del área
   * @param {number} alto - Alto del área
   * @returns {Array} Array de items dentro del área
   */
  obtenerItemsEnArea(x, y, ancho, alto) {
    return this.items.filter(
      (item) =>
        item.x >= x && item.x <= x + ancho && item.y >= y && item.y <= y + alto
    );
  }

  /**
   * Cuenta la cantidad de items por tipo
   * @returns {Object} Objeto con el conteo de items por tipo
   */
  contarItemsPorTipo() {
    const conteo = {};
    this.items.forEach((item) => {
      conteo[item.type] = (conteo[item.type] || 0) + 1;
    });
    return conteo;
  }

  /**
   * Obtiene información resumida del nivel
   * @returns {Object} Información del nivel
   */
  obtenerInfoNivel() {
    return {
      url: this.jsonUrl,
      totalItems: this.items.length,
      itemsFondo: this.obtenerItemsFondo().length,
      itemsFrente: this.obtenerItemsFrente().length,
      totalAssets: Object.keys(this.assets).length,
      tiposItems: Object.keys(this.contarItemsPorTipo()),
      configuracionGrilla: this.obtenerConfiguracionGrilla(),
      configuracionCamara: this.obtenerConfiguracionCamara(),
      cargado: this.loaded,
    };
  }
}

// Exportar la clase para uso en otros módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = Nivel;
}
