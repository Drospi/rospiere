import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
  Share,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RospiereFonts, RospiereColors } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { ODISEA_EPUB_DATA } from '@/data/odiseaEpubData';
import {
  EpubLeading,
  EpubMargin,
} from '@/types/rospiere';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Substrate theme colors
const THEME_PALETTES = {
  paper: {
    bg: '#FAF8F5',
    text: '#1A1A1A',
    secondaryText: '#5A5652',
    cardBg: '#F3EFEA',
    border: '#E8E2D9',
    accent: '#000000',
    headerBg: 'rgba(250, 248, 245, 0.95)',
  },
  sepia: {
    bg: '#F4ECD8',
    text: '#3D332A',
    secondaryText: '#685949',
    cardBg: '#E9DEC2',
    border: '#DDD0B1',
    accent: '#2B2117',
    headerBg: 'rgba(244, 236, 216, 0.95)',
  },
  night: {
    bg: '#1E1E1E',
    text: '#E5E0D8',
    secondaryText: '#9E9991',
    cardBg: '#282828',
    border: '#3A3A3A',
    accent: '#FFFFFF',
    headerBg: 'rgba(30, 30, 30, 0.95)',
  },
  oled: {
    bg: '#000000',
    text: '#D4D4D4',
    secondaryText: '#828282',
    cardBg: '#121212',
    border: '#242424',
    accent: '#FFFFFF',
    headerBg: 'rgba(0, 0, 0, 0.95)',
  },
};

