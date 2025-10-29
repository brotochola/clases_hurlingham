/**
 * VECTOR POOL - OBJECT POOLING PARA VECTORES 2D
 *
 * Problema: En cada frame se crean cientos de objetos temporales {x, y}
 * para cálculos de física, flocking, etc. Esto genera mucho garbage collection.
 *
 * Solución: Pool de vectores 2D reutilizables
 *
 * ==================================================================================
 * GUÍA DE USO:
 * ==================================================================================
 *
 * ✅ USA EL POOL CUANDO (Safe):
 * - Cálculos que se usan inmediatamente y se descartan
 * - Operaciones dentro de un solo método/función
 * - Vectores intermedios en cálculos de física
 *
 * ❌ NO USES EL POOL CUANDO (Unsafe):
 * - Necesitas guardar el vector en una propiedad (this.miVector = ...)
 * - El vector debe persistir entre frames
 * - Lo agregas a un array que persiste
 * - Lo devuelves de una función y no sabes cómo se usará
 *
 * ==================================================================================
 * EJEMPLOS:
 * ==================================================================================
 *
 * // ✅ CORRECTO - Uso temporal inmediato
 * cohesion() {
 *   const temp = vectorPool.get(difX, difY);
 *   temp.normalize().multiply(factor);
 *   this.aceleracion.x += temp.x;
 *   this.aceleracion.y += temp.y;
 *   vectorPool.release(temp); // Liberar cuando termines
 * }
 *
 * // ✅ CORRECTO - Múltiples vectores temporales
 * calcularFuerzas() {
 *   const v1 = vectorPool.get(x1, y1);
 *   const v2 = vectorPool.get(x2, y2);
 *   // ... usar v1 y v2 ...
 *   vectorPool.releaseMultiple(v1, v2); // Liberar ambos
 * }
 *
 * // ❌ INCORRECTO - Guardar en propiedad
 * constructor() {
 *   this.direccion = vectorPool.get(0, 0); // ¡MAL! Será reutilizado
 *   // En su lugar usa: this.direccion = { x: 0, y: 0 };
 * }
 *
 * // ❌ INCORRECTO - Agregar a array persistente
 * this.waypoints.push(vectorPool.get(x, y)); // ¡MAL!
 * // En su lugar: this.waypoints.push({ x, y });
 *
 * // ✅ ALTERNATIVA - Usar objeto simple cuando necesites persistir
 * const permanente = vectorPool.createSimple(x, y); // Crea {x, y} normal
 *
 * ==================================================================================
 * REGLA DE ORO:
 * Si el vector vive más allá del método actual → NO uses el pool
 * Si el vector se usa y se descarta en el mismo método → USA el pool
 * ==================================================================================
 */

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  limit(max) {
    const magSq = this.magnitudeSquared();
    if (magSq > max * max) {
      this.normalize().multiply(max);
    }
    return this;
  }
}

class VectorPool {
  static pool = [];
  static active = new Set();
  static maxPoolSize = 500;
  static initialized = false;

  /**
   * Inicializa el pool con vectores pre-creados
   */
  static initialize(initialSize = 200) {
    if (this.initialized) return;

    // Pre-crear vectores
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Vector2D());
    }

    this.initialized = true;
  }

  /**
   * Obtiene un vector del pool
   * IMPORTANTE: Debe ser liberado con release() cuando ya no se use
   *
   * Si Juego.CONFIG.usar_pool_vectores === false, devuelve un objeto simple {x, y}
   * para comparar performance con y sin pooling
   */
  static get(x = 0, y = 0) {
    // Si el pool está desactivado, devolver objeto simple (sin pooling)
    if (typeof Juego !== "undefined" && !Juego.CONFIG.usar_pool_vectores) {
      return new Vector2D(x, y);
    }

    // Lazy initialization
    if (!this.initialized) {
      this.initialize();
    }

    let vector;

    if (this.pool.length > 0) {
      vector = this.pool.pop();
      vector.set(x, y);
    } else {
      // Pool vacío, crear uno nuevo (fallback)
      vector = new Vector2D(x, y);
    }

    this.active.add(vector);
    return vector;
  }

  /**
   * Libera un vector y lo devuelve al pool
   *
   * Si Juego.CONFIG.usar_pool_vectores === false, no hace nada
   * (el objeto simple será recogido por el garbage collector)
   */
  static release(vector) {
    if (!vector) return;

    // Si el pool está desactivado, no hacer nada
    if (typeof Juego !== "undefined" && !Juego.CONFIG.usar_pool_vectores) {
      return;
    }

    // Si es un objeto simple {x, y} en lugar de Vector2D, ignorar
    if (!(vector instanceof Vector2D)) {
      return;
    }

    this.active.delete(vector);

    if (this.pool.length < this.maxPoolSize) {
      vector.reset();
      this.pool.push(vector);
    }
  }

  /**
   * Libera múltiples vectores a la vez
   */
  static releaseMultiple(...vectors) {
    for (const vector of vectors) {
      this.release(vector);
    }
  }

  /**
   * MÉTODOS DE UTILIDAD QUE DEVUELVEN OBJETOS SIMPLES (NO DEL POOL)
   * Estos son seguros para guardar en propiedades
   */

  /**
   * Crea un objeto simple {x, y} - NO es del pool, es seguro guardarlo
   */
  static createSimple(x = 0, y = 0) {
    return { x, y };
  }

  /**
   * Limita un vector y devuelve un objeto simple {x, y}
   * Compatible con la función limitarVector() existente
   */
  static limitarVectorSimple(vector, magnitudMaxima = 1) {
    const magnitudActual = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (magnitudActual > magnitudMaxima) {
      const escala = magnitudMaxima / magnitudActual;
      return {
        x: vector.x * escala,
        y: vector.y * escala,
      };
    }

    return { x: vector.x, y: vector.y };
  }

  /**
   * Obtiene estadísticas del pool
   */
  static getStats() {
    const isEnabled =
      typeof Juego !== "undefined" ? Juego.CONFIG.usar_pool_vectores : true;

    return {
      enabled: isEnabled,
      enPool: this.pool.length,
      activos: this.active.size,
      total: this.pool.length + this.active.size,
      poolUsage:
        this.active.size > 0
          ? `${Math.round(
              (this.active.size / (this.pool.length + this.active.size)) * 100
            )}%`
          : "0%",
    };
  }
}

// Inicializar automáticamente el pool cuando se carga el script
VectorPool.initialize();
