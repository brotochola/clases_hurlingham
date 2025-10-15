class Nivel {
  constructor(jsonUrl, juego) {
    this.juego = juego;
    this.jsonUrl = jsonUrl;
    this.items = [];

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
    this.parsearDatos(data);
    this.loaded = true;
  }

  detectarLimites() {
    const changuiX = 500;
    const changuiY = 500;
    // Si no hay items, usar offsets por defecto
    if (!this.items || this.items.length === 0) {
      this.offsetX = -4000;
      this.offsetY = -4000;
      return;
    }

    // Encontrar las coordenadas mínimas
    let minX = this.items[0].x;
    let minY = this.items[0].y;

    this.items.forEach((item) => {
      if (item.x < minX) {
        minX = item.x;
      }
      if (item.y < minY) {
        minY = item.y;
      }
    });

    // Calcular offsets para centrar o posicionar correctamente
    // El offset negativo mueve los elementos hacia el origen
    this.offsetX = -minX + changuiX;
    this.offsetY = -minY + changuiY;
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
        this.juego.faroles.push(farol);
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
        item.type.toLowerCase().startsWith("cabildo")
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
        sprite.zIndex = -999999999 + item.y;
      }
    }
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