export default function EpubReaderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; chapter?: string }>();
  const bookId = params.id || 'odisea-homero';

  const {
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
    getCustomEpubData,
    updateEpubChapter,
    toggleEpubBookmark,
    epubBookmarks,
    addEpubBookmark,
    removeEpubBookmark,
    aiApiKey,
    setAiApiKey,
    aiProvider,
    setAiProvider,
    generateQuizWithAI,
  } = useRospiere();

  // Retrieve book data
  const bookMeta = useMemo(() => {
    return (
      importedEpubBooks.find((b) => b.id === bookId) || {
        id: 'odisea-homero',
        title: 'La Odisea',
        author: 'Homero',
        fileSizeText: '563 KB',
        status: 'ready',
        progressPercent: 42,
        totalChapters: 24,
        currentChapterIndex: 0,
        isBookmarked: true,
        sourceType: 'bundle',
      }
    );
  }, [importedEpubBooks, bookId]);

  // Saved chapter index: restores where reader left off!
  const initialChapterIndex = useMemo(() => {
    if (params.chapter !== undefined) {
      const parsed = parseInt(params.chapter, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    if (typeof bookMeta.currentChapterIndex === 'number' && bookMeta.currentChapterIndex >= 0) {
      return bookMeta.currentChapterIndex;
    }
    return 0;
  }, [params.chapter, bookMeta.currentChapterIndex]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const scrollViewRef = useRef<any>(null);

  // Sync reading progress whenever chapter changes
  useEffect(() => {
    updateEpubChapter(bookId, currentChapterIndex);
  }, [bookId, currentChapterIndex, updateEpubChapter]);

  // Selection & Action Bar States
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Consultation States
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiKeyModalVisible, setAiKeyModalVisible] = useState(false);
  const [aiKeyInput, setAiKeyInput] = useState('');

  // Chapter AI Quiz Generation State
  const [isGeneratingChapterQuiz, setIsGeneratingChapterQuiz] = useState(false);

  // Bookmarks Modal State
  const [bookmarksModalVisible, setBookmarksModalVisible] = useState(false);

  // Dynamic Glossary States (Local or API IA)
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);
  const [glossaryDefinition, setGlossaryDefinition] = useState<string | null>(null);
  const [isGlossaryLoading, setIsGlossaryLoading] = useState(false);

  // Active theme palette
  const activePalette = THEME_PALETTES[epubSettings.theme] || THEME_PALETTES.paper;

  // Book-specific bookmarks
  const bookBookmarks = useMemo(() => {
    return epubBookmarks.filter((bm) => bm.bookId === bookId);
  }, [epubBookmarks, bookId]);

  // Retrieve chapters
  const bookChapters = useMemo(() => {
    if (bookId === 'odisea-homero') {
      return ODISEA_EPUB_DATA.cantos;
    }
    const custom = getCustomEpubData(bookId);
    if (custom && custom.chapters.length > 0) {
      return custom.chapters.map((ch, idx) => ({
        id: `custom-ch-${idx + 1}`,
        title: ch.title || `Capítulo ${idx + 1}`,
        subtitle: `Sección ${idx + 1} • Tomo Digital`,
        paragraphs: ch.paragraphs,
      }));
    }
    if (bookId === 'cumbres-borrascosas') {
      return [
        {
          id: 'cb-1',
          title: 'Capítulo I: La llegada a Cumbres Borrascosas',
          subtitle: 'Literatura Victoriana • Yorkshire, 1801',
          paragraphs: [
            '1801. Acabo de regresar de una visita a mi casero, el solitario vecino con el que tendré que entendérmelas. Sin duda alguna, este es un país hermoso. En toda Inglaterra no creo que hubiera podido hallar una comarca tan enteramente apartada del bullicio del mundo.',
            'Un perfecto paraíso para misántropos; y el señor Heathcliff y yo constituimos una pareja sumamente idónea para compartir el paraje. Es un hombre extraordinario. No sospechaba la viva simpatía que sentí hacia él cuando vi sus negros ojos retraerse con desconfianza bajo sus cejas al aproximarme a caballo.',
            'Cumbres Borrascosas es el nombre de la residencia del señor Heathcliff; «borrascosas» es un expresivo adjetivo del dialecto provincial que describe la conmoción atmosférica a que se halla expuesta la cumbre en tiempo tempestuoso.',
          ],
        },
      ];
    }
    if (bookId === 'la-metamorfosis') {
      return [
        {
          id: 'km-1',
          title: 'Capítulo I: La transformación matutina',
          subtitle: 'Expresionismo • Praga, 1915',
          paragraphs: [
            'Una mañana, al despertar de un sueño intranquilo, Gregor Samsa se encontró sobre su cama transformado en un monstruoso insecto. Estaba tumbado sobre su duro caparazón y, al levantar un poco la cabeza, vio su vientre abombado, pardo, dividido por partes duras en forma de arco.',
            'La colcha, a punto de resbalar al suelo, apenas se sostenía sobre la cúspide. Sus innumerables patas, lamentablemente delgadas en comparación con el grosor de su cuerpo, se agitaban desamparadas ante sus ojos.',
            '«¿Qué me ha ocurrido?», pensó. No era un sueño. Su habitación, una auténtica habitación humana, aunque algo pequeña, permanecía tranquila entre las cuatro paredes bien conocidas.',
          ],
        },
      ];
    }
    return ODISEA_EPUB_DATA.cantos;
  }, [bookId, getCustomEpubData]);

  const currentChapter = bookChapters[currentChapterIndex] || bookChapters[0];
  const totalChapters = bookChapters.length;
  const progressPercent = Math.min(
    100,
    Math.round(((currentChapterIndex + 1) / totalChapters) * 100)
  );

  // Handler to generate an AI quiz for this chapter or selected snippet
  const handleStartChapterQuiz = async (passageSnippet?: string) => {
    setIsGeneratingChapterQuiz(true);
    setSelectionMenuVisible(false);
    try {
      const currentChapterTitle = bookChapters[currentChapterIndex]?.title || `Capítulo ${currentChapterIndex + 1}`;
      const topic = passageSnippet
        ? `${currentChapterTitle} («${passageSnippet.slice(0, 75)}...»)`
        : currentChapterTitle;
      const quiz = await generateQuizWithAI(bookMeta.title, bookMeta.author, topic);
      setIsGeneratingChapterQuiz(false);
      router.push(`/quiz/${quiz.id}` as any);
    } catch {
      setIsGeneratingChapterQuiz(false);
      setToastMessage('No se pudo generar el cuestionario con IA.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleToggleSettings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleEpubSettings();
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      updateEpubChapter(bookId, nextIdx);
      // Ensure page scrolls immediately to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      updateEpubChapter(bookId, prevIdx);
      // Ensure page scrolls immediately to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleExitReader = () => {
    updateEpubChapter(bookId, currentChapterIndex);
    router.back();
  };

  const handleSelectParagraph = (text: string) => {
    setSelectedSnippet(text.trim());
    setSelectionMenuVisible(true);
  };

  const handleSaveHighlight = (text: string) => {
    addEpubBookmark({
      bookId,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChapter.title,
      text: text.trim(),
      color: '#E0D0B8',
    });
    setToastMessage('Marcador guardado en tus notas');
    setTimeout(() => setToastMessage(null), 2500);
    setSelectionMenuVisible(false);
  };

  const handleOpenGlossaryForText = async (rawText: string) => {
    const cleanTerm = rawText
      .trim()
      .replace(/^«+|»+|"+|'+|\[\d+\]|[.,;:?!]/g, '')
      .trim()
      .slice(0, 50);
    const termToQuery = cleanTerm || rawText.slice(0, 40);
    setSelectedGlossaryTerm(termToQuery);
    setSelectionMenuVisible(false);
    setIsGlossaryLoading(true);
    setGlossaryDefinition(null);
    setGlossaryModalVisible(true);

    if (aiApiKey && aiApiKey.trim().length > 10) {
      try {
        if (aiProvider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${aiApiKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres el lexicógrafo y crítico literario de Rospiere Editions. Define el término en el contexto literario con etimología (si aplica), significado y matiz poético en un solo párrafo conciso y erudito.',
                },
                {
                  role: 'user',
                  content: `Obra: "${bookMeta.title}". Define el término literario: «${termToQuery}».`,
                },
              ],
              max_tokens: 220,
            }),
          });
          const json = await res.json();
          if (json.choices && json.choices[0]?.message?.content) {
            setGlossaryDefinition(json.choices[0].message.content);
            setIsGlossaryLoading(false);
            return;
          }
        } else {
          // Gemini
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiApiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Como lexicógrafo de Rospiere Editions, define brevemente el término «${termToQuery}» en el contexto de "${bookMeta.title}". Incluye etimología relevante y su sentido literario en un párrafo elegante y conciso.`,
                      },
                    ],
                  },
                ],
              }),
            }
          );
          const json = await res.json();
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            setGlossaryDefinition(json.candidates[0].content.parts[0].text);
            setIsGlossaryLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local
      }
    }

    // Local Rospiere Literary Glossary Agent
    setTimeout(() => {
      const lower = termToQuery.toLowerCase();
      let def = '';
      if (lower.includes('musa')) {
        def = 'Musa (del gr. Μοῦσα): En la poesía clásica, deidad inspiradora de las artes y la memoria. En la épica homérica, la invocación inicial otorga legitimidad numinosa al canto del aedo.';
      } else if (lower.includes('polítropos') || lower.includes('polytropos') || lower.includes('ingenio')) {
        def = 'Polýtropos (πολύτροπος): Epíteto homérico de Odiseo: «de multiforme ingenio», «de muchos giros». Expresa tanto la pluralidad de caminos en su errancia como la agudeza moral y astucia («mêtis») para sortear la adversidad.';
      } else if (lower.includes('nóstos') || lower.includes('nostos') || lower.includes('retorno')) {
        def = 'Nóstos (νόστος): El viaje heroico de regreso al hogar patrio. Da origen al término «nostalgia» (el dolor por el anhelo del retorno) y constituye el eje de redención épica.';
      } else if (lower.includes('xenía') || lower.includes('hospitalidad')) {
        def = 'Xenía (ξενία): Ley sagrada de hospitalidad ritual entre huéspedes y anfitriones, amparada por Zeus Xenios. Su cumplimiento o vulneración determina el destino moral de los pueblos en la épica clásica.';
      } else if (lower.includes('macondo')) {
        def = 'Macondo: Territorio mítico fundado por José Arcadio Buendía. Más que un poblado físico, encarna la metáfora de la historia colombiana y latinoamericana donde conviven la magia, el aislamiento y la fatalidad cíclica.';
      } else if (lower.includes('soledad')) {
        def = 'Soledad: En la poética de García Márquez, condición ontológica de incomunicación afectiva que condena a los Buendía a repetir los mismos extravíos hasta su extinción definitiva.';
      } else if (lower.includes('borrascosas') || lower.includes('cumbres')) {
        def = 'Borrascosas (wuthering): Vocablo dialectal de Yorkshire que describe la conmoción atmosférica y ventiscas que azotan los páramos. Refleja las pasiones tempestuosas e indómitas de Heathcliff.';
      } else if (lower.includes('metamorfosis') || lower.includes('samsa')) {
        def = 'Metamorfosis: Transmutación física que exterioriza la alienación laboral y familiar de Gregor Samsa, convirtiendo su deshumanización social en una grotesca condición biológica.';
      } else {
        def = `Definición del Glosario Rospiere: «${termToQuery}». En el contexto de «${bookMeta.title}», este término o pasaje posee un rol estético y semántico destacado, enriqueciendo la tonalidad expresiva y el horizonte simbólico de la obra.`;
      }
      setGlossaryDefinition(def);
      setIsGlossaryLoading(false);
    }, 500);
  };

  const handleConsultAI = async (textToConsult: string) => {
    setSelectionMenuVisible(false);
    setIsAiLoading(true);
    setAiResponse(null);
    setAiModalVisible(true);

    if (aiApiKey && aiApiKey.trim().length > 10) {
      try {
        if (aiProvider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${aiApiKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'Eres el Asistente Socrático de Rospiere Editions. Analiza el pasaje con elegancia, profundidad simbólica y erudición literaria.',
                },
                {
                  role: 'user',
                  content: `Obra: ${bookMeta.title}. Pasaje: «${textToConsult}». Analiza el simbolismo, significado y resonancia en el contexto de la obra.`,
                },
              ],
              max_tokens: 350,
            }),
          });
          const json = await res.json();
          if (json.choices && json.choices[0]?.message?.content) {
            setAiResponse(json.choices[0].message.content);
            setIsAiLoading(false);
            return;
          }
        } else {
          // Gemini API call
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiApiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Como crítico literario de Rospiere Editions, analiza este pasaje de "${bookMeta.title}":\n«${textToConsult}»\nExplica brevemente su simbolismo, metáfora y función en la narrativa en tono editorial erudito.`,
                      },
                    ],
                  },
                ],
              }),
            }
          );
          const json = await res.json();
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            setAiResponse(json.candidates[0].content.parts[0].text);
            setIsAiLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to built-in agent if network or API error
      }
    }

    // Built-in Rospiere Socratic Agent (Local / Erudite analysis)
    setTimeout(() => {
      const lower = textToConsult.toLowerCase();
      let analysis = '';

      if (
        lower.includes('musa') ||
        lower.includes('odiseo') ||
        lower.includes('troya') ||
        lower.includes('telémaco') ||
        lower.includes('poseidón') ||
        lower.includes('polifemo')
      ) {
        analysis = `En la poética épica homérica, este pasaje articula la dualidad entre la «metis» (astucia adaptable) y la «moira» (destino inexorable). Odiseo encarna la inteligencia paciente frente a la fuerza destructiva; la invocación o conflicto subyacente sella la prueba moral del héroe antes de alcanzar su nóstos (retorno).`;
      } else if (
        lower.includes('soledad') ||
        lower.includes('buendía') ||
        lower.includes('macondo') ||
        lower.includes('hielo')
      ) {
        analysis = `Este fragmento sintetiza la dimensión circular del tiempo en Macondo. La soledad opera como estigma ontológico de la estirpe Buendía: cada generación replica los espejismos de la anterior, incapaz de franquear el aislamiento afectivo antes del vendaval final.`;
      } else if (lower.includes('sol') || lower.includes('klara') || lower.includes('josie')) {
        analysis = `Ishiguro utiliza la luz solar como metáfora de la gracia providencial. En un orden hipertecnificado y mercantil, la mirada de un Amigo Artificial dota a la energía fotoeléctrica de una dimensión mística de compasión y sacrificio por la vida ajena.`;
      } else {
        analysis = `Análisis crítico Rospiere: El pasaje despliega una tensión deliberada entre la voz del narrador y el ambiente sensible del texto. Las elecciones léxicas enfatizan la resonancia interna de los personajes y anticipan el dilema moral que vertebra este capítulo.`;
      }

      setAiResponse(analysis);
      setIsAiLoading(false);
    }, 600);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Leyendo «${bookMeta.title}» (${currentChapter.title}) en Rospiere Editions.`,
      });
    } catch {
      // Ignored
    }
  };

  // Font family resolution
  const resolvedFontFamily = useMemo(() => {
    switch (epubSettings.fontFamily) {
      case 'baskerville':
      case 'garamond':
      case 'noto-serif':
        return RospiereFonts.headline;
      case 'inter':
      default:
        return RospiereFonts.body;
    }
  }, [epubSettings.fontFamily]);

  // Line height resolution
  const resolvedLineHeight = useMemo(() => {
    switch (epubSettings.leading) {
      case 'compact':
        return Math.round(epubSettings.fontSize * 1.5);
      case 'generous':
        return Math.round(epubSettings.fontSize * 2.2);
      case 'editorial':
      default:
        return Math.round(epubSettings.fontSize * 1.85);
    }
  }, [epubSettings.fontSize, epubSettings.leading]);

  // Margin horizontal resolution
  const resolvedMarginH = useMemo(() => {
    switch (epubSettings.margin) {
      case 'tight':
        return 16;
      case 'wide':
        return 34;
      case 'standard':
      default:
        return 24;
    }
  }, [epubSettings.margin]);

  // Footnote and Drop Cap helpers
  const renderInlineWithFootnotes = (text: string, baseStyle: any, footnoteStyle: any) => {
    if (!text) return null;
    const regex = /(\[\d+\]|\[[a-zA-Z]\])/g;
    const segments = text.split(regex);

    return segments.map((seg, idx) => {
      if (/^\[(\d+|[a-zA-Z])\]$/.test(seg)) {
        return (
          <Text key={`fn-${idx}`} style={footnoteStyle}>
            {seg}
          </Text>
        );
      }
      return (
        <Text key={`txt-${idx}`} style={baseStyle}>
          {seg}
        </Text>
      );
    });
  };

  const parseDropCapParagraph = (text: string) => {
    if (!text) return { prefix: '', dropCapLetter: '', rest: '' };
    // Find the first actual alphabetic character (skipping [1], quotes, etc.)
    const match = text.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/);
    if (!match || match.index === undefined) {
      return { prefix: '', dropCapLetter: '', rest: text };
    }
    const letterIdx = match.index;
    const prefix = text.slice(0, letterIdx);
    const dropCapLetter = text.charAt(letterIdx).toUpperCase();
    const rest = text.slice(letterIdx + 1);
    return { prefix, dropCapLetter, rest };
  };

  const isNotableQuotation = (text: string) => {
    if (!text) return false;
    const trimmed = text.trim();
    const startsEndsGuillemet = trimmed.startsWith('«') && trimmed.endsWith('»');
    const startsEndsDblQuote = trimmed.startsWith('"') && trimmed.endsWith('"');
    if ((startsEndsGuillemet || startsEndsDblQuote) && trimmed.length >= 35) {
      return true;
    }
    const matchGuillemet = trimmed.match(/«([^»]{40,})»/);
    if (matchGuillemet) return true;
    return false;
  };

  const firstParagraph = currentChapter.paragraphs[0] || '';

  return (
    <View style={[styles.screen, { backgroundColor: activePalette.bg }]}>
      {/* Fixed Top Header (Hidden or faded in Zen Mode) */}
      {!epubSettings.zenMode && (
        <View
          style={[
            styles.headerContainer,
            {
              backgroundColor: activePalette.headerBg,
              paddingTop: Math.max(insets.top, 10),
              borderBottomColor: activePalette.border,
            },
          ]}>
          <View style={styles.headerInner}>
            <Pressable
              onPress={handleExitReader}
              style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityLabel="Volver a la biblioteca">
              <MaterialIcons name="close" size={20} color={activePalette.accent} />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text
                style={[styles.headerBookTitle, { color: activePalette.accent }]}
                numberOfLines={1}>
                {bookMeta.title}
              </Text>
              <Text
                style={[styles.headerChapterTitle, { color: activePalette.secondaryText }]}
                numberOfLines={1}>
                Canto {currentChapterIndex + 1} de {totalChapters}
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <Pressable
                onPress={() => setBookmarksModalVisible(true)}
                style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
                hitSlop={8}
                accessibilityLabel="Marcadores y citas guardadas">
                <MaterialIcons name="bookmarks" size={18} color={activePalette.secondaryText} />
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
                hitSlop={8}
                accessibilityLabel="Compartir lectura">
                <MaterialIcons name="share" size={18} color={activePalette.secondaryText} />
              </Pressable>

              <Pressable
                onPress={handleToggleSettings}
                style={({ pressed }) => [
                  styles.headerIconButton,
                  epubSettings.isSettingsOpen && styles.headerIconActive,
                  pressed && styles.pressed,
                ]}
                hitSlop={8}
                accessibilityLabel="Ajustes de lectura">
                <MaterialIcons
                  name="format-size"
                  size={20}
                  color={epubSettings.isSettingsOpen ? '#000000' : activePalette.accent}
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Main Scroll Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: epubSettings.zenMode ? Math.max(insets.top, 20) : 60,
            paddingBottom: epubSettings.zenMode ? 40 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Subtle Reading Meta Banner */}
        <View
          style={[
            styles.metaBanner,
            {
              backgroundColor: activePalette.cardBg,
              borderBottomColor: activePalette.border,
            },
          ]}>
          <View style={styles.metaBannerLeft}>
            <View style={[styles.metaSquare, { backgroundColor: activePalette.accent }]} />
            <Text
              style={[styles.metaBookTitle, { color: activePalette.accent }]}
              numberOfLines={1}>
              {bookMeta.title}
            </Text>
            <Text style={[styles.metaSlash, { color: activePalette.secondaryText }]}>/</Text>
            <Text
              style={[styles.metaAuthor, { color: activePalette.secondaryText }]}
              numberOfLines={1}>
              {bookMeta.author}
            </Text>
          </View>

          <View style={styles.metaBannerRight}>
            <Text style={[styles.metaProgressText, { color: activePalette.accent }]}>
              {progressPercent}% leído
            </Text>
            <Pressable
              onPress={() => toggleEpubBookmark(bookId)}
              hitSlop={8}
              accessibilityLabel="Marcador">
              <MaterialIcons
                name={bookMeta.isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={18}
                color={activePalette.accent}
              />
            </Pressable>
          </View>
        </View>

        {/* Quick Floating Bar with Toggle Button */}
        <View style={styles.quickBar}>
          <View style={styles.quickBarTextWrap}>
            <Text
              style={[styles.quickBarSub, { color: activePalette.secondaryText }]}>
              LECTOR SUBLIME • ROSPIERE
            </Text>
            <Text
              style={[styles.quickBarTitle, { color: activePalette.accent }]}
              numberOfLines={1}>
              {currentChapter.title}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.toggleSettingsButton,
              epubSettings.isSettingsOpen && styles.toggleSettingsButtonActive,
              pressed && styles.pressed,
            ]}
            onPress={handleToggleSettings}>
            <MaterialIcons
              name="tune"
              size={15}
              color={epubSettings.isSettingsOpen ? '#FFFFFF' : '#FFFFFF'}
            />
            <Text style={styles.toggleSettingsButtonText}>
              {epubSettings.isSettingsOpen ? 'CERRAR AJUSTES' : 'AJUSTES & TIPO'}
            </Text>
          </Pressable>
        </View>

        {/* ======================================================== */}
        {/* COLLAPSIBLE SETTINGS & TYPOGRAPHY PANEL                  */}
        {/* ======================================================== */}
        {epubSettings.isSettingsOpen && (
          <View
            style={[
              styles.settingsPanel,
              {
                backgroundColor: activePalette.cardBg,
                borderColor: activePalette.border,
              },
            ]}>
            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text
                  style={[styles.panelSubtitle, { color: activePalette.secondaryText }]}>
                  LUMIERE TYPOGRAPHY ENGINE
                </Text>
                <Text style={[styles.panelTitle, { color: activePalette.accent }]}>
                  Preferencia Editorial
                </Text>
              </View>

              <Pressable
                onPress={handleToggleSettings}
                style={styles.closePanelButton}
                hitSlop={10}
                accessibilityLabel="Cerrar ajustes">
                <MaterialIcons name="close" size={18} color={activePalette.accent} />
              </Pressable>
            </View>

            {/* 1. Tipografías Principales */}
            <View style={styles.settingBlock}>
              <View style={styles.settingBlockHeader}>
                <Text
                  style={[styles.settingLabel, { color: activePalette.secondaryText }]}>
                  TIPOGRAFÍA PRINCIPAL
                </Text>
                <Text
                  style={[styles.settingHint, { color: activePalette.secondaryText }]}>
                  Renderizado Suave
                </Text>
              </View>

              <View style={styles.fontsGrid}>
                {/* Noto Serif */}
                <Pressable
                  style={[
                    styles.fontOptionCard,
                    {
                      backgroundColor:
                        epubSettings.fontFamily === 'noto-serif'
                          ? activePalette.accent
                          : activePalette.bg,
                    },
                  ]}
                  onPress={() => setEpubFontFamily('noto-serif')}>
                  <Text
                    style={[
                      styles.fontOptionName,
                      {
                        fontFamily: RospiereFonts.headline,
                        color:
                          epubSettings.fontFamily === 'noto-serif'
                            ? activePalette.bg
                            : activePalette.accent,
                      },
                    ]}>
                    Noto Serif
                  </Text>
                  <Text
                    style={[
                      styles.fontOptionBadge,
                      {
                        color:
                          epubSettings.fontFamily === 'noto-serif'
                            ? activePalette.bg
                            : activePalette.secondaryText,
                      },
                    ]}>
                    EDITORIAL PURISTA
                  </Text>
                </Pressable>

                {/* Baskerville */}
                <Pressable
                  style={[
                    styles.fontOptionCard,
                    {
                      backgroundColor:
                        epubSettings.fontFamily === 'baskerville'
                          ? activePalette.accent
                          : activePalette.bg,
                    },
                  ]}
                  onPress={() => setEpubFontFamily('baskerville')}>
                  <Text
                    style={[
                      styles.fontOptionName,
                      styles.italicText,
                      {
                        fontFamily: RospiereFonts.headline,
                        color:
                          epubSettings.fontFamily === 'baskerville'
                            ? activePalette.bg
                            : activePalette.accent,
                      },
                    ]}>
                    Baskerville
                  </Text>
                  <Text
                    style={[
                      styles.fontOptionBadge,
                      {
                        color:
                          epubSettings.fontFamily === 'baskerville'
                            ? activePalette.bg
                            : activePalette.secondaryText,
                      },
                    ]}>
                    CORTE CLÁSICO
                  </Text>
                </Pressable>

                {/* Garamond */}
                <Pressable
                  style={[
                    styles.fontOptionCard,
                    {
                      backgroundColor:
                        epubSettings.fontFamily === 'garamond'
                          ? activePalette.accent
                          : activePalette.bg,
                    },
                  ]}
                  onPress={() => setEpubFontFamily('garamond')}>
                  <Text
                    style={[
                      styles.fontOptionName,
                      {
                        fontFamily: RospiereFonts.headline,
                        letterSpacing: 1,
                        color:
                          epubSettings.fontFamily === 'garamond'
                            ? activePalette.bg
                            : activePalette.accent,
                      },
                    ]}>
                    Garamond
                  </Text>
                  <Text
                    style={[
                      styles.fontOptionBadge,
                      {
                        color:
                          epubSettings.fontFamily === 'garamond'
                            ? activePalette.bg
                            : activePalette.secondaryText,
                      },
                    ]}>
                    POESÍA & RITMO
                  </Text>
                </Pressable>

                {/* Inter Sans */}
                <Pressable
                  style={[
                    styles.fontOptionCard,
                    {
                      backgroundColor:
                        epubSettings.fontFamily === 'inter'
                          ? activePalette.accent
                          : activePalette.bg,
                    },
                  ]}
                  onPress={() => setEpubFontFamily('inter')}>
                  <Text
                    style={[
                      styles.fontOptionName,
                      {
                        fontFamily: RospiereFonts.body,
                        color:
                          epubSettings.fontFamily === 'inter'
                            ? activePalette.bg
                            : activePalette.accent,
                      },
                    ]}>
                    Inter Sans
                  </Text>
                  <Text
                    style={[
                      styles.fontOptionBadge,
                      {
                        color:
                          epubSettings.fontFamily === 'inter'
                            ? activePalette.bg
                            : activePalette.secondaryText,
                      },
                    ]}>
                    MODERNIDAD
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 2. Tamaño de Fuente & Interlineado */}
            <View style={styles.settingBlock}>
              <View style={styles.dualControlsRow}>
                {/* Tamaño */}
                <View style={styles.dualColumn}>
                  <View style={styles.settingBlockHeader}>
                    <Text
                      style={[styles.settingLabel, { color: activePalette.secondaryText }]}>
                      ESCALA
                    </Text>
                    <Text
                      style={[styles.sizeValueTag, { color: activePalette.accent }]}>
                      {epubSettings.fontSize} pt
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.buttonGroup,
                      { backgroundColor: activePalette.bg },
                    ]}>
                    {[16, 18, 20, 22].map((sz) => {
                      const isSelected = epubSettings.fontSize === sz;
                      return (
                        <Pressable
                          key={sz}
                          style={[
                            styles.sizePill,
                            isSelected && {
                              backgroundColor: activePalette.accent,
                            },
                          ]}
                          onPress={() => setEpubFontSize(sz)}>
                          <Text
                            style={[
                              styles.sizePillText,
                              {
                                color: isSelected
                                  ? activePalette.bg
                                  : activePalette.secondaryText,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}>
                            {sz}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Interlineado */}
                <View style={styles.dualColumn}>
                  <View style={styles.settingBlockHeader}>
                    <Text
                      style={[styles.settingLabel, { color: activePalette.secondaryText }]}>
                      INTERLINEADO
                    </Text>
                    <Text
                      style={[styles.sizeValueTag, { color: activePalette.accent }]}>
                      {epubSettings.leading === 'compact'
                        ? '1.5'
                        : epubSettings.leading === 'generous'
                        ? '2.2'
                        : '1.85'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.buttonGroup,
                      { backgroundColor: activePalette.bg },
                    ]}>
                    {(['compact', 'editorial', 'generous'] as EpubLeading[]).map((ld) => {
                      const isSelected = epubSettings.leading === ld;
                      return (
                        <Pressable
                          key={ld}
                          style={[
                            styles.leadingPill,
                            isSelected && {
                              backgroundColor: activePalette.accent,
                            },
                          ]}
                          onPress={() => setEpubLeading(ld)}>
                          <Text
                            style={[
                              styles.leadingPillText,
                              {
                                color: isSelected
                                  ? activePalette.bg
                                  : activePalette.secondaryText,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}>
                            {ld === 'compact'
                              ? 'Min'
                              : ld === 'editorial'
                              ? 'Edit'
                              : 'Gen'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Tono del Sustrato / Fondos Monocromáticos */}
            <View style={styles.settingBlock}>
              <Text style={[styles.settingLabel, { color: activePalette.secondaryText }]}>
                TONO DEL SUSTRATO (PAPEL & ILUMINACIÓN)
              </Text>
              <View style={styles.themesRow}>
                {/* Paper */}
                <Pressable
                  style={[
                    styles.themeCard,
                    { backgroundColor: '#FAF8F5' },
                    epubSettings.theme === 'paper' && styles.themeCardActive,
                  ]}
                  onPress={() => setEpubTheme('paper')}>
                  <View style={[styles.themeCircle, { backgroundColor: '#1A1A1A' }]} />
                  <Text style={[styles.themeLabel, { color: '#1A1A1A' }]}>Natural</Text>
                </Pressable>

                {/* Sepia */}
                <Pressable
                  style={[
                    styles.themeCard,
                    { backgroundColor: '#F4ECD8' },
                    epubSettings.theme === 'sepia' && styles.themeCardActive,
                  ]}
                  onPress={() => setEpubTheme('sepia')}>
                  <View style={[styles.themeCircle, { backgroundColor: '#3D332A' }]} />
                  <Text style={[styles.themeLabel, { color: '#3D332A' }]}>Sepia</Text>
                </Pressable>

                {/* Night */}
                <Pressable
                  style={[
                    styles.themeCard,
                    { backgroundColor: '#1E1E1E' },
                    epubSettings.theme === 'night' && styles.themeCardActive,
                  ]}
                  onPress={() => setEpubTheme('night')}>
                  <View style={[styles.themeCircle, { backgroundColor: '#E5E0D8' }]} />
                  <Text style={[styles.themeLabel, { color: '#E5E0D8' }]}>Noche</Text>
                </Pressable>

                {/* OLED */}
                <Pressable
                  style={[
                    styles.themeCard,
                    { backgroundColor: '#000000' },
                    epubSettings.theme === 'oled' && styles.themeCardActive,
                  ]}
                  onPress={() => setEpubTheme('oled')}>
                  <View style={[styles.themeCircle, { backgroundColor: '#A8A8A8' }]} />
                  <Text style={[styles.themeLabel, { color: '#D4D4D4' }]}>OLED</Text>
                </Pressable>
              </View>
            </View>

            {/* 4. Disposición y Márgenes */}
            <View style={styles.settingBlock}>
              <View style={styles.dualControlsRow}>
                {/* Alineación */}
                <View style={styles.dualColumn}>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: activePalette.secondaryText, marginBottom: 8 },
                    ]}>
                    ALINEACIÓN
                  </Text>
                  <View
                    style={[
                      styles.buttonGroup,
                      { backgroundColor: activePalette.bg },
                    ]}>
                    <Pressable
                      style={[
                        styles.alignButton,
                        epubSettings.align === 'left' && {
                          backgroundColor: activePalette.accent,
                        },
                      ]}
                      onPress={() => setEpubAlign('left')}>
                      <MaterialIcons
                        name="format-align-left"
                        size={16}
                        color={
                          epubSettings.align === 'left'
                            ? activePalette.bg
                            : activePalette.secondaryText
                        }
                      />
                    </Pressable>
                    <Pressable
                      style={[
                        styles.alignButton,
                        epubSettings.align === 'justify' && {
                          backgroundColor: activePalette.accent,
                        },
                      ]}
                      onPress={() => setEpubAlign('justify')}>
                      <MaterialIcons
                        name="format-align-justify"
                        size={16}
                        color={
                          epubSettings.align === 'justify'
                            ? activePalette.bg
                            : activePalette.secondaryText
                        }
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Márgenes */}
                <View style={styles.dualColumn}>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: activePalette.secondaryText, marginBottom: 8 },
                    ]}>
                    MÁRGENES
                  </Text>
                  <View
                    style={[
                      styles.buttonGroup,
                      { backgroundColor: activePalette.bg },
                    ]}>
                    {(['tight', 'standard', 'wide'] as EpubMargin[]).map((mg) => {
                      const isSelected = epubSettings.margin === mg;
                      return (
                        <Pressable
                          key={mg}
                          style={[
                            styles.marginPill,
                            isSelected && {
                              backgroundColor: activePalette.accent,
                            },
                          ]}
                          onPress={() => setEpubMargin(mg)}>
                          <Text
                            style={[
                              styles.marginPillText,
                              {
                                color: isSelected
                                  ? activePalette.bg
                                  : activePalette.secondaryText,
                                fontWeight: isSelected ? '700' : '400',
                              },
                            ]}>
                            {mg === 'tight' ? 'Min' : mg === 'standard' ? 'Std' : 'Zen'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* 5. Interruptores Asistente Lumiere y Enfoque Zen */}
            <View style={styles.togglesSection}>
              {/* Notas Asistente */}
              <Pressable
                style={styles.toggleRow}
                onPress={toggleEpubAssistantNotes}>
                <View style={styles.toggleTextWrap}>
                  <Text style={[styles.toggleTitle, { color: activePalette.accent }]}>
                    Glosas del Asistente Lumiere
                  </Text>
                  <Text
                    style={[styles.toggleDesc, { color: activePalette.secondaryText }]}>
                    Notas marginales automáticas y contexto temático
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: activePalette.accent,
                      backgroundColor: epubSettings.showAssistantNotes
                        ? activePalette.accent
                        : 'transparent',
                    },
                  ]}>
                  {epubSettings.showAssistantNotes && (
                    <MaterialIcons name="check" size={13} color={activePalette.bg} />
                  )}
                </View>
              </Pressable>

              {/* Modo Concentración Pura */}
              <Pressable style={styles.toggleRow} onPress={toggleEpubZenMode}>
                <View style={styles.toggleTextWrap}>
                  <Text style={[styles.toggleTitle, { color: activePalette.accent }]}>
                    Modo Concentración Pura
                  </Text>
                  <Text
                    style={[styles.toggleDesc, { color: activePalette.secondaryText }]}>
                    Oculta controles y barras para una inmersión completa
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: activePalette.accent,
                      backgroundColor: epubSettings.zenMode
                        ? activePalette.accent
                        : 'transparent',
                    },
                  ]}>
                  {epubSettings.zenMode && (
                    <MaterialIcons name="check" size={13} color={activePalette.bg} />
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* ÁREA PRINCIPAL DE LECTURA EDITORIAL (CANVAS)             */}
        {/* ======================================================== */}
        <View
          style={[
            styles.readerCanvas,
            {
              paddingHorizontal: resolvedMarginH,
            },
          ]}>
          {/* Encabezado del Canto / Capítulo */}
          <View style={styles.canvasHeader}>
            <Text
              style={[
                styles.cantoLabel,
                { color: activePalette.secondaryText },
              ]}>
              {currentChapter.subtitle || `PARTE I • ROSPIERE EDITION`}
            </Text>
            <Text
              style={[
                styles.cantoTitle,
                {
                  fontFamily: RospiereFonts.headline,
                  color: activePalette.accent,
                },
              ]}>
              {currentChapter.title}
            </Text>
            <View
              style={[
                styles.titleDivider,
                { backgroundColor: activePalette.accent },
              ]}
            />
          </View>

          {/* Primer Párrafo con Letra Capital (Drop Cap) */}
          {firstParagraph.length > 0 && (() => {
            const { prefix, dropCapLetter, rest } = parseDropCapParagraph(firstParagraph);
            const footnoteStyle = {
              fontSize: Math.max(10, Math.round(epubSettings.fontSize * 0.58)),
              lineHeight: Math.max(12, Math.round(epubSettings.fontSize * 0.7)),
              fontWeight: '700' as const,
              color: activePalette.secondaryText,
            };
            const baseTextStyle = {
              fontFamily: resolvedFontFamily,
              fontSize: epubSettings.fontSize,
              lineHeight: resolvedLineHeight,
              color: activePalette.text,
            };

            if (!dropCapLetter) {
              return (
                <Pressable
                  onPress={() => handleSelectParagraph(firstParagraph)}
                  style={styles.paragraphPressable}>
                  <Text
                    style={[
                      styles.paragraphText,
                      baseTextStyle,
                      { textAlign: epubSettings.align, marginBottom: 16 },
                    ]}>
                    {renderInlineWithFootnotes(firstParagraph, baseTextStyle, footnoteStyle)}
                  </Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                onPress={() => handleSelectParagraph(firstParagraph)}
                style={styles.paragraphPressable}>
                <View style={styles.dropCapContainer}>
                  {prefix.trim().length > 0 && (
                    <View style={styles.dropCapPrefixRow}>
                      {renderInlineWithFootnotes(prefix, baseTextStyle, footnoteStyle)}
                    </View>
                  )}
                  <View style={styles.dropCapRow}>
                    <View
                      style={[
                        styles.dropCapBox,
                        {
                          backgroundColor: activePalette.cardBg,
                          borderColor: activePalette.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.dropCapText,
                          {
                            fontFamily: RospiereFonts.headline,
                            color: activePalette.accent,
                          },
                        ]}>
                        {dropCapLetter}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.paragraphText,
                        baseTextStyle,
                        {
                          textAlign: epubSettings.align,
                          flex: 1,
                        },
                      ]}>
                      {renderInlineWithFootnotes(rest, baseTextStyle, footnoteStyle)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })()}

          {/* Resto de párrafos del Canto / Tomo */}
          {currentChapter.paragraphs.slice(1).map((p, pIdx) => {
            const isQuote = isNotableQuotation(p);
            const footnoteStyle = {
              fontSize: Math.max(10, Math.round(epubSettings.fontSize * 0.58)),
              lineHeight: Math.max(12, Math.round(epubSettings.fontSize * 0.7)),
              fontWeight: '700' as const,
              color: activePalette.secondaryText,
            };
            const baseTextStyle = {
              fontFamily: resolvedFontFamily,
              fontSize: epubSettings.fontSize,
              lineHeight: resolvedLineHeight,
              color: activePalette.text,
            };

            if (isQuote) {
              return (
                <Pressable
                  key={`quote-${pIdx}`}
                  onPress={() => handleSelectParagraph(p)}
                  style={styles.paragraphPressable}>
                  <View
                    style={[
                      styles.pullQuoteCard,
                      {
                        backgroundColor: activePalette.cardBg,
                        borderColor: activePalette.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pullQuoteText,
                        {
                          fontFamily: RospiereFonts.headline,
                          color: activePalette.accent,
                        },
                      ]}>
                      {p}
                    </Text>
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={`p-${pIdx}`}
                onPress={() => handleSelectParagraph(p)}
                style={styles.paragraphPressable}>
                <Text
                  style={[
                    styles.paragraphText,
                    baseTextStyle,
                    {
                      textAlign: epubSettings.align,
                      marginBottom: 16,
                    },
                  ]}>
                  {renderInlineWithFootnotes(p, baseTextStyle, footnoteStyle)}
                </Text>
              </Pressable>
            );
          })}

          {/* Botones editoriales de navegación entre páginas con scroll suave al inicio */}
          <View style={styles.canvasPaginationActions}>
            {currentChapterIndex > 0 ? (
              <Pressable
                onPress={handlePrevChapter}
                style={({ pressed }) => [
                  styles.canvasNavButton,
                  { borderColor: activePalette.border, backgroundColor: activePalette.cardBg },
                  pressed && styles.pressed,
                ]}>
                <MaterialIcons name="chevron-left" size={18} color={activePalette.accent} />
                <Text style={[styles.canvasNavButtonText, { color: activePalette.accent }]}>
                  PÁGINA ANTERIOR
                </Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {currentChapterIndex < totalChapters - 1 ? (
              <Pressable
                onPress={handleNextChapter}
                style={({ pressed }) => [
                  styles.canvasNavButton,
                  styles.canvasNavButtonPrimary,
                  { backgroundColor: activePalette.accent },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.canvasNavButtonText, { color: activePalette.bg }]}>
                  SIGUIENTE PÁGINA
                </Text>
                <MaterialIcons name="chevron-right" size={18} color={activePalette.bg} />
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>

          {/* Paginador flotante e indicador de término de escena */}
          <View style={styles.paginationIndicator}>
            <View style={styles.pageDividerRow}>
              <View
                style={[
                  styles.shortLine,
                  { backgroundColor: activePalette.secondaryText },
                ]}
              />
              <Text
                style={[
                  styles.pageNumberText,
                  { color: activePalette.secondaryText },
                ]}>
                Canto {currentChapterIndex + 1} de {totalChapters}
              </Text>
              <View
                style={[
                  styles.shortLine,
                  { backgroundColor: activePalette.secondaryText },
                ]}
              />
            </View>
            <Text
              style={[
                styles.readingTimeRemaining,
                { color: activePalette.secondaryText },
              ]}>
              Fin de la escena • 7 minutos restantes de lectura
            </Text>
          </View>

          {/* Cuestionario IA de este canto / capítulo */}
          <Pressable
            style={({ pressed }) => [
              styles.chapterQuizBannerBtn,
              { backgroundColor: activePalette.cardBg, borderColor: activePalette.border },
              pressed && styles.pressed,
            ]}
            onPress={() => handleStartChapterQuiz()}
            disabled={isGeneratingChapterQuiz}>
            {isGeneratingChapterQuiz ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={activePalette.accent} />
                <Text style={[styles.chapterQuizBannerBtnText, { color: activePalette.accent }]}>
                  GENERANDO EVALUACIÓN CON IA...
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="auto-awesome" size={16} color={activePalette.accent} />
                <Text style={[styles.chapterQuizBannerBtnText, { color: activePalette.accent }]}>
                  EVALUACIÓN IA DEL CANTO
                </Text>
                <MaterialIcons name="arrow-forward" size={14} color={activePalette.accent} />
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* BOTTOM FIXED NAVIGATION BAR                              */}
      {/* ======================================================== */}
      {!epubSettings.zenMode && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: activePalette.headerBg,
              paddingBottom: Math.max(insets.bottom, 12),
              borderTopColor: activePalette.border,
            },
          ]}>
          <View style={styles.bottomBarInner}>
            <Pressable
              onPress={handlePrevChapter}
              disabled={currentChapterIndex === 0}
              style={({ pressed }) => [
                styles.navChapterButton,
                currentChapterIndex === 0 && styles.disabledButton,
                pressed && styles.pressed,
              ]}
              hitSlop={12}
              accessibilityLabel="Capítulo anterior">
              <MaterialIcons
                name="skip-previous"
                size={22}
                color={
                  currentChapterIndex === 0
                    ? activePalette.secondaryText
                    : activePalette.accent
                }
              />
            </Pressable>

            <View style={styles.bottomProgressBarWrap}>
              <View
                style={[
                  styles.bottomProgressTrack,
                  { backgroundColor: activePalette.border },
                ]}>
                <View
                  style={[
                    styles.bottomProgressFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: activePalette.accent,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.bottomProgressLabel,
                  { color: activePalette.secondaryText },
                ]}>
                {progressPercent}%
              </Text>
            </View>

            <Pressable
              onPress={handleNextChapter}
              disabled={currentChapterIndex >= totalChapters - 1}
              style={({ pressed }) => [
                styles.navChapterButton,
                currentChapterIndex >= totalChapters - 1 && styles.disabledButton,
                pressed && styles.pressed,
              ]}
              hitSlop={12}
              accessibilityLabel="Capítulo siguiente">
              <MaterialIcons
                name="skip-next"
                size={22}
                color={
                  currentChapterIndex >= totalChapters - 1
                    ? activePalette.secondaryText
                    : activePalette.accent
                }
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* GLOSSARY MODAL (Dynamic Local or API IA)                  */}
      {/* ======================================================== */}
      <Modal
        visible={glossaryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGlossaryModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setGlossaryModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalSubLabel}>GLOSARIO EDITORIAL • ROSPIERE</Text>
                  {aiApiKey ? (
                    <View style={styles.apiActiveBadge}>
                      <Text style={styles.apiActiveText}>API {aiProvider.toUpperCase()}</Text>
                    </View>
                  ) : (
                    <View style={styles.apiLocalBadge}>
                      <Text style={styles.apiLocalText}>AGENTE LOCAL</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedGlossaryTerm ? `«${selectedGlossaryTerm}»` : 'Término Seleccionado'}
                </Text>
              </View>
              <Pressable onPress={() => setGlossaryModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 280, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {isGlossaryLoading ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={RospiereColors.primary} />
                  <Text
                    style={{
                      fontFamily: RospiereFonts.body,
                      fontSize: 12,
                      color: RospiereColors.secondary,
                      marginTop: 10,
                    }}>
                    Consultando glosario etimológico y literario...
                  </Text>
                </View>
              ) : (
                <View style={styles.glossaryItem}>
                  <Text style={styles.glossaryDef}>
                    {glossaryDefinition ||
                      'Selecciona cualquier palabra o frase en el texto para consultar su definición.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.aiModalFooter}>
              <Pressable
                style={styles.configApiKeyLink}
                onPress={() => {
                  setGlossaryModalVisible(false);
                  setAiKeyInput(aiApiKey || '');
                  setAiKeyModalVisible(true);
                }}>
                <MaterialIcons name="vpn-key" size={14} color={RospiereColors.primary} />
                <Text style={styles.configApiKeyLinkText}>
                  {aiApiKey ? 'Modificar API Key de IA' : 'Configurar API Key propia (Gemini / OpenAI)'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalActionDone}
                onPress={() => setGlossaryModalVisible(false)}>
                <Text style={styles.modalActionDoneText}>CERRAR GLOSARIO</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* FLOATING CONTEXTUAL SELECTION BAR                        */}
      {/* ======================================================== */}
      {selectionMenuVisible && selectedSnippet && (
        <View
          style={[
            styles.selectionFloatingCard,
            {
              backgroundColor: activePalette.cardBg,
              borderColor: activePalette.border,
              bottom: epubSettings.zenMode ? 24 : Math.max(insets.bottom + 60, 75),
            },
          ]}>
          <View style={styles.selectionTopRow}>
            <View style={styles.selectionBadgeWrap}>
              <MaterialIcons name="format-quote" size={14} color={activePalette.accent} />
              <Text style={[styles.selectionBadgeText, { color: activePalette.accent }]}>
                PASAJES & ANOTACIÓN
              </Text>
            </View>
            <Pressable onPress={() => setSelectionMenuVisible(false)} hitSlop={10}>
              <MaterialIcons name="close" size={16} color={activePalette.secondaryText} />
            </Pressable>
          </View>

          <Text style={[styles.selectionSnippetText, { color: activePalette.text }]} numberOfLines={2}>
            «{selectedSnippet}»
          </Text>

          <View style={styles.selectionActionsRow}>
            {/* 1. Subrayar / Marcador */}
            <Pressable
              style={({ pressed }) => [
                styles.selectionBtn,
                { backgroundColor: activePalette.bg },
                pressed && styles.pressed,
              ]}
              onPress={() => handleSaveHighlight(selectedSnippet)}>
              <MaterialIcons name="bookmark" size={16} color={activePalette.accent} />
              <Text style={[styles.selectionBtnText, { color: activePalette.accent }]}>
                SUBRAYAR
              </Text>
            </Pressable>

            {/* 2. Glosario */}
            <Pressable
              style={({ pressed }) => [
                styles.selectionBtn,
                { backgroundColor: activePalette.bg },
                pressed && styles.pressed,
              ]}
              onPress={() => handleOpenGlossaryForText(selectedSnippet)}>
              <MaterialIcons name="menu-book" size={16} color={activePalette.accent} />
              <Text style={[styles.selectionBtnText, { color: activePalette.accent }]}>
                GLOSARIO
              </Text>
            </Pressable>

            {/* 3. Consultar IA */}
            <Pressable
              style={({ pressed }) => [
                styles.selectionBtn,
                styles.selectionBtnPrimary,
                { backgroundColor: activePalette.accent },
                pressed && styles.pressed,
              ]}
              onPress={() => handleConsultAI(selectedSnippet)}>
              <MaterialIcons name="psychology" size={16} color={activePalette.bg} />
              <Text style={[styles.selectionBtnText, { color: activePalette.bg }]}>
                CONSULTAR IA
              </Text>
            </Pressable>

            {/* 4. Quiz IA del pasaje */}
            <Pressable
              style={({ pressed }) => [
                styles.selectionBtn,
                { backgroundColor: activePalette.bg },
                pressed && styles.pressed,
              ]}
              onPress={() => handleStartChapterQuiz(selectedSnippet || undefined)}>
              <MaterialIcons name="quiz" size={16} color={activePalette.accent} />
              <Text style={[styles.selectionBtnText, { color: activePalette.accent }]}>
                QUIZ IA
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* TOAST CONFIRMATION BADGE                                 */}
      {/* ======================================================== */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastCard}>
            <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BOOKMARKS / MARCADORES MODAL                             */}
      {/* ======================================================== */}
      <Modal
        visible={bookmarksModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookmarksModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBookmarksModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalSubLabel}>TUS MARCADORES & CITAS</Text>
                <Text style={styles.modalTitle}>{bookMeta.title}</Text>
              </View>
              <Pressable onPress={() => setBookmarksModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {bookBookmarks.length === 0 ? (
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <MaterialIcons name="bookmark-border" size={32} color={RospiereColors.secondary} />
                  <Text
                    style={{
                      fontFamily: RospiereFonts.body,
                      fontSize: 12,
                      color: RospiereColors.secondary,
                      marginTop: 8,
                      textAlign: 'center',
                    }}>
                    No has guardado marcadores aún. Toca cualquier pasaje para subrayarlo y etiquetarlo.
                  </Text>
                </View>
              ) : (
                bookBookmarks.map((bm) => (
                  <View key={bm.id} style={styles.bookmarkCard}>
                    <View style={styles.bookmarkCardHeader}>
                      <Text style={styles.bookmarkChapterTag}>{bm.chapterTitle}</Text>
                      <Text style={styles.bookmarkDateText}>{bm.date}</Text>
                    </View>
                    <Text style={styles.bookmarkQuoteText}>«{bm.text}»</Text>
                    <View style={styles.bookmarkActionsRow}>
                      <Pressable
                        style={styles.bookmarkJumpBtn}
                        onPress={() => {
                          setCurrentChapterIndex(bm.chapterIndex);
                          updateEpubChapter(bookId, bm.chapterIndex);
                          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
                          setBookmarksModalVisible(false);
                        }}>
                        <Text style={styles.bookmarkJumpText}>IR AL CANTO</Text>
                        <MaterialIcons name="arrow-forward" size={12} color={RospiereColors.primary} />
                      </Pressable>
                      <Pressable onPress={() => removeEpubBookmark(bm.id)} hitSlop={8}>
                        <MaterialIcons name="delete-outline" size={16} color={RospiereColors.secondary} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              style={styles.modalActionDone}
              onPress={() => setBookmarksModalVisible(false)}>
              <Text style={styles.modalActionDoneText}>CERRAR MARCADORES</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* AI CONSULTATION MODAL                                    */}
      {/* ======================================================== */}
      <Modal
        visible={aiModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAiModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalSubLabel}>AGENTE SOCRÁTICO • ROSPIERE IA</Text>
                  {aiApiKey ? (
                    <View style={styles.apiActiveBadge}>
                      <Text style={styles.apiActiveText}>API {aiProvider.toUpperCase()}</Text>
                    </View>
                  ) : (
                    <View style={styles.apiLocalBadge}>
                      <Text style={styles.apiLocalText}>AGENTE LOCAL</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalTitle}>Análisis del Pasaje</Text>
              </View>
              <Pressable onPress={() => setAiModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            {selectedSnippet ? (
              <View style={styles.aiQuotePreview}>
                <Text style={styles.aiQuotePreviewText} numberOfLines={2}>
                  «{selectedSnippet}»
                </Text>
              </View>
            ) : null}

            <ScrollView style={{ maxHeight: 250, marginVertical: 12 }} showsVerticalScrollIndicator={false}>
              {isAiLoading ? (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={RospiereColors.primary} />
                  <Text
                    style={{
                      fontFamily: RospiereFonts.body,
                      fontSize: 12,
                      color: RospiereColors.secondary,
                      marginTop: 10,
                    }}>
                    Consultando al agente literario Rospiere...
                  </Text>
                </View>
              ) : (
                <Text style={styles.aiResultText}>{aiResponse}</Text>
              )}
            </ScrollView>

            <View style={styles.aiModalFooter}>
              <Pressable
                style={styles.configApiKeyLink}
                onPress={() => {
                  setAiModalVisible(false);
                  setAiKeyInput(aiApiKey || '');
                  setAiKeyModalVisible(true);
                }}>
                <MaterialIcons name="vpn-key" size={14} color={RospiereColors.primary} />
                <Text style={styles.configApiKeyLinkText}>
                  {aiApiKey ? 'Modificar API Key de IA' : 'Configurar API Key propia (Gemini / OpenAI)'}
                </Text>
              </Pressable>

              <Pressable style={styles.modalActionDone} onPress={() => setAiModalVisible(false)}>
                <Text style={styles.modalActionDoneText}>ENTENDIDO</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* API KEY CONFIG MODAL                                     */}
      {/* ======================================================== */}
      <Modal
        visible={aiKeyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiKeyModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAiKeyModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalSubLabel}>INTEGRACIÓN INTELIGENCIA ARTIFICIAL</Text>
                <Text style={styles.modalTitle}>Configurar API de IA</Text>
              </View>
              <Pressable onPress={() => setAiKeyModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.apiKeyExplanation}>
              Puedes ingresar una API Key de Google Gemini o OpenAI. Si no configuras ninguna, la app utilizará su motor analítico local integrado.
            </Text>

            {/* Provider selector */}
            <View style={styles.providerRow}>
              <Pressable
                style={[styles.providerBtn, aiProvider === 'gemini' && styles.providerBtnActive]}
                onPress={() => setAiProvider('gemini')}>
                <Text
                  style={[
                    styles.providerBtnText,
                    aiProvider === 'gemini' && styles.providerBtnTextActive,
                  ]}>
                  GEMINI
                </Text>
              </Pressable>
              <Pressable
                style={[styles.providerBtn, aiProvider === 'openai' && styles.providerBtnActive]}
                onPress={() => setAiProvider('openai')}>
                <Text
                  style={[
                    styles.providerBtnText,
                    aiProvider === 'openai' && styles.providerBtnTextActive,
                  ]}>
                  OPENAI
                </Text>
              </Pressable>
              <Pressable
                style={[styles.providerBtn, aiProvider === 'local' && styles.providerBtnActive]}
                onPress={() => setAiProvider('local')}>
                <Text
                  style={[
                    styles.providerBtnText,
                    aiProvider === 'local' && styles.providerBtnTextActive,
                  ]}>
                  LOCAL (OFFLINE)
                </Text>
              </Pressable>
            </View>

            {aiProvider !== 'local' && (
              <TextInput
                value={aiKeyInput}
                onChangeText={setAiKeyInput}
                placeholder="Pega tu API key aquí (AIza... o sk-...)"
                placeholderTextColor="#999999"
                style={styles.apiKeyInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable
                style={[styles.modalActionDone, { flex: 1, backgroundColor: RospiereColors.surfaceContainer }]}
                onPress={() => setAiKeyModalVisible(false)}>
                <Text style={[styles.modalActionDoneText, { color: RospiereColors.onSurface }]}>
                  CANCELAR
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalActionDone, { flex: 1 }]}
                onPress={() => {
                  setAiApiKey(aiKeyInput.trim());
                  setAiKeyModalVisible(false);
                  setToastMessage('Configuración de IA actualizada');
                  setTimeout(() => setToastMessage(null), 2500);
                }}>
                <Text style={styles.modalActionDoneText}>GUARDAR</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottomWidth: 1,
  },
  headerInner: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  headerTitleWrap: {
    alignItems: 'center',
    maxWidth: 200,
  },
  headerBookTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '400',
  },
  headerChapterTitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  metaBanner: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  metaBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  metaSquare: {
    width: 6,
    height: 6,
  },
  metaBookTitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaSlash: {
    fontSize: 11,
  },
  metaAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
  },
  metaBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaProgressText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
  quickBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickBarTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  quickBarSub: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  quickBarTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  toggleSettingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleSettingsButtonActive: {
    backgroundColor: '#262626',
  },
  toggleSettingsButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingsPanel: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 16,
  },
  panelSubtitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  panelTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 17,
    fontWeight: '300',
    marginTop: 2,
  },
  closePanelButton: {
    padding: 6,
  },
  settingBlock: {
    marginBottom: 18,
  },
  settingBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  settingHint: {
    fontFamily: RospiereFonts.body,
    fontSize: 9.5,
    fontStyle: 'italic',
  },
  fontsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontOptionCard: {
    width: '48.5%',
    padding: 10,
  },
  fontOptionName: {
    fontSize: 13,
    marginBottom: 2,
  },
  fontOptionBadge: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  italicText: {
    fontStyle: 'italic',
  },
  dualControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dualColumn: {
    flex: 1,
  },
  sizeValueTag: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    padding: 2,
  },
  sizePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizePillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
  },
  leadingPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingPillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  themeCard: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  themeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
  },
  themeLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  alignButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marginPillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  togglesSection: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    fontWeight: '500',
  },
  toggleDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 9.5,
    marginTop: 1,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerCanvas: {
    paddingVertical: 20,
  },
  canvasHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  cantoLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cantoTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '300',
    textAlign: 'center',
  },
  titleDivider: {
    width: 30,
    height: 1,
    marginTop: 12,
    opacity: 0.4,
  },
  dropCapContainer: {
    marginBottom: 16,
  },
  dropCapPrefixRow: {
    marginBottom: 6,
  },
  dropCapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dropCapBox: {
    width: 48,
    height: 48,
    marginRight: 12,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  dropCapText: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '400',
  },
  paragraphText: {
    fontSize: 18,
    lineHeight: 32,
  },
  assistantAside: {
    marginVertical: 20,
    padding: 16,
    borderLeftWidth: 3,
  },
  asideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  asideLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  asideParagraph: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    lineHeight: 18,
  },
  pullQuoteCard: {
    marginVertical: 24,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  pullQuoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pullQuoteAuthor: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  paginationIndicator: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 16,
    gap: 6,
  },
  pageDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shortLine: {
    width: 14,
    height: 1,
    opacity: 0.4,
  },
  pageNumberText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  readingTimeRemaining: {
    fontFamily: RospiereFonts.headline,
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.75,
  },
  interactiveEndModule: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
  },
  interactiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  interactiveLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  interactiveTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
  },
  interactiveCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  interactiveCard: {
    flex: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTopLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  cardMainTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubText: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 40,
  },
  bottomBarInner: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navChapterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.3,
  },
  bottomProgressBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomProgressTrack: {
    width: 120,
    height: 3,
    overflow: 'hidden',
  },
  bottomProgressFill: {
    height: '100%',
  },
  bottomProgressLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSubLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#666666',
    fontWeight: '600',
  },
  modalTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 17,
    color: '#000000',
    fontWeight: '400',
    marginTop: 2,
  },
  modalQuestion: {
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quizOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  quizOptionBtn: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  quizOptionBtnSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  quizOptionText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: '#1A1A1A',
    lineHeight: 17,
  },
  quizOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  quizFeedbackBox: {
    padding: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
  },
  quizFeedbackText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#333333',
  },
  modalActionDone: {
    paddingVertical: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionDoneText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  glossaryItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  glossaryTerm: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  glossaryDef: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: '#555555',
  },
  paragraphPressable: {
    position: 'relative',
  },
  canvasPaginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  canvasNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  canvasNavButtonPrimary: {
    borderWidth: 0,
  },
  canvasNavButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  selectionFloatingCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
  selectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectionBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectionBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  selectionSnippetText: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 12,
  },
  selectionActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  selectionBtnPrimary: {
    // Custom primary
  },
  selectionBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  toastCard: {
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookmarkCard: {
    padding: 14,
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
    marginBottom: 12,
  },
  bookmarkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bookmarkChapterTag: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#000000',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bookmarkDateText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    color: '#888888',
  },
  bookmarkQuoteText: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    color: '#222222',
    marginBottom: 10,
  },
  bookmarkActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookmarkJumpText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#000000',
  },
  apiActiveBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  apiActiveText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    color: '#2E7D32',
    fontWeight: '700',
    letterSpacing: 1,
  },
  apiLocalBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  apiLocalText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    color: '#555555',
    fontWeight: '700',
    letterSpacing: 1,
  },
  aiQuotePreview: {
    padding: 10,
    backgroundColor: '#F7F7F7',
    borderLeftWidth: 2,
    borderLeftColor: '#000000',
    marginBottom: 10,
  },
  aiQuotePreviewText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#444444',
  },
  aiResultText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12.5,
    lineHeight: 20,
    color: '#1A1A1A',
  },
  aiModalFooter: {
    marginTop: 10,
    gap: 10,
  },
  configApiKeyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  configApiKeyLinkText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: '#444444',
    textDecorationLine: 'underline',
  },
  apiKeyExplanation: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    marginBottom: 16,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  providerBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  providerBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: '#444444',
    fontWeight: '600',
  },
  providerBtnTextActive: {
    color: '#FFFFFF',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#D4D4D4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    backgroundColor: '#FAFAFA',
  },
  chapterQuizBannerBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterQuizBannerBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
