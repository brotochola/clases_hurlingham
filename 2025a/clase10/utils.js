// Name generation function
export function generateName() {
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

function calcularDistanciaAlCuadrado(x1, y1, x2, y2) {
  return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}

function calcularDistancia(x1, y1, x2, y2) {
  return Math.sqrt(calcularDistanciaAlCuadrado(x1, y1, x2, y2));
}

function compararDistancias(objOrigen, ObjDestino1, ObjDestino2) {
  const distancia1 = calcularDistanciaAlCuadrado(
    objOrigen.x,
    objOrigen.y,
    ObjDestino1.x,
    ObjDestino1.y
  );
  const distancia2 = calcularDistanciaAlCuadrado(
    objOrigen.x,
    objOrigen.y,
    ObjDestino2.x,
    ObjDestino2.y
  );

  if (distancia1 < distancia2) {
    return ObjDestino1;
  } else {
    return ObjDestino2;
  }
}
