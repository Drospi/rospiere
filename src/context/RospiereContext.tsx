import React, { createContext, useContext, useState, ReactNode } from 'react';
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
} from '@/types/rospiere';
import {
  INITIAL_BOOKS,
  INITIAL_QUIZZES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_USER_STATS,
  INITIAL_MEDALS,
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

  const getBook = (id: string) => books.find((b) => b.id === id);
  const getQuiz = (id: string) => quizzes.find((q) => q.id === id);

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
  const [aiApiKey, setAiApiKey] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>('local');

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
