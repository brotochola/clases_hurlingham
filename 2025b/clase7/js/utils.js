function radianesAGrados(radianes) {
  return radianes * (180 / Math.PI);
}

function calcularDistancia(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function limitarVector(vector, magnitudMaxima = 1) {
  const magnitudActual = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (magnitudActual > magnitudMaxima) {
    const escala = magnitudMaxima / magnitudActual;
    return {
      x: vector.x * escala,
      y: vector.y * escala,
    };
  }

  // Si ya está dentro del límite, se devuelve igual
  return { ...vector };
}

// Cache para texturas negras para evitar recrearlas
const texturaNegrCache = new Map();

function crearSpriteNegro(anchoDelMapa, altoDelMapa) {
  // Verificar si ya tenemos esta textura en cache
  const cacheKey = `negro_${anchoDelMapa}x${altoDelMapa}`;
  let textura = texturaNegrCache.get(cacheKey);

  if (!textura) {
    // Crear un canvas negro del tamaño del mapa solo si no existe en cache
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = anchoDelMapa;
    canvas.height = altoDelMapa;

    // Llenar todo el canvas de negro
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Crear textura PIXI a partir del canvas y guardarla en cache
    textura = PIXI.Texture.from(canvas);
    texturaNegrCache.set(cacheKey, textura);
  }

  // Crear sprite usando la textura (reutilizada o nueva)
  const sprite = new PIXI.Sprite(textura);

  // Posicionar el sprite en el origen del mapa
  sprite.x = 0;
  sprite.y = 0;

  return sprite;
}

// Cache para texturas de gradientes para evitar recrearlas
const texturaGradienteCache = new Map();

function crearSpriteConGradiente(radio = 300, color = 0xffffff) {
  // Verificar si ya tenemos esta textura en cache
  const cacheKey = `gradiente_${radio}_${color}`;
  let textura = texturaGradienteCache.get(cacheKey);

  if (!textura) {
    // Crear un canvas para el gradiente individual solo si no existe en cache
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = radio * 2;
    canvas.width = size;
    canvas.height = size;

    // Crear gradiente radial centrado
    const gradient = ctx.createRadialGradient(
      radio,
      radio,
      0, // círculo interior (centro)
      radio,
      radio,
      radio // círculo exterior
    );

    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;

    const cantStops = 10;
    for (let i = 1; i <= cantStops; i++) {
      const value = 2 ** (1 - i);
      gradient.addColorStop(
        i / cantStops,
        "rgba(" + r + "," + g + "," + b + "," + value + ")"
      ); // Centro blanco (sin oscuridad)
    }
    // Configurar paradas del gradiente

    // Llenar todo el canvas de negro primero
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, size, size);

    // Dibujar el círculo con gradiente
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radio, radio, radio, 0, Math.PI * 2);
    ctx.fill();

    // Crear textura PIXI a partir del canvas y guardarla en cache
    textura = PIXI.Texture.from(canvas);
    texturaGradienteCache.set(cacheKey, textura);
  }

  // Crear sprite usando la textura (reutilizada o nueva)
  const sprite = new PIXI.Sprite(textura);

  // Centrar el anchor para que el gradiente se centre en la posición del farol
  sprite.anchor.set(0.5, 0.5);
  sprite.scale.y = 0.5;

  return sprite;
}

// Cache para texturas de círculos para evitar recrearlas
const texturaCirculoCache = new Map();

function crearCirculo(radio, color) {
  // Verificar si ya tenemos esta textura en cache
  const cacheKey = `circulo_${radio}_${color}`;
  let textura = texturaCirculoCache.get(cacheKey);

  if (!textura) {
    // Crear un canvas para el círculo solo si no existe en cache
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = radio * 2;
    canvas.width = size;
    canvas.height = size;

    // Llenar el canvas de transparente
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, size, size);

    // Dibujar el círculo con el color especificado
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(radio, radio, radio, 0, Math.PI * 2);
    ctx.fill();

    // Crear textura PIXI a partir del canvas y guardarla en cache
    textura = PIXI.Texture.from(canvas);
    texturaCirculoCache.set(cacheKey, textura);
  }

  return textura;
}

function isometricToCartesian(pos) {
  return {
    x: pos.x / 2 + pos.y,
    y: pos.y - pos.x / 2,
  };
}

function convertirCantidadDeMinutosDelDiaAStringDeHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = Math.floor(minutos % 60);
  return `${horas.toString().padStart(2, "0")}:${minutosRestantes
    .toString()
    .padStart(2, "0")}`;
}

function mapColors(color2, color1, mix) {
  const r1 = (color1 >> 16) & 255;
  const g1 = (color1 >> 8) & 255;
  const b1 = color1 & 255;
  const r2 = (color2 >> 16) & 255;
  const g2 = (color2 >> 8) & 255;
  const b2 = color2 & 255;
  const r = Math.round(r1 * mix + r2 * (1 - mix));
  const g = Math.round(g1 * mix + g2 * (1 - mix));
  const b = Math.round(b1 * mix + b2 * (1 - mix));
  return (r << 16) | (g << 8) | b;
}

