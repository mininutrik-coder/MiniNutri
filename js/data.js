const DIETS = {
  normal: [
    {
      name: "Desayuno Nutritivo",
      icon: "",
      slots: [" Desayuno", " Merienda"],
      desc: "Avena con frutas y un vaso de leche. Rica en fibra y calcio para crecer fuerte."
    },
    {
      name: "Almuerzo Balanceado",
      icon: "",
      slots: [" Almuerzo"],
      desc: "Arroz integral, pollo a la plancha y ensalada colorida con muchas verduras."
    },
    {
      name: "Cena Ligera",
      icon: "",
      slots: [" Cena"],
      desc: "Sopa de verduras con pan integral y fruta de temporada como postre."
    },
    {
      name: "Meriendas Sanas",
      icon: "",
      slots: [" Merienda x2"],
      desc: "Frutas frescas, yogur natural o zanahorias con hummus entre comidas."
    }
  ],
  underweight: [
    {
      name: "Desayuno Reforzado",
      icon: "",
      slots: [" Desayuno"],
      desc: "Huevos revueltos con tostadas, aguacate y vaso de leche entera para ganar energía."
    },
    {
      name: "Almuerzo Completo",
      icon: "",
      slots: [" Almuerzo"],
      desc: "Pasta con carne, ensalada y postre de fruta con yogur o crema natural."
    },
    {
      name: "Cena Nutritiva",
      icon: "",
      slots: [" Cena"],
      desc: "Pollo con puré de papa, verduras salteadas y pan de caja integral."
    },
    {
      name: "Snacks Energéticos",
      icon: "",
      slots: [" Merienda x3"],
      desc: "Nueces, mantequilla de cacahuate con pan, batidos de plátano con leche."
    }
  ],
  overweight: [
    {
      name: "Desayuno Ligero",
      icon: "",
      slots: [" Desayuno"],
      desc: "Frutas frescas, yogur bajo en grasa y granola sin azúcar añadida."
    },
    {
      name: "Almuerzo Saludable",
      icon: "",
      slots: [" Almuerzo"],
      desc: "Ensalada grande con pollo, aderezada con limón y hierbas naturales. Sin fritos."
    },
    {
      name: "Cena Baja en Calorías",
      icon: "",
      slots: [" Cena"],
      desc: "Verduras al vapor con pescado a la plancha y agua de jamaica sin azúcar."
    },
    {
      name: "Hidratación Plus",
      icon: "",
      slots: ["Durante el día"],
      desc: "Agua natural, infusiones de fruta sin azúcar y tés naturales. Evitar refrescos."
    }
  ],
  obese: [
    {
      name: "Desayuno Controlado",
      icon: "",
      slots: [" Desayuno"],
      desc: "Avena con agua, una fruta de temporada y té natural sin azúcar."
    },
    {
      name: "Almuerzo Proteico",
      icon: "",
      slots: [" Almuerzo"],
      desc: "Pollo o pescado a la plancha con abundantes verduras. Sin harinas ni fritos."
    },
    {
      name: "Cena Muy Ligera",
      icon: "",
      slots: [" Cena"],
      desc: "Caldo de verduras casero, jícama con limón y una pieza de fruta."
    },
    {
      name: "Sin Azúcar Añadida",
      icon: "",
      slots: ["Todo el día"],
      desc: "Eliminar refrescos, dulces y frituras. Sustituir por agua, frutas y verduras."
    }
  ]
};

const EXERCISES = {
  normal: [
    { name: "Saltar la cuerda", icon: "", duration: "20 min", schedule: "4-6pm" },
    { name: "Correr en el parque", icon: "", duration: "30 min", schedule: "7-9am" },
    { name: "Bailar con música", icon: "", duration: "25 min", schedule: "Cualquier hora" },
    { name: "Andar en bicicleta", icon: "", duration: "30 min", schedule: "4-6pm" }
  ],
  underweight: [
    { name: "Caminata tranquila", icon: "", duration: "20 min", schedule: "7-9am" },
    { name: "Yoga para niños", icon: "", duration: "20 min", schedule: "Mañana" },
    { name: "Natación suave", icon: "", duration: "30 min", schedule: "4-6pm" },
    { name: "Estiramiento", icon: "", duration: "15 min", schedule: "Cualquier hora" }
  ],
  overweight: [
    { name: "Caminata rápida", icon: "", duration: "30 min", schedule: "7-9am" },
    { name: "Aeróbicos divertidos", icon: "", duration: "25 min", schedule: "4-6pm" },
    { name: "Saltar la cuerda", icon: "", duration: "15 min", schedule: "4-6pm" },
    { name: "Nadar", icon: "", duration: "30 min", schedule: "4-6pm" }
  ],
  obese: [
    { name: "Caminata diaria", icon: "", duration: "20 min", schedule: "7-9am" },
    { name: "Ejercicios sentado", icon: "", duration: "15 min", schedule: "Mañana" },
    { name: "Estiramiento suave", icon: "", duration: "15 min", schedule: "Tarde" },
    { name: "Natación lenta", icon: "", duration: "20 min", schedule: "4-6pm" }
  ]
};

const CONGRATS = [
  "¡Sigue así! ",
  "¡Vas muy bien! ",
  "¡Te mereces un gusto! ",
  "¡Eres un campeón de la nutrición! ",
  "¡Tu cuerpo te lo agradece! ",
  "¡Qué disciplina más increíble! ",
  "¡Estás logrando tus metas! ",
  "¡Increíble esfuerzo hoy! "
];

const TIPS = [
  "Toma 8 vasos de agua al día ",
  "Mastica despacio y disfruta tu comida ",
  "Come verduras de todos los colores ",
  "El desayuno es la comida más importante ",
  "Dormir bien ayuda a tu cuerpo a crecer ",
  "¡El ejercicio es más divertido en equipo! ",
  "Menos pantallas, más movimiento ",
  "Una fruta al día es un gran hábito ",
  "Lávate las manos antes de comer ",
  "Cepíllate los dientes después de cada comida ",
  "Elige agua en vez de refresco ",
  "Jugar afuera es una gran forma de ejercitarte ",
  "Comer en familia hace la comida más rica ",
  "Prueba un alimento nuevo esta semana ",
  "Estirar tu cuerpo antes de jugar te cuida ",
  "Las porciones pequeñas y variadas son ideales ",
  "Tomar el sol un rato te da energía ",
  "Pide ayuda a un adulto para leer las etiquetas ",
  "Descansa un poco entre juego y juego ",
  "Sonreír y quererte también es salud ",
  "Camina en vez de usar el carrito cuando puedas ",
  "Guarda los dulces para ocasiones especiales ",
  "Respirar profundo te ayuda a relajarte "
];