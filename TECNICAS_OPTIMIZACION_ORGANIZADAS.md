# Técnicas de Optimización para Juegos/Simulaciones

## 1. Performance Profiling

**Descripción:** Mostrar el profiler de performance para identificar cuellos de botella
**Documentación:** [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

```javascript
// Ejemplo básico de profiling
console.time("operacion-costosa");
// ... código a medir ...
console.timeEnd("operacion-costosa");
```

## 2. Precomputation

**Descripción:** Calcular una sola vez al principio datos que no cambian (como celdas vecinas)
**Documentación:** [Precomputation Techniques](https://en.wikipedia.org/wiki/Precomputation)

```javascript
// Precalcular celdas vecinas
const neighbors = {};
for (let x = 0; x < gridWidth; x++) {
  for (let y = 0; y < gridHeight; y++) {
    neighbors[`${x},${y}`] = getNeighborCells(x, y);
  }
}
```

## 3. Data Structure Optimization

**Descripción:** Usar arrays en lugar de Object.values para mejor performance
**Documentación:** [JavaScript Performance Tips](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values#performance_considerations)

```javascript
// ❌ Lento
const entities = {};
Object.values(entities).forEach((entity) => update(entity));

// ✅ Rápido
const entities = [];
entities.forEach((entity) => update(entity));
```

## 4. Frame Rate Throttling (Decimation)

**Descripción:** Dividir boids en subgrupos y actualizar diferentes cálculos cada X frames
**Documentación:** [Game Loop Patterns](https://gameprogrammingpatterns.com/game-loop.html)

```javascript
let frame = 0;
function update() {
  frame++;
  if (frame % 10 === 0) calculateNeighbors();
  if (frame % 5 === 0) calculateBoids();
  render();
}
```

## 5. Distance Caching (Memoization)

**Descripción:** Cachear distancias calculadas (si tenemos dist de A a B, no calcular B a A)
**Documentación:** [Memoization](https://en.wikipedia.org/wiki/Memoization)

```javascript
const distanceCache = new Map();
function getDistance(a, b) {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  if (!distanceCache.has(key)) {
    distanceCache.set(key, calculateDistance(a, b));
  }
  return distanceCache.get(key);
}
```

## 6. Spatial Partitioning Optimization

**Descripción:** Probar diferentes tamaños de celdas para optimizar búsquedas espaciales
**Documentación:** [Spatial Partitioning](https://en.wikipedia.org/wiki/Space_partitioning)

## 7. Squared Distance Comparison

**Descripción:** Comparar distancias cuadradas en lugar de distancias reales (evita sqrt)
**Documentación:** [Fast Distance Calculations](https://stackoverflow.com/questions/11805895/why-is-squared-euclidean-distance-preferred-in-ml)

```javascript
// ❌ Lento
if(distance(a, b) < threshold) { ... }

// ✅ Rápido
if(squaredDistance(a, b) < threshold * threshold) { ... }
```

## 8. Frustum Culling

**Descripción:** No renderizar objetos que no se ven en pantalla
**Documentación:** [Frustum Culling](https://en.wikipedia.org/wiki/Hidden-surface_determination#Viewing_frustum_culling)

```javascript
function render(entities, camera) {
  entities.forEach((entity) => {
    if (isInView(entity, camera)) {
      drawEntity(entity);
    }
  });
}
```

## 9. Level of Detail (LOD)

**Descripción:** Menos cálculos para objetos distantes o poco visibles
**Documentación:** [Level of Detail](<https://en.wikipedia.org/wiki/Level_of_detail_(computer_graphics)>)

```javascript
function updateEntity(entity, camera) {
  const distance = getDistance(entity, camera);
  if (distance > 100) return; // Skip distant entities
  if (distance > 50) updateSimple(entity);
  else updateDetailed(entity);
}
```

## 10. Look-up Tables (LUT)

**Descripción:** Tabla de datos precalculada para evitar cálculos repetitivos
**Documentación:** [Lookup Table](https://en.wikipedia.org/wiki/Lookup_table)

```javascript
// Precalcular senos y cosenos
const sinTable = [];
for (let i = 0; i < 360; i++) {
  sinTable[i] = Math.sin((i * Math.PI) / 180);
}
```

## 11. Approximation Algorithms

**Descripción:** Aproximar cálculos complejos con versiones más simples pero menos precisas
**Documentación:** [Approximation Algorithms](https://en.wikipedia.org/wiki/Approximation_algorithm)

## 12. Neighbor Limiting

**Descripción:** Calcular cohesión, separación y alineación con cantidad máxima de boids
**Documentación:** [Boids Algorithm Optimization](https://www.red3d.com/cwr/boids/)

```javascript
function calculateBoids(boid, neighbors) {
  const maxNeighbors = 10;
  const closeNeighbors = neighbors.slice(0, maxNeighbors);
  return {
    cohesion: getCohesion(closeNeighbors),
    separation: getSeparation(closeNeighbors),
  };
}
```

## 13. Frame Coherence

**Descripción:** Reutilizar cálculos del frame anterior si no hubo cambios significativos
**Documentación:** [Temporal Coherence](<https://en.wikipedia.org/wiki/Coherence_(computer_science)>)

```javascript
let lastResult = null;
function expensiveCalculation(data, lastData) {
  if (dataUnchanged(data, lastData)) {
    return lastResult;
  }
  lastResult = performCalculation(data);
  return lastResult;
}
```

## 14. Object Pooling

**Descripción:** Reutilizar objetos en lugar de crear/destruir constantemente
**Documentación:** [Object Pool Pattern](https://en.wikipedia.org/wiki/Object_pool_pattern)

```javascript
// Pool de partículas para evitar crear/destruir objetos
const particlePool = [];
for (let i = 0; i < 100; i++) {
  particlePool.push(new Particle());
}

function createParticle(x, y) {
  let particle = particlePool.pop();
  if (!particle) particle = { x: 0, y: 0, active: false };
  particle.x = x;
  particle.y = y;
  particle.active = true;
  return particle;
}

function removeParticle(particle) {
  particle.active = false;
  particlePool.push(particle); // Reutilizar
}
```
