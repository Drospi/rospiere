export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  badge?: string;
  category: string;
  edition: string;
  accolade?: string;
  rating: number;
  remainingTime: string;
  pagesTotal: number;
  currentPage: number;
  isBookmarked: boolean;
  status: 'reading' | 'to_read' | 'completed';
  synopsis: string;
  isEpub?: boolean;
  totalChapters?: number;
  currentChapterIndex?: number;
  sourceType?: 'bundle' | 'imported';
  sampleChapter: {
    chapterNumber: string;
    part: string;
    title: string;
    content: string[];
    quote: string;
  };
  symbolismNote?: {
    concept: string;
    explanation: string;
  };
  reflectionQuestion?: {
    question: string;
    prompt: string;
  };
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  title: string;
  description: string;
  coverImage: string;
  level: 'Básico' | 'Nivel Intermedio' | 'Avanzado' | 'Reflexivo' | 'Contextual';
  tag: string;
  questionCount: number;
  approvalRate?: string;
  estimatedTime: string;
  completedQuestions: number;
  totalQuestions: number;
  category: 'deep' | 'trivia' | 'vocabulary' | 'structure';
  hasGoldMedal?: boolean;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  bookCards?: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    tag: string;
    editionInfo: string;
  }[];
  quizCard?: {
    bookTitle: string;
    quizCountText: string;
    quizId: string;
  };
}

export interface UserStats {
  evaluatedBooks: number;
  accuracyPercent: number;
  streakDays: number;
}

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface CuratedList {
  id: string;
  title: string;
  subtitle: string;
  editionBadge: string;
  description: string;
  booksCount: string;
  icon: string;
  bookIds: string[];
}

export type EpubThemeMode = 'paper' | 'sepia' | 'night' | 'oled';
export type EpubFontFamily = 'noto-serif' | 'baskerville' | 'garamond' | 'inter';
export type EpubLeading = 'compact' | 'editorial' | 'generous';
export type EpubMargin = 'tight' | 'standard' | 'wide';
export type EpubAlign = 'left' | 'justify';

export interface EpubReaderSettings {
  fontFamily: EpubFontFamily;
  fontSize: number; // 16, 18, 20, 22
  leading: EpubLeading; // 1.5, 1.85, 2.2
  theme: EpubThemeMode;
  align: EpubAlign;
  margin: EpubMargin;
  showAssistantNotes: boolean;
  zenMode: boolean;
  isSettingsOpen: boolean;
}

export interface EpubBookItem {
  id: string;
  title: string;
  author: string;
  fileSizeText: string;
  coverImage?: string;
  status: 'ready' | 'processing';
  progressPercent: number;
  statusMessage?: string;
  totalChapters: number;
  currentChapterIndex: number;
  isBookmarked: boolean;
  sourceType: 'bundle' | 'imported';
  description?: string;
}

export interface EpubChapterContent {
  title: string;
  paragraphs: string[];
  assistantNote?: string;
  quote?: {
    text: string;
    author: string;
  };
}

export interface CustomEpubData {
  id: string;
  title: string;
  author: string;
  coverBase64?: string;
  chapters: EpubChapterContent[];
}

export interface EpubBookmarkItem {
  id: string;
  bookId: string;
  chapterIndex: number;
  chapterTitle: string;
  text: string;
  date: string;
  color?: string;
}
