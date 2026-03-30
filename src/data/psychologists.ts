export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Psychologist {
  id: string;
  name: string;
  title: string;
  photo: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  experience: number;
  bio: string;
  education: string[];
  languages: string[];
  location: string;
  verified: boolean;
  prices: {
    video: number;
    presencial: number;
    chat: number;
  };
  schedule: {
    [day: string]: string[];
  };
  reviews: Review[];
}

export const psychologists: Psychologist[] = [
  {
    id: "1",
    name: "Sofía Ramírez",
    title: "Dra.",
    photo: "https://images.unsplash.com/photo-1733685318562-c726472bc1db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    specialties: ["Ansiedad", "Depresión", "Mindfulness"],
    rating: 4.9,
    reviewCount: 128,
    experience: 10,
    bio: "Soy psicóloga clínica con más de 10 años de experiencia acompañando a personas en procesos de crecimiento personal y bienestar emocional. Mi enfoque integra técnicas de mindfulness con terapia cognitivo-conductual para ofrecer un tratamiento personalizado y efectivo. Me especializo en el manejo de la ansiedad, depresión y el desarrollo de habilidades de regulación emocional.",
    education: [
      "Doctorado en Psicología Clínica – Universidad Autónoma (2014)",
      "Maestría en Terapia Cognitivo-Conductual – UNAM (2011)",
      "Licenciatura en Psicología – Universidad Iberoamericana (2009)",
    ],
    languages: ["Español", "Inglés"],
    location: "Ciudad de México",
    verified: true,
    prices: { video: 55, presencial: 75, chat: 35 },
    schedule: {
      monday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      tuesday: ["09:00", "10:00", "11:00", "12:00"],
      wednesday: ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00"],
      thursday: ["09:00", "10:00", "11:00", "12:00", "14:00"],
      friday: ["09:00", "10:00", "11:00"],
    },
    reviews: [
      { id: "r1", user: "María T.", avatar: "MT", rating: 5, date: "2024-11-15", comment: "La Dra. Ramírez me cambió la vida. Aprendí a manejar mi ansiedad de forma efectiva y hoy me siento mucho más tranquila." },
      { id: "r2", user: "Jorge L.", avatar: "JL", rating: 5, date: "2024-10-30", comment: "Excelente profesional, muy empática y atenta. Cada sesión la siento como una inversión en mi bienestar." },
      { id: "r3", user: "Claudia R.", avatar: "CR", rating: 4, date: "2024-10-10", comment: "Muy buena experiencia. Las técnicas de mindfulness que me enseñó me han ayudado enormemente." },
    ],
  },
  {
    id: "2",
    name: "Carlos Mendez",
    title: "Dr.",
    photo: "https://images.unsplash.com/photo-1666113604293-d34734339acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    specialties: ["TCC", "Estrés Laboral", "Autoestima"],
    rating: 4.8,
    reviewCount: 95,
    experience: 8,
    bio: "Psicólogo clínico especializado en Terapia Cognitivo-Conductual con enfoque en estrés laboral y trastornos de ansiedad. He trabajado con cientos de personas en entornos corporativos y universitarios, ayudándoles a encontrar el equilibrio entre su vida profesional y personal. Creo firmemente en el poder del autoconocimiento como motor de cambio.",
    education: [
      "Maestría en Psicología Clínica – Universidad de Guadalajara (2016)",
      "Especialidad en TCC – Instituto Beck de América Latina (2017)",
      "Licenciatura en Psicología – ITESO (2014)",
    ],
    languages: ["Español", "Inglés", "Portugués"],
    location: "Guadalajara",
    verified: true,
    prices: { video: 50, presencial: 70, chat: 30 },
    schedule: {
      monday: ["10:00", "11:00", "12:00", "15:00", "16:00"],
      tuesday: ["10:00", "11:00", "12:00", "15:00"],
      wednesday: ["10:00", "11:00", "15:00", "16:00"],
      thursday: ["10:00", "11:00", "12:00"],
      friday: ["10:00", "11:00", "12:00", "15:00", "16:00"],
    },
    reviews: [
      { id: "r1", user: "Pedro A.", avatar: "PA", rating: 5, date: "2024-11-20", comment: "El Dr. Mendez tiene una capacidad impresionante para escuchar y guiar. Mi estrés laboral disminuyó notablemente." },
      { id: "r2", user: "Laura S.", avatar: "LS", rating: 5, date: "2024-11-05", comment: "Muy profesional y empático. Las sesiones por videollamada son súper cómodas y efectivas." },
      { id: "r3", user: "Andrés M.", avatar: "AM", rating: 4, date: "2024-10-22", comment: "Gran psicólogo. Me ayudó a ver patrones de pensamiento que no había notado antes." },
    ],
  },
  {
    id: "3",
    name: "María López",
    title: "Dra.",
    photo: "https://images.unsplash.com/photo-1771240730126-594a8ab66be1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    specialties: ["Trauma", "EMDR", "PTSD"],
    rating: 4.9,
    reviewCount: 74,
    experience: 12,
    bio: "Me dedico al tratamiento del trauma y el PTSD utilizando la terapia EMDR, reconocida internacionalmente por su eficacia. Con 12 años de experiencia, he acompañado a personas que han vivido situaciones difíciles a sanar sus heridas y retomar el control de su vida. Mi consulta es un espacio seguro, confidencial y sin juicios.",
    education: [
      "Doctorado en Psicología del Trauma – Universidad Nacional (2012)",
      "Certificación internacional en EMDR – EMDR Institute USA (2013)",
      "Maestría en Psicología Clínica – UNAM (2009)",
    ],
    languages: ["Español", "Francés"],
    location: "Ciudad de México",
    verified: true,
    prices: { video: 60, presencial: 80, chat: 40 },
    schedule: {
      monday: ["09:00", "10:00", "11:00"],
      wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      thursday: ["14:00", "15:00", "16:00", "17:00"],
      friday: ["09:00", "10:00", "11:00", "12:00"],
    },
    reviews: [
      { id: "r1", user: "Valentina C.", avatar: "VC", rating: 5, date: "2024-11-18", comment: "La Dra. López me ayudó a superar un trauma que cargué por años. El EMDR fue transformador para mí." },
      { id: "r2", user: "Ricardo F.", avatar: "RF", rating: 5, date: "2024-11-02", comment: "Increíble profesional. Su calidez y conocimiento hacen que el proceso sea más llevadero." },
      { id: "r3", user: "Sandra K.", avatar: "SK", rating: 4, date: "2024-10-15", comment: "Excelente terapeuta especializada en trauma. Me siento mucho mejor después de 3 meses de trabajo." },
    ],
  },
  {
    id: "4",
    name: "Elena Kim",
    title: "Dra.",
    photo: "https://images.unsplash.com/photo-1770627000564-3feb36aecbcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    specialties: ["Infancia", "Adolescencia", "Familia"],
    rating: 4.7,
    reviewCount: 63,
    experience: 7,
    bio: "Especialista en psicología infantil y adolescente con enfoque sistémico-familiar. Trabajo de forma colaborativa con niños, jóvenes y sus familias para abordar dificultades emocionales, conductuales y relacionales. Mi consulta es un espacio lúdico y cálido donde los más pequeños se sienten seguros para expresarse.",
    education: [
      "Maestría en Psicología Infantil y Adolescente – Universidad del Pacífico (2017)",
      "Especialidad en Terapia Sistémica – Centro Familiar de Monterrey (2018)",
      "Licenciatura en Psicología – Universidad del Valle (2014)",
    ],
    languages: ["Español", "Inglés", "Coreano"],
    location: "Monterrey",
    verified: true,
    prices: { video: 50, presencial: 65, chat: 30 },
    schedule: {
      tuesday: ["09:00", "10:00", "11:00", "12:00", "15:00"],
      wednesday: ["09:00", "10:00", "15:00", "16:00"],
      thursday: ["09:00", "10:00", "11:00", "15:00"],
      friday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    },
    reviews: [
      { id: "r1", user: "Familia Ruiz", avatar: "FR", rating: 5, date: "2024-11-12", comment: "La Dra. Kim conectó increíblemente con nuestro hijo. En pocas sesiones notamos cambios muy positivos." },
      { id: "r2", user: "Camila V.", avatar: "CV", rating: 5, date: "2024-10-28", comment: "Mi hija adolescente se niega a hablar con otros adultos, pero con la Dra. Kim confió desde el primer día." },
    ],
  },
  {
    id: "5",
    name: "Andrés Torres",
    title: "Dr.",
    photo: "https://images.unsplash.com/photo-1642975967602-653d378f3b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    specialties: ["Pareja", "Sexualidad", "Vínculos"],
    rating: 4.8,
    reviewCount: 89,
    experience: 9,
    bio: "Psicólogo clínico y terapeuta de pareja con formación en psicoanálisis y terapia de sistemas relacionales. Acompaño a individuos y parejas a mejorar su comunicación, trabajar conflictos y fortalecer sus vínculos afectivos. Creo en la importancia de una sexualidad sana y libre de culpa como pilar del bienestar integral.",
    education: [
      "Maestría en Psicología Clínica – Universidad Pontificia (2015)",
      "Especialidad en Terapia de Pareja – Instituto de la Familia (2016)",
      "Licenciatura en Psicología – UNAM (2012)",
    ],
    languages: ["Español", "Inglés"],
    location: "Ciudad de México",
    verified: false,
    prices: { video: 60, presencial: 80, chat: 35 },
    schedule: {
      monday: ["11:00", "12:00", "16:00", "17:00"],
      tuesday: ["11:00", "12:00", "16:00"],
      thursday: ["11:00", "12:00", "16:00", "17:00"],
      friday: ["11:00", "12:00", "16:00"],
      saturday: ["10:00", "11:00", "12:00"],
    },
    reviews: [
      { id: "r1", user: "Pareja H.", avatar: "PH", rating: 5, date: "2024-11-22", comment: "El Dr. Torres nos ayudó a reconectar como pareja. Su metodología es clara, sin juicios y muy efectiva." },
      { id: "r2", user: "Isabel M.", avatar: "IM", rating: 4, date: "2024-11-08", comment: "Muy buen profesional. Me ayudó a entender mis patrones relacionales y a tomar decisiones más conscientes." },
      { id: "r3", user: "Diego P.", avatar: "DP", rating: 5, date: "2024-10-20", comment: "Increíble experiencia. Me siento más seguro en mis relaciones gracias a las sesiones con el Dr. Torres." },
    ],
  },
];

export const specialtyOptions = [
  "Ansiedad",
  "Depresión",
  "Trauma",
  "EMDR",
  "PTSD",
  "TCC",
  "Estrés Laboral",
  "Pareja",
  "Sexualidad",
  "Infancia",
  "Adolescencia",
  "Familia",
  "Mindfulness",
  "Autoestima",
  "Vínculos",
];

export const dayNames: { [key: string]: string } = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const dayFromDate = (date: Date): string => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
};
