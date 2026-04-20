function generateName(
  gender = "any",
  doubleFirstNameChance = 0.1,
  doubleSurnameChance = 0.2
) {

  // =========================
  // 🇦🇷 ARGENTINA
  // =========================

  const arMaleNames = [
    "Juan","Mateo","Santiago","Benjamín","Matías","Nicolás","Lucas","Thiago","Joaquín","Tomás",
    "Agustín","Facundo","Franco","Ignacio","Bruno","Lautaro","Ramiro","Emiliano","Federico","Gonzalo",
    "Maximiliano","Ezequiel","Nahuel","Axel","Lisandro","Iván","Damián","Leandro","Alan","Kevin"
  ];

  const arFemaleNames = [
    "Sofía","Valentina","Martina","Lucía","Catalina","Camila","Julieta","Emma","Renata","Mora",
    "Malena","Abril","Bianca","Victoria","Delfina","Paula","Lola","Zoe","Alma","Clara",
    "Milagros","Antonella","Ariana","Candela","Brisa","Sol","Florencia","Agustina","Rocío","Noelia"
  ];

  const arSurnames = [
    "González","Rodríguez","Gómez","Fernández","López","Díaz","Martínez","Pérez","García","Romero",
    "Sosa","Torres","Álvarez","Ruiz","Suárez","Juárez","Rojas","Herrera","Medina","Castro",
    "Ferrari","Rossi","Romano","Bianchi","Bruno","Gallo","Benítez","Acosta","Godoy","Molina",
    "Peralta","Correa","Vera","Leiva","Quiroga","Ponce","Figueroa","Maidana","Cáceres","Villalba"
  ];

  // =========================
  // 🇺🇾 URUGUAY
  // =========================

  const uyMaleNames = [
    "Washington","Wilson","Tabaré","Yamandú","Aparicio","Heber","Aníbal","Ruben","Néstor","Rodolfo"
  ];

  const uyFemaleNames = [
    "Graciela","Mirtha","Beatriz","Nidia","Lilian","Susana","Norma","Elbia"
  ];

  const uySurnames = [
    "Viera","Techera","Bentancur","Silveira","Pereyra","Da Silva","De León","Moreira","Cabrera","Olivera"
  ];

  // =========================
  // 🇨🇴 COLOMBIA
  // =========================

  const coMaleNames = [
    "Jhon","Jhonatan","Andrés","Felipe","Sebastián","Camilo","Juan Esteban","Luis Fernando",
    "Óscar","Harold","Wilmar","Yeison","Stiven","Brayan","Duván"
  ];

  const coFemaleNames = [
    "Yuliana","Leidy","Diana","Paola","Angélica","Lina","Tatiana","Katherine","Yessenia",
    "Maribel","Johanna","Viviana","Yamile"
  ];

  const coSurnames = [
    "Quintero","Castaño","Arboleda","Zuluaga","Henao","Ospina","Giraldo","Valencia","Cardona",
    "Bermúdez","Montoya","Restrepo","Salazar","Uribe","Duque"
  ];

  // =========================
  // 🇻🇪 VENEZUELA
  // =========================

  const veMaleNames = [
    "José Luis","Luis Miguel","Carlos Andrés","Juan Carlos","Víctor","Freddy","Eduardo",
    "Jesús","Franklin","Edgar","Rafael","Alfredo"
  ];

  const veFemaleNames = [
    "María José","María Fernanda","Daniela","Andrea","Genesis","Yelitza","Norkys",
    "Génesis","Andreína","Dayana","Yusmary"
  ];

  const veSurnames = [
    "Chacón","Figueroa","Pacheco","Tovar","Colmenares","Aponte","Zambrano","Cedeño",
    "Betancourt","Uzcátegui","Rangel","Carvajal"
  ];

  // =========================
  // 🌎 LATAM
  // =========================

  const latamMaleNames = [
    "José","Luis","Carlos","Miguel","Ángel","Diego","Raúl","Fernando","Javier","Eduardo",
    "Andrés","Pablo","Sergio","Ricardo","Héctor","Manuel","Iván","Óscar","Salvador"
  ];

  const latamFemaleNames = [
    "María","Carmen","Ana","Isabel","Patricia","Gabriela","Adriana","Laura","Natalia",
    "Verónica","Alejandra","Claudia","Andrea","Rosa","Elena","Paola","Sandra"
  ];

  const latamSurnames = [
    "Hernández","Jiménez","Morales","Vargas","Castillo","Ortega","Delgado","Cruz","Reyes",
    "Moreno","Silva","Mendoza","Ramos","Aguilar","Peña","Flores","Cabrera","Campos","Vega"
  ];

  // =========================
  // 🇺🇸 INGLES
  // =========================

  const enMaleNames = [
    "James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Christopher",
    "Daniel","Matthew","Anthony","Mark","Steven","Paul","Andrew","Joshua"
  ];

  const enFemaleNames = [
    "Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen",
    "Ashley","Emily","Samantha","Olivia","Emma","Sophia"
  ];

  const enSurnames = [
    "Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Wilson","Anderson","Taylor",
    "Thomas","Moore","Martin","Jackson","White","Harris","Clark","Lewis"
  ];

  // =========================
  // helpers
  // =========================

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const maybeDouble = (chance) => Math.random() < chance;

  // =========================
  // UNIFORM POOLS
  // =========================

  const maleNames = [
    ...arMaleNames,
    ...uyMaleNames,
    ...coMaleNames,
    ...veMaleNames,
    ...latamMaleNames,
    ...enMaleNames
  ];

  const femaleNames = [
    ...arFemaleNames,
    ...uyFemaleNames,
    ...coFemaleNames,
    ...veFemaleNames,
    ...latamFemaleNames,
    ...enFemaleNames
  ];

  const allFirstNames =
    gender === "male" ? maleNames :
    gender === "female" ? femaleNames :
    [...maleNames, ...femaleNames];

  const allSurnames = [
    ...arSurnames,
    ...uySurnames,
    ...coSurnames,
    ...veSurnames,
    ...latamSurnames,
    ...enSurnames
  ];

  // =========================
  // GENERAR
  // =========================

  let firstName = pick(allFirstNames);

  if (maybeDouble(doubleFirstNameChance)) {
    let second;
    do {
      second = pick(allFirstNames);
    } while (second === firstName);

    firstName += " " + second;
  }

  let surname = pick(allSurnames);

  if (maybeDouble(doubleSurnameChance)) {
    let second;
    do {
      second = pick(allSurnames);
    } while (second === surname);

    surname += " " + second;
  }

  return `${firstName} ${surname}`;
}