function colorToHexString(color) {
  // Convierte un número hexadecimal (ej: 0xff0000) a string hexadecimal (ej: "#ff0000")
  return "#" + color.toString(16).padStart(6, "0");
}

function generateName() {
  const englishFirstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Christopher",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Emma",
    "Olivia",
    "Ava",
    "Isabella",
    "Sophia",
    "Mia",
    "Charlotte",
    "Amelia",
    "Harper",
    "Evelyn",
    "Alexander",
    "Benjamin",
    "Lucas",
    "Henry",
    "Mason",
    "Ethan",
    "Noah",
    "Logan",
    "Sebastian",
    "Jack",
  ];

  const spanishFirstNames = [
    "José",
    "Antonio",
    "Manuel",
    "Francisco",
    "David",
    "Juan",
    "Javier",
    "Daniel",
    "Carlos",
    "Miguel",
    "María",
    "Carmen",
    "Josefa",
    "Isabel",
    "Ana",
    "Dolores",
    "Pilar",
    "Teresa",
    "Rosa",
    "Francisca",
    "Alejandro",
    "Diego",
    "Pablo",
    "Álvaro",
    "Adrián",
    "Gonzalo",
    "Fernando",
    "Eduardo",
    "Sergio",
    "Raúl",
    "Sofía",
    "Martina",
    "Lucía",
    "Valeria",
    "Paula",
    "Emma",
    "Daniela",
    "Carla",
    "Sara",
    "Jimena",
  ];

  const englishSurnames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Wilson",
    "Anderson",
    "Taylor",
    "Thomas",
    "Hernandez",
    "Moore",
    "Martin",
    "Jackson",
    "Thompson",
    "White",
    "Lopez",
    "Lee",
    "Gonzalez",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
    "Perez",
    "Hall",
    "Young",
    "Allen",
    "Sanchez",
    "Wright",
    "King",
    "Scott",
    "Green",
    "Baker",
    "Adams",
    "Nelson",
  ];

  const spanishSurnames = [
    "García",
    "González",
    "Rodríguez",
    "Fernández",
    "López",
    "Martínez",
    "Sánchez",
    "Pérez",
    "Gómez",
    "Martín",
    "Jiménez",
    "Ruiz",
    "Hernández",
    "Díaz",
    "Moreno",
    "Muñoz",
    "Álvarez",
    "Romero",
    "Alonso",
    "Gutiérrez",
    "Navarro",
    "Torres",
    "Domínguez",
    "Vázquez",
    "Ramos",
    "Gil",
    "Ramírez",
    "Serrano",
    "Blanco",
    "Suárez",
    "Molina",
    "Morales",
    "Ortega",
    "Delgado",
    "Castro",
    "Ortiz",
    "Rubio",
    "Marín",
    "Sanz",
    "Iglesias",
  ];

  const italianSurnames = [
    "Rossi",
    "Ferrari",
    "Russo",
    "Bianchi",
    "Romano",
    "Gallo",
    "Costa",
    "Fontana",
    "Conti",
    "Esposito",
    "Ricci",
    "Bruno",
    "Rizzo",
    "Moretti",
    "Marino",
    "Greco",
    "Ferrara",
    "Caruso",
    "Galli",
    "Ferrara",
    "Leone",
    "Longo",
    "Mancini",
    "Mazza",
    "Rinaldi",
    "Testa",
    "Grasso",
    "Pellegrini",
    "Ferraro",
    "Galli",
    "Bellini",
    "Basile",
    "Rizzo",
    "Vitale",
    "Parisi",
    "Ferrara",
    "Serra",
    "Valentini",
    "D'Angelo",
    "Marchetti",
  ];

  const portugueseSurnames = [
    "Silva",
    "Santos",
    "Oliveira",
    "Sousa",
    "Rodrigues",
    "Ferreira",
    "Alves",
    "Pereira",
    "Costa",
    "Martins",
    "Carvalho",
    "Fernandes",
    "Lopes",
    "Gomes",
    "Mendes",
    "Nunes",
    "Ribeiro",
    "Antunes",
    "Correia",
    "Dias",
    "Teixeira",
    "Monteiro",
    "Moreira",
    "Cardoso",
    "Soares",
    "Melo",
    "Pinto",
    "Fonseca",
    "Machado",
    "Araújo",
    "Barbosa",
    "Tavares",
    "Coelho",
    "Cruz",
    "Cunha",
    "Freitas",
    "Lima",
    "Mota",
    "Neves",
    "Rocha",
  ];

  // Randomly select from all available names and surnames
  const allFirstNames = [...englishFirstNames, ...spanishFirstNames];
  const allSurnames = [
    ...englishSurnames,
    ...spanishSurnames,
    ...italianSurnames,
    ...portugueseSurnames,
  ];

  const firstName =
    allFirstNames[Math.floor(Math.random() * allFirstNames.length)];
  const surname = allSurnames[Math.floor(Math.random() * allSurnames.length)];

  return `${firstName} ${surname}`;
}
