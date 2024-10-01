class DBSCAN {
  reset(points) {
    if (points) this.points = points;
    this.visited = new Set(); // To keep track of visited points
    this.clusters = []; // Array of clusters
    this.noise = []; // Array to keep track of noise points
  }
  constructor(points, epsilon, minPts) {
    this.points = points; // Array of points, each point is an array [x, y]
    this.epsilon = epsilon; // Maximum radius of the neighborhood
    this.minPts = minPts; // Minimum number of points required to form a cluster
    this.visited = new Set(); // To keep track of visited points
    this.clusters = []; // Array of clusters
    this.noise = []; // Array to keep track of noise points
  }

  changeEpsilon(epsilon) {
    this.epsilon = epsilon;
  }

  // Euclidean distance between two points
  distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    );
  }

  // Get neighbors of a point
  regionQuery(point) {
    let neighbors = [];
    for (let i = 0; i < this.points.length; i++) {
      if (this.distance(point, this.points[i]) <= this.epsilon) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  expandCluster(pointIdx, neighbors) {
    let cluster = [pointIdx];
    this.visited.add(pointIdx);

    let i = 0;
    while (i < neighbors.length) {
      let neighborIdx = neighbors[i];

      if (!this.visited.has(neighborIdx)) {
        this.visited.add(neighborIdx);
        let neighborNeighbors = this.regionQuery(this.points[neighborIdx]);

        if (neighborNeighbors.length >= this.minPts) {
          neighbors = neighbors.concat(neighborNeighbors);
        }
      }

      // Solo añade el punto al cluster si no está en otros clusters
      let inAnyCluster = this.clusters.some((cluster) =>
        cluster.includes(neighborIdx)
      );
      if (!inAnyCluster && !cluster.includes(neighborIdx)) {
        cluster.push(neighborIdx);
      }

      i++;
    }

    // Solo añadir el cluster si tiene puntos
    if (cluster.length > 0) {
      this.clusters.push(cluster);
    }
  }

  // Main function to run DBSCAN
  run(points) {
    this.reset(points);

    for (let i = 0; i < this.points.length; i++) {
      if (!this.visited.has(i)) {
        let neighbors = this.regionQuery(this.points[i]);

        if (neighbors.length < this.minPts) {
          this.noise.push(i); // Mark as noise if not enough neighbors
        } else {
          this.expandCluster(i, neighbors); // Otherwise expand the cluster
        }
      }
    }

    // Convert indices in clusters to actual points
    return {
      clusters: this.clusters.map((cluster) =>
        cluster.map((idx) => this.points[idx])
      ),
      noise: this.noise.map((idx) => this.points[idx]),
    };
  }
}

function unique(arr) {
  return Array.from(new Set(arr.map((obj) => JSON.stringify(obj)))).map((str) =>
    JSON.parse(str)
  );
}
// function getClusters() {

function algoritmoDeLau(puntos, centro, largoMaxDeLinea) {
  let puntosParaRetornar = [];

  let nuevosPuntos = convertirEnArrDeObj(puntos);
  let masLejano;
  let idx;
  let distanciaMayor = 0;

  for (let i = 0; i < nuevosPuntos.length; i++) {
    let dist = distance(nuevosPuntos[i], centro);

    if (dist > distanciaMayor) {
      masLejano = nuevosPuntos[i];
      idx = i;
      distanciaMayor = dist;
    }
  }

  puntosParaRetornar.push(masLejano);

  //YA SABEMOS CUAL ES EL PUNTO MAS LEJOS

  recorrerConAlgoritmoDeLau(
    nuevosPuntos,
    masLejano,
    puntosParaRetornar,
    centro,
    largoMaxDeLinea,
    masLejano
  );

  return puntosParaRetornar;
}

function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// K-nearest neighbors-based Concave Hull algorithm
function concaveHull(
  points,
  k = 3,
  center,
  maxDistance = 100,
  maxAngleChange = Math.PI / 4
) {
  if (points.length < 3) return points; // No hull if less than 3 points

  let hull = [];
  let start = findLeftmostPoint(points); // Start with the leftmost point
  let current = start;
  hull.push(current);

  let remainingPoints = points.filter((p) => p !== current);

  let previous = start; // Inicialmente el anterior es el mismo punto inicial
  while (remainingPoints.length > 0) {
    let neighbors = findKNearestNeighbors(current, remainingPoints, k);

    // Find the next point using the improved findBestNextPoint

    // let maxAngleChange = Math.PI / 4; // 45 grados de límite angular

    let nextPoint = findBestNextPoint(
      current,
      neighbors,
      previous,
      center,
      maxDistance,
      maxAngleChange
    );

    if (!nextPoint) return [];

    hull.push(nextPoint);

    remainingPoints = remainingPoints.filter((p) => p !== nextPoint);
    previous = current; // El punto actual se convierte en el anterior para la próxima iteración
    current = nextPoint;

    if (current === start) break;
  }

  return hull;
}

// Find the leftmost point (used as the starting point)
function findLeftmostPoint(points) {
  return points.reduce(
    (leftmost, point) => (point.x < leftmost.x ? point : leftmost),
    points[0]
  );
}

// Find the k nearest neighbors to the current point
function findKNearestNeighbors(current, points, k) {
  return points
    .map((p) => ({ point: p, dist: distance(current, p) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
    .map((item) => item.point);
}

// Choose the best next point by checking the left-hand turn (simplified)
// Choose the best next point by checking for the left-hand turn (concave behavior)
// Encuentra el siguiente mejor punto teniendo en cuenta varios criterios
function findBestNextPoint(
  current,
  neighbors,
  previous,
  center,
  maxDistance,
  maxAngleChange
) {
  let bestPoint = null;
  let bestScore = -Infinity; // Vamos a optimizar para el puntaje más alto

  neighbors.forEach((neighbor) => {
    if (previous == neighbor) return;
    let angleScore = 0;
    let distanceScore = 0;

    // 1. Calcula la distancia al centro (ahora queremos maximizar esta distancia)
    let distanceToCenter = distance(neighbor, center);

    // 2. Calcula el ángulo con respecto al punto anterior
    let angle = calculateAngle(previous, current, neighbor);

    // 3. Calcula la distancia entre el punto actual y el vecino (debe ser menor a maxDistance)
    let distanceToNeighbor = distance(current, neighbor);

    // Si la distancia excede el límite, descartamos este vecino
    // if (distanceToNeighbor > maxDistance) angleScore

    // 4. Calcula la diferencia entre el ángulo actual y el ángulo previo
    let previousAngle = calculateAngle(previous, current, {
      x: current.x + 1,
      y: current.y,
    }); // Referencia horizontal para ángulo previo
    let angleChange = Math.abs(angle - previousAngle);

    // Si el cambio de ángulo es demasiado grande, descartamos este vecino
    // if (angleChange > maxAngleChange) return;

    // 5. Calcula el ratio entre la distancia al centro y la distancia al vecino
    let distanceRatio = distanceToCenter / (distanceToNeighbor + 1e-5); // Pequeño valor para evitar división por cero

    // 6. Calcula un puntaje que combine el ratio de distancias y el ángulo
    let score = distanceRatio / (angleChange + distanceToNeighbor); // Favorece puntos más alejados del centro y con menos giro brusco

    // console.log(previous, current, score);

    // Queremos el punto con el mejor puntaje
    if (score > bestScore) {
      bestScore = score;
      bestPoint = neighbor;
    }
  });

  return bestPoint;
}

function drawPoint(x, y, graphics) {
  if (!graphics) return;
  graphics.lineStyle(3, 0x000000, 1); // Green lines
  graphics.drawCircle(x, y, 4);
}

// Calculate the angle between three points (previous -> current -> neighbor)
function calculateAngle(previous, current, neighbor) {
  if (!previous || !current || !neighbor) return 0;
  // Get the direction vectors
  let v1 = { x: current.x - previous.x, y: current.y - previous.y };
  let v2 = { x: neighbor.x - current.x, y: neighbor.y - current.y };

  // Calculate the angle using the cross product and dot product
  let crossProduct = v1.x * v2.y - v1.y * v2.x;
  let dotProduct = v1.x * v2.x + v1.y * v2.y;

  // Use atan2 to get the angle between the vectors
  return Math.atan2(crossProduct, dotProduct);
}

function recorrerConAlgoritmoDeLau(
  puntos,
  ultimoPunto,
  puntosParaRetornar,
  centro,
  largoMaxDeLinea,
  primerPunto
) {
  // console.log("recorrerConAlgoritmoDeLau", puntosParaRetornar)

  let ratioMayor = -999;
  let ratioDeAngulosMayor = -9999;
  let cual;

  // let penultimoPunto=puntosParaRetornar[]

  // let anguloAnterior=Math.atan2(ultimoPunto.y,ultimoPunto.x)

  for (let i = 0; i < puntos.length; i++) {
    let otro = puntos[i];
    if (otro == ultimoPunto) continue;

    let distAlCentro = distance(centro, otro);
    let distAlUltimoPunto = distance(ultimoPunto, otro);
    let distanciaAlAnterior = distance(otro, ultimoPunto);

    let ratio = distAlCentro / distAlUltimoPunto;

    // let anguloParaEstePunto=Math.atan2(otro.y,otro.x)
    let angulo = calcularAnguloEntreLineas(centro, ultimoPunto, otro);
    // console.log(centro, ultimoPunto, otro,"=>",angulo)

    if (ratio > ratioMayor && distanciaAlAnterior < largoMaxDeLinea) {
      if (!puntosParaRetornar.includes(otro)) {
        cual = otro;
        ratioMayor = ratio;
      }
    }
  }

  ////////////////////

  if (cual == primerPunto) {
    console.log("TAMO CERRANDO LA FORMA", puntosParaRetornar.length);
    puntosParaRetornar.push(cual);
    return puntosParaRetornar;
  }

  //vemos q el punto seleccionado no haya sido agregado ya
  if (cual) {
    puntosParaRetornar.push(cual);
    recorrerConAlgoritmoDeLau(
      puntos,
      cual,
      puntosParaRetornar,
      centro,
      largoMaxDeLinea,
      primerPunto
    );
  } else {
    return puntosParaRetornar;
  }
}
// function seCruzan(p1, p2, p3, p4) {
//     // Función auxiliar para verificar si el punto está en el segmento
//     function onSegment(p, q, r) {
//         return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
//             q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
//     }

//     // Función para calcular la orientación de tres puntos
//     function orientacion(p, q, r) {
//         let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
//         if (val === 0) return 0;  // Colineal
//         return (val > 0) ? 1 : 2; // 1 = Horario, 2 = Antihorario
//     }

//     // Obtener las orientaciones
//     let o1 = orientacion(p1, p2, p3);
//     let o2 = orientacion(p1, p2, p4);
//     let o3 = orientacion(p3, p4, p1);
//     let o4 = orientacion(p3, p4, p2);

//     // Caso general
//     if (o1 !== o2 && o3 !== o4) return true;

//     // Casos especiales: los puntos son colineales y están en el segmento
//     if (o1 === 0 && onSegment(p1, p3, p2)) return true;
//     if (o2 === 0 && onSegment(p1, p4, p2)) return true;
//     if (o3 === 0 && onSegment(p3, p1, p4)) return true;
//     if (o4 === 0 && onSegment(p3, p2, p4)) return true;

//     return false;
// }

function calcularAnguloEntreLineas(P1, P2, P3) {
  //P1 ES DONDE ESTAMOS PARADOS
  //P2 YA LO TENEMOS
  //ESTAMOS BUSCANDO P3

  // Calculamos los vectores de las líneas
  let v1 = { x: P2.x - P1.x, y: P2.y - P1.y }; // Vector P1 -> P2
  let v2 = { x: P3.x - P1.x, y: P3.y - P1.y }; // Vector P1 -> P3

  // Producto punto entre v1 y v2
  let productoPunto = v1.x * v2.x + v1.y * v2.y;

  // Magnitudes de los vectores
  let magnitudV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  let magnitudV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

  // Cálculo del coseno del ángulo
  let cosTheta = productoPunto / (magnitudV1 * magnitudV2);

  // Obtenemos el ángulo en radianes y luego lo convertimos a grados
  let anguloRadianes = Math.acos(cosTheta);
  let anguloGrados = anguloRadianes * (180 / Math.PI);

  return anguloGrados;
}

function convertirAlphaShapeEnAlgoLegible(hull, points, w, h) {
  let ret = [];

  for (var numP = 0; numP < hull.length; ++numP) {
    var cell = hull[numP];
    // console.log("cell",cell)
    for (var j = 0; j < cell.length; ++j) {
      var p = points[cell[j]];
      // console.log(p)
      var q = points[cell[(j + 1) % cell.length]];
      // ctx.beginPath()
      // ctx.moveTo(p[0], p[1])
      // ctx.lineTo(q[0], q[1])
      ret.push({ x: q[0], y: q[1] });

      //   ctx.stroke();
    }
  }
  return ret;
}

function sacarItems(arr, num) {
  return arr.filter((k, i) => {
    return i % num == 0;
  });
}

function convertirEnArrDeObj(arr) {
  return arr.map((k) => {
    return { x: k[0], y: k[1] };
  });
}

function convertirArrayDeObjXYEnArrDeArr(arr) {
  return arr.map((k) => [k.position.x, k.position.y]);
}
function convertirArrayDeObjXYEnArrDeArrSinPos(arr) {
  return arr.map((k) => [k.x, k.y]);
}

function ordenarPuntos(puntos, centro) {
  // 2. Crear un array para almacenar los puntos más lejanos, y calcular ángulos
  const puntosConAngulo = [];

  // 3. Recorrer todos los puntos
  for (const punto of puntos) {
    // Calcular el ángulo polar del punto respecto al centro
    let deltaX = punto.x - centro.x;
    let deltaY = punto.y - centro.y;
    let angulo = Math.atan2(deltaY, deltaX); // Ángulo en radianes

    // Convertir a grados para hacer el ordenado más intuitivo (opcional)
    angulo = angulo * (180 / Math.PI);
    if (angulo < 0) {
      angulo += 360; // Asegurar que el ángulo esté entre 0 y 360
    }

    // 4. Guardar el punto con su ángulo polar
    puntosConAngulo.push({
      punto: punto,
      angulo: angulo,
      distancia: Math.sqrt(deltaX ** 2 + deltaY ** 2), // Guardamos la distancia por si necesitamos orden adicional
    });
  }

  // 5. Ordenar los puntos por el ángulo polar
  puntosConAngulo.sort((a, b) => a.angulo - b.angulo);

  // 6. Retornar solo los puntos, ahora ordenados circularmente
  return puntosConAngulo.map((item) => item.punto);
}

function chaikin(arr, num) {
  // if ((arr[0][0] === NaN)) debugger

  //   console.log(arr, num);
  if (num === 0) return arr;
  const l = arr.length;
  const smooth = arr
    .map((c, i) => {
      return [
        {
          x: 0.75 * c.x + 0.25 * arr[(i + 1) % l].x,
          y: 0.75 * c.y + 0.25 * arr[(i + 1) % l].y,
        },
        {
          x: 0.25 * c.x + 0.75 * arr[(i + 1) % l].x,
          y: 0.25 * c.y + 0.75 * arr[(i + 1) % l].y,
        },
      ];
    })
    .flat();
  return num === 1 ? smooth : chaikin(smooth, num - 1);
}

function calcularCentro(clus) {
  let centro = { x: 0, y: 0 };
  for (let punto of clus) {
    centro.x += punto[0];
    centro.y += punto[1];
  }
  centro.x /= clus.length;
  centro.y /= clus.length;

  //    ctx.fillStyle = '#ff00ff';
  // ctx.beginPath()
  // // ctx.moveTo(centro.x, centro.y)
  // let largoCuadradoDebug = 6
  // ctx.rect(centro.x - largoCuadradoDebug / 2, centro.y - largoCuadradoDebug / 2, largoCuadradoDebug, largoCuadradoDebug)
  // // ctx.lineWidth = 3;
  // // ctx.strokeStyle = '#000000';
  // ctx.fillStyle = '#000000';
  // // ctx.beginPath();
  // // ctx.arc(centro.x, centro.y, 4, 0, Math.PI * 2);
  // ctx.fill();

  return centro;
}

// Verifica si dos líneas (p1 -> p2 y q1 -> q2) se intersectan
function doLinesIntersect(p1, p2, q1, q2) {
  function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // colineal
    return val > 0 ? 1 : 2; // 1: horario, 2: antihorario
  }

  let o1 = orientation(p1, p2, q1);
  let o2 = orientation(p1, p2, q2);
  let o3 = orientation(q1, q2, p1);
  let o4 = orientation(q1, q2, p2);

  // Caso general: las líneas se cruzan si tienen orientaciones diferentes
  if (o1 !== o2 && o3 !== o4) return true;

  return false; // No se cruzan
}

//////////////
function findConcaveHull(points, distanceThreshold, minDistanceToCenter) {
  const connections = findValidConnections(
    points,
    distanceThreshold,
    minDistanceToCenter
  );

  const filteredConnections = filterInvalidConnections(connections);
  const optimizedConnections = optimizeConnections(filteredConnections);

  const hullPoints = buildHull(optimizedConnections);

  return hullPoints;
}

function findValidConnections(points, minDistanceToCenter) {
  const connections = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = calculateDistance(points[i], points[j]);
      const distanceToCenterI = calculateDistance(points[i], getCenter(points));
      const distanceToCenterJ = calculateDistance(points[j], getCenter(points));

      if (
        distanceToCenterI > minDistanceToCenter &&
        distanceToCenterJ > minDistanceToCenter
      ) {
        const ratio = (distanceToCenterI + distanceToCenterJ) / distance; // Sumar distancias al centro
        connections.push({ points: [points[i], points[j]], distance, ratio });
      }
    }
  }

  // Ordenar las conexiones según el ratio en orden descendente
  connections.sort((a, b) => b.ratio - a.ratio);

  return connections;
}
function filterInvalidConnections(connections) {
  const validConnections = [];
  for (let i = 0; i < connections.length; i++) {
    let isValid = true;
    for (let j = 0; j < validConnections.length; j++) {
      if (linesIntersect(connections[i].points, validConnections[j].points)) {
        isValid = false;
        break;
      }
    }
    if (isValid) {
      validConnections.push(connections[i]);
    }
  }
  return validConnections;
}

function optimizeConnections(connections) {
  // Implementar lógica para optimizar las conexiones (ej. algoritmo de Prim/Kruskal adaptado)
  return connections; // Placeholder for the actual optimization logic
}

function buildHull(connections) {
  // Lógica para construir el hull utilizando las conexiones optimizadas
  return connections.map((conn) => conn.points).flat(); // Placeholder for hull points
}

function getCenter(points) {
  const xSum = points.reduce((sum, point) => sum + point[0], 0);
  const ySum = points.reduce((sum, point) => sum + point[1], 0);
  return [xSum / points.length, ySum / points.length];
}

function linesIntersect(line1, line2) {
  // Implementar lógica para verificar si las líneas se cruzan
  return false; // Placeholder
}

///////////

function calcularPuntoMasLejanoEn360ConCirculos(
  puntos,
  radio,
  centro,
  cantDePorcionesDePizza
) {
  // 2. Crear un array para almacenar los puntos más lejanos por cada ángulo
  const puntosMasLejanos = [];

  // 3. Recorrer 360 grados
  let step = 360 / cantDePorcionesDePizza;
  for (let angulo = 0; angulo < 360; angulo += step) {
    let radianes = angulo * (Math.PI / 180); // Convertir el ángulo a radianes

    let cos = Math.cos(radianes);
    let sin = Math.sin(radianes);

    let puntoMasLejano = null;
    let mayorDistancia = -Infinity;

    // 4. Buscar intersecciones con círculos
    for (const punto of puntos) {
      // Distancia del centro al centro del círculo
      let vectorX = punto.x - centro.x;
      let vectorY = punto.y - centro.y;

      // Proyectar el punto en la dirección del ángulo
      let distanciaCentro = vectorX * cos + vectorY * sin;

      // Calcular la distancia perpendicular desde el centro a la línea proyectada
      let perpendicular = Math.abs(vectorY * cos - vectorX * sin);

      // Si la distancia perpendicular es menor o igual al radio, hay intersección
      if (perpendicular <= radio) {
        // Calcular la distancia desde el centro a la intersección más lejana
        let interseccionDistancia =
          Math.sqrt(distanciaCentro ** 2 - perpendicular ** 2) + radio;

        // Si la distancia de intersección es mayor que la anterior, actualizamos
        if (interseccionDistancia > mayorDistancia) {
          mayorDistancia = interseccionDistancia;
          puntoMasLejano = punto;
        }
      }
    }

    // 5. Guardar el punto más lejano en ese ángulo si hay una intersección
    if (puntoMasLejano) {
      // Guardamos el punto junto con su ángulo
      puntosMasLejanos.push({
        punto: puntoMasLejano,
        angulo: angulo, // Guardamos el ángulo correspondiente
      });
    }
  }

  // 6. Ordenar los puntos según el ángulo
  // puntosMasLejanos.sort((a, b) => a.angulo - b.angulo);

  // 7. Retornar solo los puntos ordenados en forma circular
  return ordenarPuntos(
    puntosMasLejanos.map((item) => item.punto),
    centro
  );
}

function optimizarHull(points) {
  if (!points || !Array.isArray(points) || !points[0]) return points;

  let arr = unique(
    points.map((k) => {
      return { x: Math.floor(k.x), y: Math.floor(k.y) };
    })
  );
  //   console.log("#habia", points.length, "pasaron a ser", arr.length)
  //     for (let i = 0; i < arr.length; i++) {
  //       if (i < arr.length - 2) {
  //         if (arr[i] && arr[i + 1] && arr[i + 2]) {
  //           if (distance(arr[i], arr[i + 2]) < distance(arr[i], arr[i + 1])) {
  //             arr[i + 1] = undefined;
  //           }
  //         }
  //       }
  //     }

  //     let filtrado=arr.filter((k) => k)
  //     console.log("#quedaron", arr.length)
  //     return filtrado;

  return arr;
}

////////////

// Calcular distancia euclidiana entre dos puntos
function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
}

