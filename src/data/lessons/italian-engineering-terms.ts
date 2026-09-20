import type { LessonContent } from "../../types/lesson-engine";

export const italianEngineeringTermsLesson: LessonContent = {
  id: "italian-engineering-terms",
  curriculumLessonId: "italian-engineering-terms",
  version: 1,
  title: "Italiano per Ingegneri (Technical Vocabulary)",
  description: "Terminologia tecnica essenziale per gli studenti del Politecnico di Torino.",
  estimatedMinutes: 16,
  difficulty: "Foundational",
  xp: 120,
  prerequisites: ["italian-numbers-time"],
  learningObjectives: [
    "Padroneggiare la terminologia di laboratorio, misurazione e calcolo in lingua italiana.",
    "Comprendere le istruzioni delle prove d'esame (scritto, orale, progetto).",
    "Comunicare efficacemente con docenti e colleghi nei lavori di gruppo ingegneristici.",
  ],
  sections: [
    {
      id: "concept",
      title: "Il Lessico della Tecnica e della Scienza",
      stage: "Understand",
      blocks: [
        {
          id: "it-tech-intro",
          type: "introduction",
          title: "L'Italiano dell'Ingegneria al PoliTO",
          paragraphs: [
            "Il Politecnico di Torino ha una tradizione ultracentenaria nella formazione di ingegneri d'eccellenza. Comprendere il lessico tecnico italiano permette di seguire le lezioni teoriche e le esercitazioni di laboratorio con la massima efficacia.",
            "I termini scientifici e ingegneristici derivano in gran parte dal latino e dal greco, condividendo radici internazionali ma con peculiarità sintattiche e ortografiche tipiche dell'italiano.",
          ],
        },
        {
          id: "it-tech-formula",
          type: "formula",
          title: "Relazione tra Grandezza e Misura",
          latex: "\\text{Grandezza fisica} = \\text{Valore numerico} \\times \\text{Unità di misura}",
          explanation: "In italiano: 'La tensione è pari a duecentoventi volt (220 V)'.",
        },
        {
          id: "it-tech-breakdown",
          type: "formula-breakdown",
          title: "Termini Fondamentali di Laboratorio",
          parts: [
            {
              latex: "\\text{La misura}",
              variable: {
                latex: "M",
                name: "Rilevamento",
                explanation: "L'atto di quantificare una grandezza tramite uno strumento tarato.",
              },
            },
            {
              latex: "\\text{L'incertezza}",
              variable: {
                latex: "\\pm\\sigma",
                name: "Tolleranza",
                explanation: "La deviazione o intervallo di confidenza associato a ogni dato sperimentale.",
              },
            },
            {
              latex: "\\text{La verifica}",
              variable: {
                latex: "\\text{CFU}",
                name: "Valutazione",
                explanation: "La sessione ufficiale d'esame per conseguire i crediti formativi (CFU).",
              },
            },
          ],
        },
      ],
    },
    {
      id: "esame-sec",
      title: "Istruzioni per l'Esame e Progetto",
      stage: "Visualize",
      blocks: [
        {
          id: "it-tech-worked",
          type: "worked-example",
          title: "Leggere la Consegna di un Progetto",
          problem: "Interpretare le istruzioni di una prova pratica di laboratorio.",
          steps: [
            {
              title: "Istruzione di calcolo",
              text: "Il verbo 'calcolare' all'infinito definisce l'obiettivo principale della prova.",
              latex: "\\text{Calcolare la resistenza equivalente del circuito}",
            },
            {
              title: "Istruzione di verifica",
              text: "'Tracciare il grafico' richiede la rappresentazione su assi cartesiani.",
              latex: "\\text{Verificare la stabilità del sistema e tracciare il grafico}",
            },
            {
              title: "Consegna e relazione finale",
              text: "'Relazione tecnica' è il report scritto formale dell'esperimento.",
              latex: "\\text{Consegnare la relazione tecnica entro la data di scadenza}",
            },
          ],
          interpretation: "Seguire con rigore metodologico ogni fase assicura la massima valutazione accademica.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Esercitazione Pratica",
      stage: "Practice",
      blocks: [
        {
          id: "it-tech-practice",
          type: "practice",
          problemIds: ["p-it-tech-1", "p-it-tech-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Test di Comprensione",
      stage: "Reflect",
      blocks: [
        {
          id: "it-tech-quiz",
          type: "quiz",
          questionIds: ["q-it-tech-1", "q-it-tech-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-it-tech-1",
      prompt: "Un esame universitario vale tipicamente quanti Crediti Formativi Universitari (CFU) base per un modulo semestrale standard: 6 oppure 60?",
      answer: 6,
      tolerance: 0,
      hint: "Un anno accademico completo è di 60 CFU, suddiviso in circa 10 corsi da 6 CFU ciascuno.",
      explanation: "Un corso semestrale standard al PoliTO assegna normalmente 6 CFU.",
    },
    {
      id: "p-it-tech-2",
      prompt: "Se una prova scritta dura due ore e mezza, a quanti minuti corrisponde in totale?",
      answer: 150,
      tolerance: 0,
      hint: "Due ore sono 120 minuti, mezza ora è 30 minuti. 120 + 30.",
      explanation: "120 + 30 = 150 minuti totali.",
    },
  ],
  quiz: [
    {
      id: "q-it-tech-1",
      prompt: "Cosa indicano i 'Crediti Formativi Universitari' (CFU) in Italia?",
      options: [
        "La misura del carico di lavoro e ore di studio di un insegnamento (equivalente a ECTS)",
        "Lo sconto sul costo dei libri di testo",
        "Il numero di stanze disponibili nello studentato",
      ],
      answerIndex: 0,
      explanation: "I CFU (Crediti Formativi Universitari) corrispondono al sistema europeo ECTS per quantificare l'impegno orario di ogni corso.",
    },
    {
      id: "q-it-tech-2",
      prompt: "Come si chiama in italiano l'aula universitaria specificamente attrezzata per esperimenti pratici?",
      options: [
        "Laboratorio",
        "Mensa",
        "Corridoio",
      ],
      answerIndex: 0,
      explanation: "Il 'laboratorio' è lo spazio deputato a prove sperimentali, collaudi e progettazione tecnica.",
    },
  ],
};
