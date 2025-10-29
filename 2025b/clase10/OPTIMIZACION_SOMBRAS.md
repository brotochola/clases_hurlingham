# 🚀 Sistema Optimizado de Sombras Proyectadas

## 📊 Comparativa de Performance

### Método VIEJO (geometría)

```
Por cada sombra cada frame:
- 5+ operaciones trigonométricas (atan2, sin, cos, asin, sqrt)
- Dibujar polígonos con quadraticCurveTo
- Aplicar blur filter
= ~50-100 operaciones × 30-50 sombras = 1500-5000 ops/frame
```

### Método NUEVO (texturas) ✅

```
Por cada sombra cada frame:
- 1 cálculo de ángulo (atan2)
- 1 posicionamiento de sprite
- 1 rotación (transformación matricial en GPU)
- 1 escalado
= ~10 operaciones × 30-50 sombras = 300-500 ops/frame

GANANCIA: 10-20x más rápido! 🎯
```

---

## 🎮 Cómo usar

### Activar el sistema optimizado

```javascript
// En js/juego.js línea 23
Juego.CONFIG.usar_sombras_con_texturas = true; // ✅ NUEVO (rápido)
```

### Volver al método viejo

```javascript
Juego.CONFIG.usar_sombras_con_texturas = false; // ❌ VIEJO (lento)
```

### Ajustar cantidad de sombras

```javascript
// Más sombras = más realismo pero menos FPS
Juego.CONFIG.max_sombras_por_farol = 15; // Default
Juego.CONFIG.max_sombras_por_farol = 10; // Mejor performance
Juego.CONFIG.max_sombras_por_farol = 5; // Máxima performance
Juego.CONFIG.max_sombras_por_farol = 25; // Máximo realismo
```

### Ajustar efecto pixelado 🎨

```javascript
// Efecto pixelado tipo retro (solo con sombras de texturas)
// Más bajo = más pixelado, más alto = más suave

Juego.CONFIG.escala_textura_sombras = 1.0; // Sin pixelado (suave)
Juego.CONFIG.escala_textura_sombras = 0.2; // Ligeramente pixelado
Juego.CONFIG.escala_textura_sombras = 0.1; // Pixelado (default) ✅
Juego.CONFIG.escala_textura_sombras = 0.05; // Muy pixelado (estilo retro)
Juego.CONFIG.escala_textura_sombras = 0.02; // Ultra pixelado
```

**Nota:** Valores más bajos = más pixelado = mejor performance (textura más pequeña)

---

## 🔬 Cómo probar la diferencia

### 1. En la consola del navegador:

```javascript
// Ver estadísticas del pool de sombras
console.log(
  "Sombras activas:",
  juego.sistemaDeIluminacion.sombrasActivas.length
);
console.log("Sombras en pool:", juego.sistemaDeIluminacion.poolSombras.length);

// Cambiar entre métodos en tiempo real
Juego.CONFIG.usar_sombras_con_texturas = false; // Método viejo
// Observar los FPS y la fluidez

Juego.CONFIG.usar_sombras_con_texturas = true; // Método nuevo
// ¡Deberías ver un aumento significativo en FPS!
```

### 2. Test de stress:

```javascript
// Crear muchas personas para probar
for (let i = 0; i < 200; i++) {
  juego.crearUnAmigo(Math.random() * 5000, Math.random() * 5000);
}

// Observar diferencia en FPS con ambos métodos
```

---

## 🎨 Cómo funciona la optimización

### Pre-generación de textura

1. Al inicio del juego, se crea **una sola textura** de sombra (trapecio con semicírculos difuminado)
2. La textura se crea con **efecto pixelado** (textura pequeña escalada sin antialiasing)
3. Esta textura se guarda en memoria y se reutiliza infinitamente

**Efecto Pixelado:**

- Se crea una textura reducida (ej: 24x34px en lugar de 240x340px con escala 0.1)
- Se usa `PIXI.SCALE_MODES.NEAREST` para desactivar el suavizado
- Al escalarla, se mantiene el aspecto "pixelado" retro
- **Beneficio adicional:** Textura más pequeña = menos memoria y más rápida

### Object Pooling

1. Se crean 100 sprites de sombra al inicio
2. Cada frame:
   - Se toman sprites del pool (O(1))
   - Se posicionan, rotan y escalan
   - Se devuelven al pool para el siguiente frame
3. **No se crea ni destruye nada** durante el gameplay → 0 garbage collection

### Transformaciones en GPU

1. Posición, rotación y escala son operaciones matriciales
2. La GPU las calcula súper rápido (millones por segundo)
3. Mucho más eficiente que calcular geometría en CPU

---

## 📈 Resultados esperados

### Con 100 personas y 10 faroles:

| Configuración     | FPS Esperado | Sombras/frame |
| ----------------- | ------------ | ------------- |
| Sin sombras       | 60 FPS       | 0             |
| Geometría (viejo) | 30-40 FPS    | ~300          |
| Texturas (nuevo)  | 55-60 FPS    | ~300          |

### Con 300 personas y 20 faroles:

| Configuración     | FPS Esperado | Sombras/frame |
| ----------------- | ------------ | ------------- |
| Sin sombras       | 50-55 FPS    | 0             |
| Geometría (viejo) | 15-25 FPS    | ~600          |
| Texturas (nuevo)  | 45-50 FPS    | ~600          |

---

## ⚙️ Ajustes finos

### Para hardware de gama baja:

```javascript
Juego.CONFIG.max_sombras_por_farol = 5; // Menos sombras
Juego.CONFIG.usar_sombras_proyectadas = false; // Desactivar completamente
Juego.CONFIG.frames_entre_updates_tint = 15; // Actualizar iluminación menos frecuentemente
Juego.CONFIG.escala_textura_sombras = 0.05; // Sombras muy pixeladas (mejor performance)
```

### Para hardware de gama alta:

```javascript
Juego.CONFIG.max_sombras_por_farol = 25; // Más sombras
Juego.CONFIG.frames_entre_updates_tint = 5; // Actualizaciones más frecuentes (más suave)
Juego.CONFIG.escala_textura_sombras = 0.2; // Menos pixelado (más calidad)
// Aumentar tamaño del pool si hay muchos faroles
// En sistemaDeIluminacion.js línea 165
const poolSize = 200; // Aumentar de 100 a 200
```

---

## 🐛 Troubleshooting

### Las sombras no aparecen:

```javascript
// Verificar que esté activado
console.log(Juego.CONFIG.usar_sombras_proyectadas); // debe ser true
console.log(Juego.CONFIG.usar_sombras_con_texturas); // debe ser true

// Verificar que el pool esté inicializado
console.log(juego.sistemaDeIluminacion.poolSombras.length); // debe ser > 0
```

### Performance no mejora:

- Asegúrate de recargar la página después de cambiar CONFIG
- El cuello de botella podría ser otra cosa (iluminación, física, etc)
- Usa las DevTools del navegador (Performance tab) para profiling

---

## 🎯 Próximas optimizaciones recomendadas

1. ✅ Sombras con texturas (IMPLEMENTADO)
2. 🔴 Limitar actualización de tint/iluminación (próxima prioridad)
3. 🔴 Actualizar barras de vida solo cuando cambian
4. 🟡 Reducir frecuencia de animaciones
5. 🟡 Física simplificada para entidades lejanas

---

¿Preguntas? Revisa el código en:

- `js/sistemaDeIluminacion.js` (líneas 72-474)
- `js/juego.js` (líneas 23-24)