// Algoritmo de Gift Wrapping (Jarvis March) para encontrar el convex hull
function giftWrapping(points) {
  let ret = [];
  let leftMost = points.reduce(
    (left, point) => (point[0] < left[0] ? point : left),
    points[0]
  );

  let currentPoint = leftMost;
  let nextPoint;

  do {
    ret.push(currentPoint);
    nextPoint = points[0];

    for (let i = 1; i < points.length; i++) {
      if (
        nextPoint === currentPoint ||
        isLeftTurn(currentPoint, nextPoint, points[i])
      ) {
        nextPoint = points[i];
      }
    }

    currentPoint = nextPoint;
  } while (currentPoint !== leftMost);
  if (ret[0][0] == NaN) debugger;
  return ret;
}

// Función que determina si tres puntos hacen un giro hacia la izquierda
function isLeftTurn(p1, p2, p3) {
  return (
    (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[1]) > 0
  );
}

// Encontrar puntos concavos cercanos para acortar segmentos largos
function findConcavePoints(points, hull, maxSegmentLength) {
  let newHull = [...hull];

  for (let i = 0; i < hull.length; i++) {
    let pointA = hull[i];
    let pointB = hull[(i + 1) % hull.length];
    let segmentLength = calculateDistance(pointA, pointB);

    // Si el segmento es demasiado largo, buscamos puntos concavos
    if (segmentLength > maxSegmentLength) {
        // console.log("Segment too long", pointA, pointB);
      let posCentralX = (pointA[0] - pointB[0]) / 2;
      let posCentralY = (pointA[1] - pointB[1]) / 2;

      let candidates = points.filter(
        (p) => !hull.includes(p) && isCloseToSegment(p, pointA, pointB)
      );

      // Si encontramos puntos concavos, los insertamos en el hull
      if (candidates.length > 0) {
        let bestPoint = candidates.reduce((best, p) => {
          let d = calculateDistance(p, [posCentralX, posCentralY]);
          return d < calculateDistance(best, [posCentralX, posCentralY])
            ? p
            : best;
        }, candidates[0]);

        newHull.splice(i + 1, 0, bestPoint); // Insertar el punto concavo en el hull
      }
    }
  }

  return newHull;
}

// Verificar si un punto está cerca de un segmento
function isCloseToSegment(point, pointA, pointB) {
  const distanceToSegment = calculateDistanceToSegment(point, pointA, pointB);
  return distanceToSegment < 20; // Threshold de distancia para ser considerado "cerca"
}

// Calcular la distancia desde un punto a un segmento
function calculateDistanceToSegment(point, pointA, pointB) {
  const A = point[0] - pointA[0];
  const B = point[1] - pointA[1];
  const C = pointB[0] - pointA[0];
  const D = pointB[1] - pointA[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = dot / lenSq;

  let xx, yy;

  if (param < 0 || (pointA[0] === pointB[0] && pointA[1] === pointB[1])) {
    xx = pointA[0];
    yy = pointA[1];
  } else if (param > 1) {
    xx = pointB[0];
    yy = pointB[1];
  } else {
    xx = pointA[0] + param * C;
    yy = pointA[1] + param * D;
  }

  const dx = point[0] - xx;
  const dy = point[1] - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

// Función principal que genera el concave hull
function concaveHullPArtiendoDEsdeConvex(points, maxSegmentLength) {
  let convexHull = giftWrapping(points);

  let concaveHull = findConcavePoints(points, convexHull, maxSegmentLength);

  return concaveHull;
}
