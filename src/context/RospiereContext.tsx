import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Book,
  Quiz,
  ChatMessage,
  UserStats,
  Medal,
  EpubReaderSettings,
  EpubBookItem,
  EpubFontFamily,
  EpubLeading,
  EpubMargin,
  EpubThemeMode,
  EpubAlign,
  EpubBookmarkItem,
  ChallengeItem,
} from '@/types/rospiere';
import {
  INITIAL_BOOKS,
  INITIAL_QUIZZES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_USER_STATS,
  INITIAL_MEDALS,
  INITIAL_CHALLENGES,
} from '@/data/rospiereData';
import { ParsedEpub } from '@/utils/epubParser';

export type ReaderThemeMode = 'paper' | 'sepia' | 'dark';

interface ReaderSettings {
  fontSize: number;
  theme: ReaderThemeMode;
}

const INITIAL_EPUB_BOOKS: EpubBookItem[] = [
  {
    id: 'odisea-homero',
    title: 'La Odisea',
    author: 'Homero',
    fileSizeText: '563 KB',
    status: 'ready',
    progressPercent: 42,
    statusMessage: 'Validado • 100%',
    totalChapters: 24,
    currentChapterIndex: 0,
    isBookmarked: true,
    sourceType: 'bundle',
    description: 'Edición crítica bilingüe jónica con notas marginales del Canto I al XXIV.',
  },
  {
    id: 'cumbres-borrascosas',
    title: 'Cumbres Borrascosas',
    author: 'Emily Brontë',
    fileSizeText: '3.4 MB',
    status: 'ready',
    progressPercent: 100,
    statusMessage: 'Validado • 100%',
    totalChapters: 34,
    currentChapterIndex: 0,
    isBookmarked: false,
    sourceType: 'bundle',
    description: 'Traducción canónica con prefacio sobre el Romanticismo tardío inglés.',
  },
  {
    id: 'la-metamorfosis',
    title: 'La Metamorfosis',
    author: 'Franz Kafka',
    fileSizeText: '1.8 MB',
    status: 'processing',
    progressPercent: 65,
    statusMessage: 'Generando cuestionarios... • 65%',
    totalChapters: 3,
    currentChapterIndex: 0,
    isBookmarked: false,
    sourceType: 'bundle',
    description: 'Revisión textual y tipográfica en proceso para preservación editorial.',
  },
];

interface RospiereContextType {
  books: Book[];
  getBook: (id: string) => Book | undefined;
  toggleBookmark: (id: string) => void;
  updateReadingProgress: (bookId: string, page: number) => void;
  quizzes: Quiz[];
  getQuiz: (id: string) => Quiz | undefined;
  submitQuizAnswer: (quizId: string, isCorrect: boolean) => void;
  chatMessages: ChatMessage[];
  sendMessage: (text: string) => void;
  userStats: UserStats;
  medals: Medal[];
  readerSettings: ReaderSettings;
  setFontSize: (updater: (prev: number) => number) => void;
  setReaderTheme: (theme: ReaderThemeMode) => void;
  bookmarkedPages: Record<string, number[]>;
  togglePageBookmark: (bookId: string, page: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilterQuiz: string;
  setActiveFilterQuiz: (filter: string) => void;
  
  // EPUB Reader & Workshop
  epubSettings: EpubReaderSettings;
  toggleEpubSettings: () => void;
  setEpubFontFamily: (font: EpubFontFamily) => void;
  setEpubFontSize: (size: number) => void;
  setEpubLeading: (leading: EpubLeading) => void;
  setEpubTheme: (theme: EpubThemeMode) => void;
  setEpubAlign: (align: EpubAlign) => void;
  setEpubMargin: (margin: EpubMargin) => void;
  toggleEpubAssistantNotes: () => void;
  toggleEpubZenMode: () => void;
  importedEpubBooks: EpubBookItem[];
  addImportedEpubBook: (book: EpubBookItem, parsedData?: ParsedEpub) => void;
  updateEpubChapter: (bookId: string, chapterIndex: number) => void;
  toggleEpubBookmark: (bookId: string) => void;
  getCustomEpubData: (bookId: string) => ParsedEpub | undefined;
  
  // EPUB Bookmarks & Highlights (Marcadores)
  epubBookmarks: EpubBookmarkItem[];
  addEpubBookmark: (item: Omit<EpubBookmarkItem, 'id' | 'date'>) => void;
  removeEpubBookmark: (id: string) => void;

  // Book Management (Edit & Delete)
  deleteBook: (bookId: string) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;

  // Challenges / Retos
  challenges: ChallengeItem[];
  addChallenge: (challenge: Omit<ChallengeItem, 'id' | 'createdAt' | 'currentCount' | 'status'>) => void;
  updateChallengeProgress: (challengeId: string, increment?: number) => void;

  // AI Quiz Generation
  addQuiz: (quiz: Quiz) => void;
  generateQuizWithAI: (bookTitle: string, bookAuthor: string, topicOrChapter?: string) => Promise<Quiz>;

  // AI Configuration for Literary Assistant
  aiApiKey: string;
  setAiApiKey: (key: string) => void;
  aiProvider: 'gemini' | 'openai' | 'local';
  setAiProvider: (provider: 'gemini' | 'openai' | 'local') => void;
}

const RospiereContext = createContext<RospiereContextType | undefined>(undefined);

export function RospiereProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [medals] = useState<Medal[]>(INITIAL_MEDALS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterQuiz, setActiveFilterQuiz] = useState<string>('Todos (18)');
  const [bookmarkedPages, setBookmarkedPages] = useState<Record<string, number[]>>({
    'klara-y-el-sol': [142],
  });

