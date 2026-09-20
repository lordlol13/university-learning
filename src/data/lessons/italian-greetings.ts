import type { LessonContent } from "../../types/lesson-engine";

export const italianGreetingsLesson: LessonContent = {
  id: "italian-greetings",
  curriculumLessonId: "italian-greetings",
  version: 1,
  title: "Saluti e Presentazioni (Greetings & Introductions)",
  description: "Pronuncia fondamentale, saluti formali e informali, presentarsi e formule di cortesia.",
  estimatedMinutes: 14,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: [],
  learningObjectives: [
    "Distinguere e utilizzare appropriatamente i registri formale ('dare del Lei') e informale ('dare del tu').",
    "Padroneggiare i saluti in base ai momenti della giornata (mattina, pomeriggio, sera).",
    "Presentarsi con sicurezza in contesto universitario e sociale.",
  ],
  sections: [
    {
      id: "concept",
      title: "I Saluti Quotidiani",
      stage: "Understand",
      blocks: [
        {
          id: "it-saluti-intro",
          type: "introduction",
          title: "Benvenuti nella Lingua Italiana!",
          paragraphs: [
            "La lingua italiana è rinomata per la sua musicalità, chiarezza fonetica e ricchezza culturale. Nella vita universitaria a Torino, saper salutare con il tono adeguato è il primo passo verso un'integrazione accademica di successo.",
            "In italiano si distingue chiaramente tra il registro confidenziale (usato con amici, colleghi studenti e familiari) e il registro formale (usato con docenti, personale universitario e persone che non si conoscono).",
          ],
        },
        {
          id: "it-saluti-formula",
          type: "formula",
          title: "La Struttura del Saluto di Cortesia",
          latex: "\\text{Saluto} + \\text{Titolo} + \\text{Formula di cortesia}",
          explanation: "Ad esempio: 'Buongiorno, Professore. Come sta?'",
        },
        {
          id: "it-saluti-breakdown",
          type: "formula-breakdown",
          title: "Analisi delle Espressioni di Saluto",
          parts: [
            {
              latex: "\\text{Ciao}",
              variable: {
                latex: "\\text{Ciao}",
                name: "Informale",
                explanation: "Saluto universale tra amici, colleghi studenti e conoscenti intimi.",
              },
            },
            {
              latex: "\\text{Buongiorno}",
              variable: {
                latex: "\\text{Buongiorno}",
                name: "Formale / Giorno",
                explanation: "Utilizzato dall'alba fino al primo pomeriggio in ogni contesto.",
              },
            },
            {
              latex: "\\text{Arrivederci}",
              variable: {
                latex: "\\text{Arrivederci}",
                name: "Commiato",
                explanation: "Formula standard di cortesia al momento del congedo.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "presentarsi-sec",
      title: "Presentarsi e Fare Conoscenza",
      stage: "Visualize",
      blocks: [
        {
          id: "it-dialogo-worked",
          type: "worked-example",
          title: "Dialogo Guidato: Primo Giorno in Aula",
          problem: "Presentarsi a un collega studente e iniziare una conversazione.",
          steps: [
            {
              title: "Saluto iniziale e presentazione del nome",
              text: "Si usa il verbo riflessivo 'chiamarsi' alla prima persona singolare.",
              latex: "\\text{Ciao, mi chiamo Marco. E tu, come ti chiami?}",
            },
            {
              title: "Risposta e formula di piacere",
              text: "'Piacere' o 'Piacere di conoscerti' esprime cortesia e cordialità.",
              latex: "\\text{Piacere, Marco! Io sono Sofia. Piacere di conoscerti.}",
            },
            {
              title: "Condividere il percorso di studi",
              text: "Chiedere se si studia insieme Ingegneria al Politecnico.",
              latex: "\\text{Studi anche tu Ingegneria al Politecnico?}",
            },
          ],
          interpretation: "Questo scambio stabilisce un primo contatto amichevole e collaborativo tra studenti.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Esercitazione Pratica",
      stage: "Practice",
      blocks: [
        {
          id: "it-saluti-practice",
          type: "practice",
          problemIds: ["p-it-1", "p-it-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Test di Comprensione",
      stage: "Reflect",
      blocks: [
        {
          id: "it-saluti-quiz",
          type: "quiz",
          questionIds: ["q-it-1", "q-it-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-it-1",
      prompt: "Quante sillabe compongono la parola di saluto amichevole 'Ciao'?",
      answer: 1,
      tolerance: 0,
      hint: "'Ciao' è un monosillabo con dittongo discendente /tʃa.o/ pronunciato in un'unica emissione di voce.",
      explanation: "'Ciao' conta come una sola sillaba metrica in italiano.",
    },
    {
      id: "p-it-2",
      prompt: "Se in un'aula ci sono 3 professori e ciascuno saluta con 'Buongiorno', quanti saluti si ascoltano?",
      answer: 3,
      tolerance: 0,
      hint: "Calcola 3 per 1.",
      explanation: "Tre professori che salutano producono 3 formule di saluto.",
    },
  ],
  quiz: [
    {
      id: "q-it-1",
      prompt: "Quale tra i seguenti saluti è appropriato esclusivamente in partenza (quando ci si congeda)?",
      options: [
        "Arrivederci",
        "Buongiorno",
        "Buondì",
      ],
      answerIndex: 0,
      explanation: "'Arrivederci' è una formula di congedo ('arrivederci' = a risentirci/a presto).",
    },
    {
      id: "q-it-2",
      prompt: "Qual è la risposta più educata e naturale all'espressione 'Grazie mille'?",
      options: [
        "Prego!",
        "Piacere!",
        "ArrivederLa!",
      ],
      answerIndex: 0,
      explanation: "A un ringraziamento si risponde normalmente con 'Prego!' oppure 'Di nulla / Non c'è di che'.",
    },
  ],
};
