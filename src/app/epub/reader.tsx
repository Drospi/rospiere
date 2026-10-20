import React, { useState, useMemo } from 'react';
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
  } = useRospiere();

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Active theme palette
  const activePalette = THEME_PALETTES[epubSettings.theme] || THEME_PALETTES.paper;

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

  const handleToggleSettings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleEpubSettings();
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < totalChapters - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      updateEpubChapter(bookId, nextIdx);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      updateEpubChapter(bookId, prevIdx);
    }
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

  // Drop cap letter and rest of paragraph
  const firstParagraph = currentChapter.paragraphs[0] || '';
  const dropCapLetter = firstParagraph.length > 0 ? firstParagraph.charAt(0) : '';
  const restOfFirstParagraph = firstParagraph.slice(1);

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
              onPress={() => router.back()}
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
          {firstParagraph.length > 0 && (
            <View style={styles.dropCapContainer}>
              <View
                style={[
                  styles.dropCapBox,
                  { backgroundColor: activePalette.cardBg },
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
                  {
                    fontFamily: resolvedFontFamily,
                    fontSize: epubSettings.fontSize,
                    lineHeight: resolvedLineHeight,
                    color: activePalette.text,
                    textAlign: epubSettings.align,
                  },
                ]}>
                {restOfFirstParagraph}
              </Text>
            </View>
          )}

          {/* Glosa Marginal / Nota Asistente Lumiere en Flujo Editorial */}
          {epubSettings.showAssistantNotes && (
            <View
              style={[
                styles.assistantAside,
                {
                  backgroundColor: activePalette.cardBg,
                  borderLeftColor: activePalette.accent,
                },
              ]}>
              <View style={styles.asideHeaderRow}>
                <MaterialIcons name="auto-awesome" size={14} color={activePalette.accent} />
                <Text
                  style={[styles.asideLabel, { color: activePalette.accent }]}>
                  GLOSARIO LUMIERE • CLAVE HOMÉRICA
                </Text>
              </View>
              <Text
                style={[
                  styles.asideParagraph,
                  { color: activePalette.secondaryText },
                ]}>
                En la tradición épica, la invocación a la Musa no es un mero adorno retórico,
                sino la consagración de la memoria colectiva (Mnemósine). Odiseo es calificado
                como «polýtropos» (de multiforme ingenio), definiendo el arquetipo de la astucia
                frente a la fuerza bruta de Aquiles.
              </Text>
            </View>
          )}

          {/* Resto de párrafos del Canto */}
          {currentChapter.paragraphs.slice(1, 4).map((p, pIdx) => (
            <Text
              key={`p-${pIdx}`}
              style={[
                styles.paragraphText,
                {
                  fontFamily: resolvedFontFamily,
                  fontSize: epubSettings.fontSize,
                  lineHeight: resolvedLineHeight,
                  color: activePalette.text,
                  textAlign: epubSettings.align,
                  marginBottom: 16,
                },
              ]}>
              {p}
            </Text>
          ))}

          {/* Cita Editorial Destacada */}
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
              «Háblame, Musa, de aquel varón de multiforme ingenio que, después de destruir Troya,
              anduvo peregrinando larguísimo tiempo.»
            </Text>
            <Text
              style={[
                styles.pullQuoteAuthor,
                { color: activePalette.secondaryText },
              ]}>
              — Proemio de La Odisea • Homero
            </Text>
          </View>

          {/* Párrafos adicionales */}
          {currentChapter.paragraphs.slice(4, 9).map((p, pIdx) => (
            <Text
              key={`p2-${pIdx}`}
              style={[
                styles.paragraphText,
                {
                  fontFamily: resolvedFontFamily,
                  fontSize: epubSettings.fontSize,
                  lineHeight: resolvedLineHeight,
                  color: activePalette.text,
                  textAlign: epubSettings.align,
                  marginBottom: 16,
                },
              ]}>
              {p}
            </Text>
          ))}

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
        </View>

        {/* ======================================================== */}
        {/* MÓDULO INTERACTIVO DE CIERRE DE CAPÍTULO                 */}
        {/* ======================================================== */}
        <View
          style={[
            styles.interactiveEndModule,
            { backgroundColor: activePalette.cardBg },
          ]}>
          <View style={styles.interactiveHeader}>
            <View>
              <Text
                style={[
                  styles.interactiveLabel,
                  { color: activePalette.secondaryText },
                ]}>
                REFLEXIÓN CRÍTICA
              </Text>
              <Text
                style={[
                  styles.interactiveTitle,
                  { color: activePalette.accent },
                ]}>
                Inmersión del Canto {currentChapterIndex + 1}
              </Text>
            </View>
            <MaterialIcons name="psychology" size={22} color={activePalette.accent} />
          </View>

          <View style={styles.interactiveCardsRow}>
            {/* Botón Cuestionario */}
            <Pressable
              style={({ pressed }) => [
                styles.interactiveCard,
                { backgroundColor: activePalette.bg },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setSelectedQuizAnswer(null);
                setQuizFeedback(null);
                setQuizModalVisible(true);
              }}>
              <View style={styles.cardTopRow}>
                <Text
                  style={[
                    styles.cardTopLabel,
                    { color: activePalette.secondaryText },
                  ]}>
                  COMPROBACIÓN
                </Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={14}
                  color={activePalette.secondaryText}
                />
              </View>
              <Text
                style={[styles.cardMainTitle, { color: activePalette.accent }]}>
                Cuestionario del Canto
              </Text>
              <Text
                style={[
                  styles.cardSubText,
                  { color: activePalette.secondaryText },
                ]}>
                3 preguntas analíticas
              </Text>
            </Pressable>

            {/* Botón Glosario */}
            <Pressable
              style={({ pressed }) => [
                styles.interactiveCard,
                { backgroundColor: activePalette.bg },
                pressed && styles.pressed,
              ]}
              onPress={() => setGlossaryModalVisible(true)}>
              <View style={styles.cardTopRow}>
                <Text
                  style={[
                    styles.cardTopLabel,
                    { color: activePalette.secondaryText },
                  ]}>
                  COMPRENSIÓN
                </Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={14}
                  color={activePalette.secondaryText}
                />
              </View>
              <Text
                style={[styles.cardMainTitle, { color: activePalette.accent }]}>
                Glosario Lumiere IA
              </Text>
              <Text
                style={[
                  styles.cardSubText,
                  { color: activePalette.secondaryText },
                ]}>
                Conceptos y alusiones
              </Text>
            </Pressable>
          </View>
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
      {/* QUIZ MODAL                                               */}
      {/* ======================================================== */}
      <Modal
        visible={quizModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuizModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setQuizModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalSubLabel}>CUESTIONARIO SOCRÁTICO</Text>
                <Text style={styles.modalTitle}>Inmersión del Canto {currentChapterIndex + 1}</Text>
              </View>
              <Pressable onPress={() => setQuizModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.modalQuestion}>
              1. ¿Por qué razón Poseidón guarda rencor constante al divinal Odiseo impidiéndole
              su retorno a Ítaca?
            </Text>

            <View style={styles.quizOptionsList}>
              {[
                {
                  id: 0,
                  text: 'Porque destruyó la estatua de Helios en la costa de Troya.',
                  correct: false,
                },
                {
                  id: 1,
                  text: 'Porque cegó a su hijo, el ciclope Polifemo.',
                  correct: true,
                },
                {
                  id: 2,
                  text: 'Porque se negó a ofrendar toros en la ciudad de Tafos.',
                  correct: false,
                },
              ].map((opt) => {
                const isSelected = selectedQuizAnswer === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.quizOptionBtn,
                      isSelected && styles.quizOptionBtnSelected,
                    ]}
                    onPress={() => {
                      setSelectedQuizAnswer(opt.id);
                      if (opt.correct) {
                        setQuizFeedback('¡Correcto! Poseidón vengó el ojo de Polifemo haciéndole errar por el ponto.');
                      } else {
                        setQuizFeedback('Incorrecto. Homero especifica que Odiseo cegó al ciclope Polifemo, hijo de Poseidón y Toosa.');
                      }
                    }}>
                    <Text
                      style={[
                        styles.quizOptionText,
                        isSelected && styles.quizOptionTextSelected,
                      ]}>
                      {opt.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {quizFeedback && (
              <View style={styles.quizFeedbackBox}>
                <Text style={styles.quizFeedbackText}>{quizFeedback}</Text>
              </View>
            )}

            <Pressable
              style={styles.modalActionDone}
              onPress={() => setQuizModalVisible(false)}>
              <Text style={styles.modalActionDoneText}>CERRAR EVALUACIÓN</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* GLOSSARY MODAL                                           */}
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
                <Text style={styles.modalSubLabel}>GLOSARIO CRÍTICO LUMIERE</Text>
                <Text style={styles.modalTitle}>Términos Clave del Canto</Text>
              </View>
              <Pressable onPress={() => setGlossaryModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>Polýtropos (πολύτροπος)</Text>
                <Text style={styles.glossaryDef}>
                  Epíteto homérico de Odiseo: «de muchos giros», «de multiforme ingenio». Denota
                  capacidad adaptativa, prudencia y versatilidad ante la adversidad.
                </Text>
              </View>

              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>Nóstos (νόστος)</Text>
                <Text style={styles.glossaryDef}>
                  El viaje heroico de regreso a la patria. Es el tema estructural de la Odisea,
                  que contrasta con el «kléos» (gloria mortal bélica) predominante en la Ilíada.
                </Text>
              </View>

              <View style={styles.glossaryItem}>
                <Text style={styles.glossaryTerm}>Xenía (ξενία)</Text>
                <Text style={styles.glossaryDef}>
                  La ley sagrada de la hospitalidad custodiada por Zeus Xenios. La transgresión de
                  este precepto por parte de los pretendientes sella su destino trágico.
                </Text>
              </View>
            </ScrollView>

            <Pressable
              style={styles.modalActionDone}
              onPress={() => setGlossaryModalVisible(false)}>
              <Text style={styles.modalActionDoneText}>ENTENDIDO</Text>
            </Pressable>
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
  dropCapBox: {
    width: 48,
    height: 48,
    marginRight: 12,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
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
});