  // EPUB State
  const [importedEpubBooks, setImportedEpubBooks] = useState<EpubBookItem[]>(INITIAL_EPUB_BOOKS);
  const [customEpubDataMap, setCustomEpubDataMap] = useState<Record<string, ParsedEpub>>({});
  const [epubSettings, setEpubSettings] = useState<EpubReaderSettings>({
    fontFamily: 'noto-serif',
    fontSize: 18,
    leading: 'editorial',
    theme: 'paper',
    align: 'justify',
    margin: 'standard',
    showAssistantNotes: true,
    zenMode: false,
    isSettingsOpen: false, // Collapsible by default, can be toggled by user!
  });

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>({
    fontSize: 18,
    theme: 'paper',
  });
  const [aiApiKey, setAiApiKey] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>('local');

  const getBook = (id: string) => books.find((b) => b.id === id);
  const getQuiz = (id: string) => quizzes.find((q) => q.id === id);

  const deleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setImportedEpubBooks((prev) => prev.filter((b) => b.id !== bookId));
    setCustomEpubDataMap((prev) => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
    setEpubBookmarks((prev) => prev.filter((bm) => bm.bookId !== bookId));
  };

  const updateBook = (bookId: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, ...updates } : b))
    );
    setImportedEpubBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            title: updates.title !== undefined ? updates.title : b.title,
            author: updates.author !== undefined ? updates.author : b.author,
            coverImage: updates.coverImage !== undefined ? updates.coverImage : b.coverImage,
            description: updates.synopsis !== undefined ? updates.synopsis : b.description,
          };
        }
        return b;
      })
    );
  };

  const toggleBookmark = (id: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, isBookmarked: !book.isBookmarked } : book
      )
    );
  };

  const updateReadingProgress = (bookId: string, page: number) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const clampedPage = Math.min(Math.max(1, page), book.pagesTotal);
          const isDone = clampedPage >= book.pagesTotal;
          return {
            ...book,
            currentPage: clampedPage,
            status: isDone ? 'completed' : 'reading',
          };
        }
        return book;
      })
    );
  };

  const togglePageBookmark = (bookId: string, page: number) => {
    setBookmarkedPages((prev) => {
      const current = prev[bookId] || [];
      const exists = current.includes(page);
      return {
        ...prev,
        [bookId]: exists ? current.filter((p) => p !== page) : [...current, page],
      };
    });
  };

  const setFontSize = (updater: (prev: number) => number) => {
    setReaderSettings((prev) => ({
      ...prev,
      fontSize: Math.min(26, Math.max(14, updater(prev.fontSize))),
    }));
  };

  const setReaderTheme = (theme: ReaderThemeMode) => {
    setReaderSettings((prev) => ({ ...prev, theme }));
  };

  const submitQuizAnswer = (quizId: string, isCorrect: boolean) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === quizId) {
          const newCompleted = Math.min(q.totalQuestions, q.completedQuestions + 1);
          return {
            ...q,
            completedQuestions: newCompleted,
          };
        }
        return q;
      })
    );

    if (isCorrect) {
      setUserStats((prev) => ({
        ...prev,
        accuracyPercent: Math.min(99, prev.accuracyPercent + 1),
      }));
    }
  };

  const addChallenge = (
    item: Omit<ChallengeItem, 'id' | 'createdAt' | 'currentCount' | 'status'>
  ) => {
    const newChallenge: ChallengeItem = {
      ...item,
      id: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      currentCount: 0,
      status: 'active',
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    setChallenges((prev) => [newChallenge, ...prev]);
  };

  const updateChallengeProgress = (challengeId: string, increment: number = 1) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const newCount = Math.min(c.targetCount, c.currentCount + increment);
          const isCompleted = newCount >= c.targetCount;
          return {
            ...c,
            currentCount: newCount,
            status: isCompleted ? 'completed' : 'active',
          };
        }
        return c;
      })
    );
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes((prev) => [quiz, ...prev]);
  };

  const generateQuizWithAI = useCallback(
    async (
      bookTitle: string,
      bookAuthor: string,
      topicOrChapter?: string
    ): Promise<Quiz> => {
      const quizId = `quiz-ai-${Date.now()}`;
    const cleanTopic = topicOrChapter || 'Temas Fundamentales & Análisis Socrático';

    // Try AI generation if API key exists
    if (aiApiKey && aiApiKey.trim().length > 10) {
      try {
        const promptText = `Genera un cuestionario socrático de comprensión literaria de 3 preguntas de opción múltiple para el libro "${bookTitle}" de ${bookAuthor}. Tema o sección: ${cleanTopic}. Responde exclusivamente con un JSON válido sin texto adicional, con este formato exacto:
{
  "title": "Cuestionario Crítico: ${bookTitle}",
  "description": "Evaluación analítica sobre ${cleanTopic}.",
  "questions": [
    {
      "prompt": "¿...?",
      "options": ["A", "B", "C"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}`;

        let rawJson = '';
        if (aiProvider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${aiApiKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: promptText }],
              response_format: { type: 'json_object' },
              max_tokens: 600,
            }),
          });
          const json = await res.json();
          rawJson = json.choices?.[0]?.message?.content || '';
        } else {
          // Gemini
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiApiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
              }),
            }
          );
          const json = await res.json();
          rawJson = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        if (rawJson) {
          const cleanJsonStr = rawJson.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            const aiQuiz: Quiz = {
              id: quizId,
              bookId: bookTitle.toLowerCase().replace(/\s+/g, '-'),
              bookTitle,
              bookAuthor,
              title: parsed.title || `Cuestionario Crítico: ${bookTitle}`,
              description: parsed.description || `Evaluación generada con IA para ${bookTitle}.`,
              coverImage:
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
              level: 'Nivel Intermedio',
              tag: 'Generado IA',
              questionCount: parsed.questions.length,
              estimatedTime: '4 min',
              completedQuestions: 0,
              totalQuestions: parsed.questions.length,
              category: 'deep',
              hasGoldMedal: true,
              questions: parsed.questions.map((q: any, idx: number) => ({
                id: `q-${idx + 1}`,
                prompt: q.prompt,
                options: q.options || ['Verdadero', 'Falso'],
                correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                explanation: q.explanation || 'Análisis socrático del acierto.',
              })),
            };
            setQuizzes((prev) => [aiQuiz, ...prev]);
            return aiQuiz;
          }
        }
      } catch {
        // Fallback to local
      }
    }

    // Local / Offline Rospiere Socratic Generator
    const lower = bookTitle.toLowerCase();
    let sampleQuestions = [];

    if (lower.includes('odisea') || lower.includes('homero')) {
      sampleQuestions = [
        {
          id: 'q1',
          prompt: '¿Qué concepto homérico encarna la virtud primordial de Odiseo frente a la fuerza destructiva?',
          options: ['La «Mêtis» (astucia adaptable y prudencia)', 'El «Kléos» (gloria marcial impulsiva)', 'El azar de los vientos'],
          correctIndex: 0,
          explanation: 'La mêtis representa la inteligencia paciente y versátil que permite a Odiseo triunfar ante monstruos y tempestades.',
        },
        {
          id: 'q2',
          prompt: '¿Por qué la transgresión de la «Xenía» por parte de los pretendientes sella su destino inexorable?',
          options: [
            'Porque violan un tratado bélico previo',
            'Porque ofenden a Zeus Xenios, custodio del deber sagrado hacia el huésped',
            'Porque no pagaron tributo a los sacerdotes de Apolo',
          ],
          correctIndex: 1,
          explanation: 'En el canon clásico, la hospitalidad era una ley sagrada tutelada directamente por Zeus.',
        },
        {
          id: 'q3',
          prompt: '¿Qué significado simbólico posee el viaje de Telémaco a Pilos y Esparta en la Telemaquia?',
          options: [
            'Una expedición militar de conquista',
            'Un rito de iniciación hacia la madurez para reivindicar el linaje paterno',
            'Un escape pacífico ante el acoso de Ítaca',
          ],
          correctIndex: 1,
          explanation: 'La Telemaquia estructura la metamorfosis del joven príncipe en un líder digno de su estirpe.',
        },
      ];
    } else if (lower.includes('soledad') || lower.includes('marquez') || lower.includes('macondo')) {
      sampleQuestions = [
        {
          id: 'q1',
          prompt: '¿Cuál es el estigma ontológico que condena a las sucesivas generaciones de los Buendía?',
          options: [
            'La precariedad material de la selva',
            'La incapacidad de amar y la repetición cíclica del aislamiento',
            'La falta de educación formal',
          ],
          correctIndex: 1,
          explanation: 'García Márquez presenta la soledad como una incapacidad íntima de amar que replica sus propios espejismos.',
        },
        {
          id: 'q2',
          prompt: '¿Qué función desempeñan los pergaminos de Melquíades en la estructura de la novela?',
          options: [
            'Son actas notariales de propiedad de la tierra',
            'Registran el destino circular de la familia cifrado en sánscrito',
            'Son cánticos de alabanza a las expediciones de los gitanos',
          ],
          correctIndex: 1,
          explanation: 'Los pergaminos codifican el tiempo sincrónico de Macondo donde pasado, presente y futuro coinciden.',
        },
        {
          id: 'q3',
          prompt: '¿Qué acontecimiento simboliza la pérdida definitiva de la inocencia fundacional de Macondo?',
          options: [
            'La masacre de las bananeras y la amnesia histórica impuesta',
            'La llegada de los primeros imanes y la lupa gigante',
            'La construcción de la casa señorial con pianola',
          ],
          correctIndex: 0,
          explanation: 'La masacre introduce la violencia institucional y la tergiversación de la memoria colectiva.',
        },
      ];
    } else {
      sampleQuestions = [
        {
          id: 'q1',
          prompt: `¿Cuál es el núcleo dramático y moral que vertebra el desarrollo de «${bookTitle}»?`,
          options: [
            'La tensión entre la autenticidad del individuo y las demandas o fatalidad del entorno',
            'Un enredo anecdótico sin implicaciones psicológicas',
            'Una sucesión de eventos inconexos sin dilema ético',
          ],
          correctIndex: 0,
          explanation: 'La obra indaga en la fricción entre la identidad íntima y las imposiciones del mundo exterior.',
        },
        {
          id: 'q2',
          prompt: '¿Cómo modula el autor el tono y la voz narrativa a lo largo del texto?',
          options: [
            'A través de una aguda sensibilidad que resalta los contrastes emocionales de los personajes',
            'Mediante un registro neutro desprovisto de resonancia estética',
            'Con humor farsesco ajeno a la gravedad del argumento',
          ],
          correctIndex: 0,
          explanation: 'Las decisiones estilísticas profundizan la atmósfera sensible y el subtexto poético de la obra.',
        },
        {
          id: 'q3',
          prompt: '¿Qué interrogante filosófico o existencial plantea el cierre del texto?',
          options: [
            'La necesidad de confrontar la propia verdad antes de que el tiempo disuelva las certezas',
            'La irrelevancia absoluta de las decisiones morales',
            'La certeza de que ningún acto humano genera consecuencias',
          ],
          correctIndex: 0,
          explanation: 'El desenlace confronta al lector con el valor de la memoria y la lucidez frente al devenir vital.',
        },
      ];
    }

    const localQuiz: Quiz = {
      id: quizId,
      bookId: bookTitle.toLowerCase().replace(/\s+/g, '-'),
      bookTitle,
      bookAuthor,
      title: `Cuestionario Crítico: ${bookTitle}`,
      description: `Evaluación socrática de 3 preguntas analíticas sobre ${cleanTopic}.`,
      coverImage:
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
      level: 'Nivel Intermedio',
      tag: 'Generado IA Local',
      questionCount: sampleQuestions.length,
      estimatedTime: '3 min',
      completedQuestions: 0,
      totalQuestions: sampleQuestions.length,
      category: 'deep',
      hasGoldMedal: true,
      questions: sampleQuestions,
    };

    setQuizzes((prev) => [localQuiz, ...prev]);
    return localQuiz;
  }, [aiApiKey, aiProvider]);

  const sendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Intelligent simulated response
    setTimeout(() => {
      let botResponse = 'He indexado tu consulta. En las ediciones de Rospiere, este enfoque conecta directamente con los ensayos complementarios del tomo. ¿Te gustaría generar una síntesis de tres puntos clave o pasar a un cuestionario de 5 preguntas?';
      let quizCard: ChatMessage['quizCard'] = undefined;
      let bookCards: ChatMessage['bookCards'] = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('capítulo') || lower.includes('trata')) {
        botResponse = 'En este capítulo de Klara y el Sol, la narrativa se adentra en el simbolismo solar y el contraste entre la inocencia maquinal de Klara y la fragilidad biológica de Josie. Klara formula su primera oración laica al contemplar el granero al atardecer.';
      } else if (lower.includes('cuestionario') || lower.includes('quiz') || lower.includes('repaso')) {
        botResponse = 'He preparado una evaluación de 5 preguntas analíticas sobre la perspectiva del narrador y la metáfora de la nutrición solar.';
        quizCard = {
          bookTitle: 'Klara y el Sol',
          quizCountText: 'Evaluación rápida de 5 preguntas',
          quizId: 'quiz-klara',
        };
      } else if (lower.includes('simbolismo')) {
        botResponse = 'El simbolismo principal reside en la "luz solar como gracia": para Klara no es un simple recurso técnico de recarga, sino una fuerza providencial benevolente que redime el dolor humano ante la frialdad utilitarista.';
      } else if (lower.includes('recomiéndame') || lower.includes('novela') || lower.includes('edición') || lower.includes('regalo')) {
        botResponse = 'Para lectores atraídos por la prosa intimista y la melancolía reflexiva, te recomiendo estas tres joyas de nuestro catálogo:';
        bookCards = [
          {
            id: 'tokyo-blues',
            title: 'Tokyo Blues',
            author: 'Haruki Murakami',
            coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZoQOgelhL1V0RtuAKjzLaLaplY4JQrEk0NvVU5BNJfxReuSKCilqMgYnkKbgrjhH1ha3-8YPWtJfx2Izzn3RGZjtDdAul_8MVdAt1Ox534Kn6DlzorjDU4I1InyJFh2Xzf0ypNmRffniqGvgmwd_FuxlM7AJHlGoGY2caZKPBBnWXoLe3_4Yt15IYVrZFgMD59bbyAjWqJo8AGjsrRpH59XlENuMMcR0l7mKAFJh5eT8WjseT7WLQ',
            tag: 'Lino N° 04',
            editionInfo: 'Encuadernación en lino crudo',
          },
          {
            id: 'hamnet',
            title: 'Hamnet',
            author: 'Maggie O’Farrell',
            coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5in_9NGY0dyeXYiAi6ctqYR1mMJUiCWY-cPhD96IyC-CKOvTwOiqLF9r4NxzY9z50bwYMfRSEFNZfiugOeffeSVExndmQrDLc_X2tQ7Yi_7nPVBIqW-v3UHaybcjUOVVeXjRcYNFrslQm5SbXh_AJVJuzJ3a25Bg2mQM3iRK2HpQBhMj1zV01CYQIICS6-R0r8mj_T2RovmBOik0nJilJX4rTaQ7OQ2oo5fIBLJrus-FNObHYBdUb',
            tag: 'Lino N° 12',
            editionInfo: 'Papel verjurado',
          },
        ];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quizCard,
        bookCards,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  // EPUB Handlers
  const toggleEpubSettings = () => {
    setEpubSettings((prev) => ({
      ...prev,
      isSettingsOpen: !prev.isSettingsOpen,
    }));
  };

  const setEpubFontFamily = (fontFamily: EpubFontFamily) => {
    setEpubSettings((prev) => ({ ...prev, fontFamily }));
  };

  const setEpubFontSize = (fontSize: number) => {
    setEpubSettings((prev) => ({ ...prev, fontSize }));
  };

  const setEpubLeading = (leading: EpubLeading) => {
    setEpubSettings((prev) => ({ ...prev, leading }));
  };

  const setEpubTheme = (theme: EpubThemeMode) => {
    setEpubSettings((prev) => ({ ...prev, theme }));
  };

  const setEpubAlign = (align: EpubAlign) => {
    setEpubSettings((prev) => ({ ...prev, align }));
  };

  const setEpubMargin = (margin: EpubMargin) => {
    setEpubSettings((prev) => ({ ...prev, margin }));
  };

  const toggleEpubAssistantNotes = () => {
    setEpubSettings((prev) => ({ ...prev, showAssistantNotes: !prev.showAssistantNotes }));
  };

  const toggleEpubZenMode = () => {
    setEpubSettings((prev) => ({ ...prev, zenMode: !prev.zenMode }));
  };

  // Bookmarks & AI Config
  const [epubBookmarks, setEpubBookmarks] = useState<EpubBookmarkItem[]>([
    {
      id: 'bm-init-1',
      bookId: 'odisea-homero',
      chapterIndex: 0,
      chapterTitle: 'Canto I: Concilio de los dioses',
      text: '«Háblame, Musa, de aquel varón de multiforme ingenio que, después de destruir la sacra ciudad de Troya, anduvo peregrinando larguísimo tiempo...»',
      date: '20 Oct, 18:30',
      color: '#E0D0B8',
    },
  ]);

  const addEpubBookmark = (item: Omit<EpubBookmarkItem, 'id' | 'date'>) => {
    const newBookmark: EpubBookmarkItem = {
      ...item,
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setEpubBookmarks((prev) => [newBookmark, ...prev]);
  };

  const removeEpubBookmark = (id: string) => {
    setEpubBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const addImportedEpubBook = (book: EpubBookItem, parsedData?: ParsedEpub) => {
    setImportedEpubBooks((prev) => {
      const existsIndex = prev.findIndex((b) => b.id === book.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = book;
        return copy;
      }
      return [book, ...prev];
    });

    // Mirror in main books catalog so it appears in Novedades & Estantería
    const bookEntry: Book = {
      id: book.id,
      title: book.title,
      author: book.author || 'Autor Desconocido',
      coverImage:
        book.coverImage ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      badge: 'EPUB',
      category: 'Novedades',
      edition: 'Tomo EPUB Importado',
      rating: 4.9,
      remainingTime: `${Math.max(1, Math.round((book.totalChapters || 1) * 0.4))}h aprox.`,
      pagesTotal: Math.max(20, (book.totalChapters || 1) * 20),
      currentPage: Math.max(1, ((book.currentChapterIndex || 0) + 1) * 20),
      isBookmarked: false,
      status: 'reading',
      isEpub: true,
      totalChapters: book.totalChapters,
      currentChapterIndex: book.currentChapterIndex || 0,
      sourceType: 'imported',
      synopsis:
        book.description ||
        `Edición digital completa en formato EPUB 3.0 / 2.0 con ${book.totalChapters} capítulos indexados.`,
      sampleChapter: {
        chapterNumber: 'Capítulo 1',
        part: 'Apertura',
        title: parsedData?.chapters[0]?.title || 'Capítulo Inicial',
        quote:
          parsedData?.chapters[0]?.paragraphs[0]?.slice(0, 120) ||
          'Inicio del tomo editorial importado.',
        content: parsedData?.chapters[0]?.paragraphs?.slice(0, 3) || [
          'Contenido inicial del tomo importado.',
        ],
      },
    };

    setBooks((prev) => {
      const exists = prev.findIndex((b) => b.id === book.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = { ...copy[exists], ...bookEntry };
        return copy;
      }
      return [bookEntry, ...prev]; // Prepend to books so it appears first in Novedades
    });

    if (parsedData) {
      setCustomEpubDataMap((prev) => ({
        ...prev,
        [book.id]: parsedData,
      }));
    }
  };

  const updateEpubChapter = (bookId: string, chapterIndex: number) => {
    setImportedEpubBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const total = b.totalChapters || 1;
          const progressPercent = Math.min(100, Math.round(((chapterIndex + 1) / total) * 100));
          return {
            ...b,
            currentChapterIndex: chapterIndex,
            progressPercent,
          };
        }
        return b;
      })
    );

    // Sync progress in books state so library mirrors exact position
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const totalCh = b.totalChapters || 1;
          const progressPercent = Math.min(100, Math.round(((chapterIndex + 1) / totalCh) * 100));
          const newCurrentPage = Math.min(
            b.pagesTotal,
            Math.max(1, Math.round(((chapterIndex + 1) / totalCh) * b.pagesTotal))
          );
          return {
            ...b,
            currentChapterIndex: chapterIndex,
            currentPage: newCurrentPage,
            status: progressPercent >= 100 ? 'completed' : 'reading',
          };
        }
        return b;
      })
    );
  };

  const toggleEpubBookmark = (bookId: string) => {
    setImportedEpubBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isBookmarked: !b.isBookmarked } : b))
    );
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isBookmarked: !b.isBookmarked } : b))
    );
  };

  const getCustomEpubData = (bookId: string) => customEpubDataMap[bookId];

  return (
    <RospiereContext.Provider
      value={{
        books,
        getBook,
        toggleBookmark,
        updateReadingProgress,
        quizzes,
        getQuiz,
        submitQuizAnswer,
        chatMessages,
        sendMessage,
        userStats,
        medals,
        readerSettings,
        setFontSize,
        setReaderTheme,
        bookmarkedPages,
        togglePageBookmark,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeFilterQuiz,
        setActiveFilterQuiz,
        
        // EPUB Reader & Workshop
        epubSettings,
        toggleEpubSettings,
        setEpubFontFamily,
        setEpubFontSize,
        setEpubLeading,
        setEpubTheme,
        setEpubAlign,
        setEpubMargin,
        toggleEpubAssistantNotes,
        toggleEpubZenMode,
        importedEpubBooks,
        addImportedEpubBook,
        updateEpubChapter,
        toggleEpubBookmark,
        getCustomEpubData,
        
        // Book Management (Edit & Delete)
        deleteBook,
        updateBook,

        // Challenges / Retos
        challenges,
        addChallenge,
        updateChallengeProgress,

        // AI Quiz Generation
        addQuiz,
        generateQuizWithAI,

        // Bookmarks & AI
        epubBookmarks,
        addEpubBookmark,
        removeEpubBookmark,
        aiApiKey,
        setAiApiKey,
        aiProvider,
        setAiProvider,
      }}>
      {children}
    </RospiereContext.Provider>
  );
}

export function useRospiere() {
  const context = useContext(RospiereContext);
  if (!context) {
    throw new Error('useRospiere must be used within a RospiereProvider');
  }
  return context;
}
