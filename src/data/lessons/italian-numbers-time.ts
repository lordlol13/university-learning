import type { LessonContent } from "../../types/lesson-engine";

export const italianNumbersTimeLesson: LessonContent = {
  id: "italian-numbers-time",
  curriculumLessonId: "italian-numbers-time",
  version: 1,
  title: "Numeri, Orari e Calendario (Numbers & Time)",
  description: "I numeri cardinali, chiedere e dire l'orario, giorni della settimana e calendario accademico.",
  estimatedMinutes: 15,
  difficulty: "Foundational",
  xp: 100,
  prerequisites: ["italian-greetings"],
  learningObjectives: [
    "Contare e utilizzare i numeri cardinali da 0 a 100 con corretta pronuncia.",
    "Chiedere e comunicare l'ora in modo naturale e preciso in italiano.",
    "Orientarsi nel calendario accademico tra giorni della settimana, mesi e scadenze.",
  ],
  sections: [
    {
      id: "concept",
      title: "I Numeri Cardinali",
      stage: "Understand",
      blocks: [
        {
          id: "it-numeri-intro",
          type: "introduction",
          title: "Contare in Italiano",
          paragraphs: [
            "I numeri in italiano seguono schemi regolari e intuitivi. Da uno a dieci: uno, due, tre, quattro, cinque, sei, sette, otto, nove, dieci.",
            "Nelle decine, quando si aggiunge 'uno' o 'otto', la vocale finale della decina cade per elisione fonetica: ventuno (non ventiuno), ventotto (non ventiotto).",
          ],
        },
        {
          id: "it-orario-formula",
          type: "formula",
          title: "Chiedere e Dire l'Orario",
          latex: "\\text{Che ore sono?} \\iff \\text{Sono le } [N] \\text{ e } [M]",
          explanation: "Ad eccezione dell'una ('È l'una'), di mezzogiorno e di mezzanotte, si usa sempre 'Sono le' seguito dal plurale delle ore.",
        },
        {
          id: "it-orario-breakdown",
          type: "formula-breakdown",
          title: "Divisione dei Quarti e delle Mezze",
          parts: [
            {
              latex: "\\text{e un quarto}",
              variable: {
                latex: "+15\\text{ min}",
                name: "+15 minuti",
                explanation: "Indica il primo quarto d'ora trascorso (es. 'le tre e un quarto').",
              },
            },
            {
              latex: "\\text{e mezza}",
              variable: {
                latex: "+30\\text{ min}",
                name: "+30 minuti",
                explanation: "Indica la mezz'ora (es. 'le quattro e mezza').",
              },
            },
            {
              latex: "\\text{meno un quarto}",
              variable: {
                latex: "-15\\text{ min}",
                name: "-15 minuti",
                explanation: "Indica che mancano 15 minuti all'ora successiva.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "calendario-sec",
      title: "I Giorni della Settimana e l'Orario delle Lezioni",
      stage: "Visualize",
      blocks: [
        {
          id: "it-orario-worked",
          type: "worked-example",
          title: "Consultare l'Orario delle Lezioni",
          problem: "Spiegare quando si tiene la lezione di Analisi Matematica.",
          steps: [
            {
              title: "Identificare il giorno",
              text: "I giorni lavorativi universitari terminano tutti con accento grave (lunedì, martedì, mercoledì, giovedì, venerdì).",
              latex: "\\text{Lunedì, Martedì, Mercoledì, Giovedì, Venerdì}",
            },
            {
              title: "Indicare l'orario di inizio",
              text: "Si usa la preposizione articolata 'alle' per l'orario di avvio.",
              latex: "\\text{La lezione comincia alle nove e un quarto (09:15)}",
            },
            {
              title: "Indicare l'aula e la durata",
              text: "Lessico pratico per muoversi nel campus universitario.",
              latex: "\\text{in Aula Magna per due ore consecutive}",
            },
          ],
          interpretation: "L'orario accademico standard organizza le lezioni in moduli di un'ora o un'ora e mezza.",
        },
      ],
    },
    {
      id: "practice-sec",
      title: "Esercitazione Pratica",
      stage: "Practice",
      blocks: [
        {
          id: "it-numeri-practice",
          type: "practice",
          problemIds: ["p-it-num-1", "p-it-num-2"],
        },
      ],
    },
    {
      id: "quiz-sec",
      title: "Test di Comprensione",
      stage: "Reflect",
      blocks: [
        {
          id: "it-numeri-quiz",
          type: "quiz",
          questionIds: ["q-it-num-1", "q-it-num-2"],
        },
      ],
    },
  ],
  practiceProblems: [
    {
      id: "p-it-num-1",
      prompt: "A quanti minuti corrispondono 'tre quarti d'ora'?",
      answer: 45,
      tolerance: 0,
      hint: "Un quarto d'ora è 15 minuti. Moltiplica 15 per 3.",
      explanation: "15 minuti x 3 = 45 minuti.",
    },
    {
      id: "p-it-num-2",
      prompt: "Quanti sono i giorni feriali (lavorativi) della settimana accademica da lunedì a venerdì?",
      answer: 5,
      tolerance: 0,
      hint: "Conta: lunedì (1), martedì (2), mercoledì (3), giovedì (4), venerdì (5).",
      explanation: "I giorni feriali dal lunedì al venerdì sono esattamente 5.",
    },
  ],
  quiz: [
    {
      id: "q-it-num-1",
      prompt: "Qual è la traduzione corretta dell'orario 10:45 in italiano parlato?",
      options: [
        "Le undici meno un quarto",
        "Le dieci e tre quarti d'ora",
        "Le nove e quarantacinque",
      ],
      answerIndex: 0,
      explanation: "In italiano si esprime comunemente 10:45 come l'ora successiva meno 15 minuti: 'le undici meno un quarto'.",
    },
    {
      id: "q-it-num-2",
      prompt: "Quale giorno precede immediatamente il venerdì?",
      options: [
        "Giovedì",
        "Mercoledì",
        "Sabato",
      ],
      answerIndex: 0,
      explanation: "La sequenza è mercoledì, giovedì, venerdì, sabato.",
    },
  ],
};
