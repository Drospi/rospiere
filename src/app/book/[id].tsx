import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere, ReaderThemeMode } from '@/context/RospiereContext';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getBook,
    toggleBookmark,
    readerSettings,
    setFontSize,
    setReaderTheme,
    bookmarkedPages,
    togglePageBookmark,
    quizzes,
  } = useRospiere();

  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [dictionaryModalVisible, setDictionaryModalVisible] = useState(false);

  const book = getBook(id || 'klara-y-el-sol') || getBook('klara-y-el-sol')!;
  const matchingQuiz = quizzes.find((q) => q.bookId === book.id) || quizzes[0];

  const currentTheme = RospiereColors.reader[readerSettings.theme];
  const pagesBookmarked = bookmarkedPages[book.id] || [];
  const isCurrentPageBookmarked = pagesBookmarked.includes(book.currentPage);

  const progressPercent = Math.round((book.currentPage / book.pagesTotal) * 100);

  return (
    <View style={styles.screen}>
      <RospiereHeader
        title="Detalle Del Libro"
        showBack
        onBack={() => router.back()}
        rightAction={
          <Pressable
            style={({ pressed }) => [styles.topBookmarkBtn, pressed && styles.pressed]}
            onPress={() => toggleBookmark(book.id)}>
            <MaterialIcons
              name={book.isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={RospiereColors.onSurface}
            />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Book Meta & Presentation Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            {/* Book Cover */}
            <View style={styles.coverWrapper}>
              <Image
                source={{ uri: book.coverImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
              <View style={styles.eBookBadge}>
                <Text style={styles.eBookBadgeText}>eBook</Text>
              </View>
            </View>

            {/* Book Info Column */}
            <View style={styles.infoColumn}>
              <View style={styles.accoladeRow}>
                <Text style={styles.collectionText}>
                  COLECCIÓN {book.category.toUpperCase()}
                </Text>
                {book.accolade && (
                  <>
                    <View style={styles.bulletDot} />
                    <Text style={styles.accoladeText}>{book.accolade}</Text>
                  </>
                )}
              </View>

              <Text style={styles.titleText}>{book.title}</Text>
              <Text style={styles.authorText}>{book.author.toUpperCase()}</Text>

              {/* 3 Metrics Columns */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TIEMPO RESTANTE</Text>
                  <View style={styles.metricValueWithIcon}>
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={RospiereColors.onSurface}
                    />
                    <Text style={styles.metricValueText}>{book.remainingTime}</Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>EDICIÓN</Text>
                  <Text style={styles.metricValueText} numberOfLines={1}>
                    {book.edition}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>CALIFICACIÓN</Text>
                  <View style={styles.metricValueWithIcon}>
                    <MaterialIcons name="star" size={14} color={RospiereColors.primary} />
                    <Text style={styles.metricValueText}>{book.rating.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Reading Progress Container */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <Text style={styles.progressCardTitle}>PROGRESO DE LECTURA</Text>
              <Text style={styles.progressCardPages}>
                Pág. {book.currentPage} de {book.pagesTotal} ({progressPercent}%)
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarProgress,
                  { width: `${Math.max(5, progressPercent)}%` },
                ]}
              />
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              style={({ pressed }) => [styles.primaryActionBtn, pressed && styles.pressed]}
              onPress={() => {
                // Focus on reader section
              }}>
              <MaterialIcons name="menu-book" size={17} color={RospiereColors.onPrimary} />
              <Text style={styles.primaryActionText}>CONTINUAR LEYENDO</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.quizActionBtn, pressed && styles.pressed]}
              onPress={() => router.push(`/quiz/${matchingQuiz.id}` as any)}>
              <MaterialIcons name="quiz" size={17} color={RospiereColors.onSurface} />
              <Text style={styles.quizActionText}>CUESTIONARIO</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.wishlistBtn, pressed && styles.pressed]}
              onPress={() => toggleBookmark(book.id)}>
              <MaterialIcons
                name={book.isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={19}
                color={RospiereColors.onSurface}
              />
            </Pressable>
          </View>
        </View>

        {/* E-Reader Canvas & Reader Controls */}
        <View style={styles.readerSection}>
          {/* Reader Controls Toolbar */}
          <View style={styles.readerToolbar}>
            {/* Font Size Adjusters */}
            <View style={styles.fontControls}>
              <Pressable
                style={styles.fontBtn}
                onPress={() => setFontSize((size) => size - 2)}>
                <Text style={styles.fontBtnSmall}>A-</Text>
              </Pressable>
              <Pressable
                style={styles.fontBtn}
                onPress={() => setFontSize((size) => size + 2)}>
                <Text style={styles.fontBtnLarge}>A+</Text>
              </Pressable>

              <View style={styles.toolbarDivider} />

              {/* Theme Modes */}
              {(['paper', 'sepia', 'dark'] as ReaderThemeMode[]).map((mode) => {
                const isActive = readerSettings.theme === mode;
                const label =
                  mode === 'paper' ? 'Papel' : mode === 'sepia' ? 'Sepia' : 'Noche';
                return (
                  <Pressable
                    key={mode}
                    style={[styles.modeBtn, isActive && styles.modeBtnActive]}
                    onPress={() => setReaderTheme(mode)}>
                    <Text
                      style={[
                        styles.modeBtnText,
                        isActive && styles.modeBtnTextActive,
                      ]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Bookmark & Marginal Notes icons */}
            <View style={styles.readerToolActions}>
              <Pressable
                style={styles.toolIconBtn}
                onPress={() => togglePageBookmark(book.id, book.currentPage)}
                hitSlop={8}>
                <MaterialIcons
                  name={isCurrentPageBookmarked ? 'bookmark' : 'bookmark-add'}
                  size={19}
                  color={RospiereColors.onSurface}
                />
              </Pressable>

              <Pressable
                style={styles.toolIconBtn}
                onPress={() => setNotesModalVisible(true)}
                hitSlop={8}>
                <MaterialIcons
                  name="edit-note"
                  size={20}
                  color={RospiereColors.onSurface}
                />
              </Pressable>
            </View>
          </View>

          {/* Reader Page Canvas */}
          <View
            style={[
              styles.readerCanvas,
              { backgroundColor: currentTheme.background },
            ]}>
            {/* Chapter Header */}
            <View style={styles.chapterHeaderRow}>
              <Text style={[styles.chapterHeaderLabel, { color: currentTheme.subtext }]}>
                {book.sampleChapter.chapterNumber.toUpperCase()}
              </Text>
              <Text style={[styles.chapterHeaderLabel, { color: currentTheme.subtext }]}>
                {book.sampleChapter.part.toUpperCase()}
              </Text>
            </View>

            {/* Book Text Content */}
            <View style={styles.textContentWrap}>
              {book.sampleChapter.content.map((paragraph, index) => {
                if (index === 0) {
                  // Drop cap on first paragraph
                  const firstChar = paragraph.charAt(0);
                  const restOfPara = paragraph.slice(1);
                  return (
                    <Text
                      key={index}
                      style={[
                        styles.paragraphText,
                        {
                          fontSize: readerSettings.fontSize,
                          lineHeight: readerSettings.fontSize * 1.85,
                          color: currentTheme.text,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.dropCap,
                          {
                            fontSize: readerSettings.fontSize * 2.4,
                            lineHeight: readerSettings.fontSize * 2.2,
                            color: currentTheme.text,
                          },
                        ]}>
                        {firstChar}
                      </Text>
                      {restOfPara}
                    </Text>
                  );
                }

                return (
                  <Text
                    key={index}
                    style={[
                      styles.paragraphText,
                      {
                        fontSize: readerSettings.fontSize,
                        lineHeight: readerSettings.fontSize * 1.85,
                        color: currentTheme.text,
                      },
                    ]}>
                    {paragraph}
                  </Text>
                );
              })}

              {/* Styled Pull Quote */}
              {book.sampleChapter.quote && (
                <View
                  style={[
                    styles.pullQuoteBox,
                    {
                      backgroundColor: currentTheme.container,
                      borderLeftColor: currentTheme.text,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pullQuoteText,
                      {
                        fontSize: readerSettings.fontSize + 1,
                        lineHeight: (readerSettings.fontSize + 1) * 1.6,
                        color: currentTheme.text,
                      },
                    ]}>
                    {book.sampleChapter.quote}
                  </Text>
                </View>
              )}
            </View>

            {/* Page Footer */}
            <View style={styles.pageFooterRow}>
              <Text style={[styles.pageFooterText, { color: currentTheme.subtext }]}>
                {book.title}
              </Text>
              <Text style={[styles.pageFooterText, { color: currentTheme.subtext }]}>
                {book.currentPage}
              </Text>
            </View>
          </View>
        </View>

        {/* Guía de Comprensión: Notas del Asistente y Glosario */}
        <View style={styles.guideSection}>
          <View style={styles.guideHeader}>
            <View style={styles.guidePreRow}>
              <MaterialIcons name="psychology" size={16} color={RospiereColors.secondary} />
              <Text style={styles.guidePreLabel}>GUÍA DE COMPRENSIÓN</Text>
            </View>
            <Text style={styles.guideTitle}>Notas del Asistente y Glosario</Text>
          </View>

          <View style={styles.guideCardsRow}>
            {/* Card 1: Key Concept */}
            <View style={styles.guideCard}>
              <View>
                <View style={styles.cardTagRow}>
                  <Text style={styles.cardTagLabel}>CONCEPTO CLAVE</Text>
                  <MaterialIcons name="auto-awesome" size={16} color={RospiereColors.primary} />
                </View>
                <Text style={styles.conceptTitle}>
                  {book.symbolismNote?.concept || 'Simbolismo Estético'}
                </Text>
                <Text style={styles.conceptExplanation}>
                  {book.symbolismNote?.explanation ||
                    'Una exploración minuciosa de las tensiones éticas y humanas en el texto.'}
                </Text>
              </View>

              <Pressable
                style={styles.conceptActionBtn}
                onPress={() => router.push('/(tabs)/asistente')}>
                <Text style={styles.conceptActionText}>PROFUNDIZAR EN SIMBOLISMO</Text>
              </Pressable>
            </View>

            {/* Card 2: Self-Evaluation */}
            <View style={styles.guideCard}>
              <View>
                <View style={styles.cardTagRow}>
                  <Text style={styles.cardTagLabel}>AUTOEVALUACIÓN</Text>
                  <MaterialIcons name="lightbulb" size={16} color={RospiereColors.primary} />
                </View>
                <Text style={styles.conceptTitle}>
                  {book.reflectionQuestion?.question ||
                    '¿Qué resonancias suscita este pasaje?'}
                </Text>
                <Text style={styles.conceptExplanation}>
                  {book.reflectionQuestion?.prompt ||
                    'Reflexiona sobre las motivaciones no declaradas del personaje en esta escena.'}
                </Text>
              </View>

              <Pressable
                style={styles.conceptActionBtn}
                onPress={() => router.push(`/quiz/${matchingQuiz.id}` as any)}>
                <Text style={styles.conceptActionText}>COMENZAR QUIZ BREVE</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Editorial Footer Links */}
        <View style={styles.editorialFooter}>
          <Text style={styles.footerBrand}>ROSPIERE BOOKS © 2026</Text>
          <View style={styles.footerLinksRow}>
            <Pressable onPress={() => setDictionaryModalVisible(true)}>
              <Text style={styles.footerLinkText}>DICCIONARIO</Text>
            </Pressable>
            <Pressable onPress={() => setNotesModalVisible(true)}>
              <Text style={styles.footerLinkText}>NOTAS</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/libros')}>
              <Text style={styles.footerLinkText}>ÍNDICE COMPLETO</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Marginal Notes Modal */}
      <Modal
        visible={notesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotesModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNotesModalVisible(false)}>
          <Pressable style={styles.modalInner} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>NOTAS MARGINALES</Text>
              <Pressable onPress={() => setNotesModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.noteChapterTitle}>
              {book.title} • {book.sampleChapter.chapterNumber}
            </Text>

            <View style={styles.savedNoteItem}>
              <Text style={styles.savedNoteQuote}>
                {book.sampleChapter.quote}
              </Text>
              <Text style={styles.savedNoteComment}>
                Anotación guardada en Pág. {book.currentPage}. Metáfora recurrente sobre la trascendencia.
              </Text>
            </View>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setNotesModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>CERRAR NOTAS</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Literary Dictionary Modal */}
      <Modal
        visible={dictionaryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDictionaryModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDictionaryModalVisible(false)}>
          <Pressable style={styles.modalInner} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>DICCIONARIO LITERARIO</Text>
              <Pressable onPress={() => setDictionaryModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <View style={styles.dictItem}>
              <Text style={styles.dictTerm}>Amigo Artificial (AA)</Text>
              <Text style={styles.dictDef}>
                Entidad androide concebida para acompañar a niños adolescentes y prevenir el aislamiento formativo.
              </Text>
            </View>

            <View style={styles.dictItem}>
              <Text style={styles.dictTerm}>Máquina Cootings</Text>
              <Text style={styles.dictDef}>
                Aparato industrial urbano generador de emisiones de hollín que bloquean la luz solar en el horizonte.
              </Text>
            </View>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setDictionaryModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>VOLVER A LA LECTURA</Text>
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
    backgroundColor: RospiereColors.surface,
  },
  topBookmarkBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  coverWrapper: {
    width: 130,
    aspectRatio: 2 / 3,
    backgroundColor: RospiereColors.surfaceContainerHighest,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  eBookBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eBookBadgeText: {
    fontFamily: RospiereFonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  accoladeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  collectionText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: RospiereColors.secondary,
  },
  accoladeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    color: RospiereColors.secondary,
  },
  titleText: {
    fontFamily: RospiereFonts.headline,
    fontSize: 22,
    color: RospiereColors.onSurface,
    lineHeight: 28,
  },
  authorText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
    marginTop: 3,
    marginBottom: 12,
  },
  metricsRow: {
    gap: 8,
  },
  metricItem: {
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  metricValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  metricValueText: {
    fontFamily: RospiereFonts.bodyMedium,
    fontSize: 11.5,
    color: RospiereColors.onSurface,
  },
  progressCard: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 14,
    marginTop: 18,
    marginBottom: 14,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressCardTitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  progressCardPages: {
    fontFamily: RospiereFonts.mono,
    fontSize: 10,
    color: RospiereColors.onSurface,
  },
  progressBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: RospiereColors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  progressBarProgress: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: RospiereColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  quizActionBtn: {
    backgroundColor: RospiereColors.surfaceContainerHigh,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  quizActionText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  wishlistBtn: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerSection: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  readerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fontBtn: {
    width: 32,
    height: 32,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontBtnSmall: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12,
    color: RospiereColors.onSurface,
    fontWeight: '700',
  },
  fontBtnLarge: {
    fontFamily: RospiereFonts.headline,
    fontSize: 15,
    color: RospiereColors.onSurface,
    fontWeight: '700',
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: RospiereColors.outlineVariant,
    opacity: 0.4,
    marginHorizontal: 4,
  },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  modeBtnActive: {
    backgroundColor: RospiereColors.surfaceContainerHighest,
  },
  modeBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 0.8,
    color: RospiereColors.secondary,
    textTransform: 'uppercase',
  },
  modeBtnTextActive: {
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  readerToolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolIconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerCanvas: {
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  chapterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chapterHeaderLabel: {
    fontFamily: RospiereFonts.mono,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  textContentWrap: {
    marginBottom: 24,
  },
  paragraphText: {
    fontFamily: RospiereFonts.headline,
    textAlign: 'justify',
    marginBottom: 16,
  },
  dropCap: {
    fontFamily: RospiereFonts.headline,
    fontWeight: '700',
  },
  pullQuoteBox: {
    marginVertical: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderLeftWidth: 2,
  },
  pullQuoteText: {
    fontFamily: RospiereFonts.headlineItalic,
    fontStyle: 'italic',
  },
  pageFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)',
  },
  pageFooterText: {
    fontFamily: RospiereFonts.mono,
    fontSize: 10,
  },
  guideSection: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  guideHeader: {
    marginBottom: 18,
  },
  guidePreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  guidePreLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  guideTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 20,
    color: RospiereColors.onSurface,
  },
  guideCardsRow: {
    gap: 14,
  },
  guideCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTagLabel: {
    fontFamily: RospiereFonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  conceptTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 15,
    color: RospiereColors.onSurface,
    marginBottom: 6,
  },
  conceptExplanation: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 17,
  },
  conceptActionBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  conceptActionText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  editorialFooter: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerBrand: {
    fontFamily: RospiereFonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
  },
  footerLinksRow: {
    flexDirection: 'row',
    gap: 18,
  },
  footerLinkText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  pressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalInner: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 22,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 2,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  noteChapterTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14,
    color: RospiereColors.onSurface,
    marginBottom: 12,
  },
  savedNoteItem: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 14,
    marginBottom: 16,
  },
  savedNoteQuote: {
    fontFamily: RospiereFonts.headlineItalic,
    fontStyle: 'italic',
    fontSize: 12.5,
    color: RospiereColors.onSurface,
    marginBottom: 8,
  },
  savedNoteComment: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
  },
  modalCloseBtn: {
    backgroundColor: RospiereColors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  dictItem: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 12,
    marginBottom: 10,
  },
  dictTerm: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    color: RospiereColors.primary,
    marginBottom: 3,
  },
  dictDef: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 16,
  },
});
