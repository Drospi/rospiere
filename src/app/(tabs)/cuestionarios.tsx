import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { Book } from '@/types/rospiere';

const FILTER_PILLS = [
  'Todos',
  'Comprensión profunda',
  'Trivia rápida',
  'Vocabulario',
  'Estructura narrativa',
];

export default function CuestionariosScreen() {
  const {
    quizzes,
    userStats,
    medals,
    books,
    challenges,
    addChallenge,
    updateChallengeProgress,
    generateQuizWithAI,
    aiApiKey,
    aiProvider,
  } = useRospiere();

  // Top tabs: Evaluaciones vs Retos
  const [mainTab, setMainTab] = useState<'evaluaciones' | 'retos'>('evaluaciones');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Quiz Generation Modal States
  const [generateQuizModalVisible, setGenerateQuizModalVisible] = useState(false);
  const [selectedBookForQuiz, setSelectedBookForQuiz] = useState<Book>(books[0] || INITIAL_BOOK_FALLBACK);
  const [quizTopicInput, setQuizTopicInput] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Create Challenge Modal States
  const [createChallengeModalVisible, setCreateChallengeModalVisible] = useState(false);
  const [selectedBookForChallenge, setSelectedBookForChallenge] = useState<Book>(books[0] || INITIAL_BOOK_FALLBACK);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [challengeType, setChallengeType] = useState<'chapters' | 'quiz_score' | 'daily_streak' | 'essay'>('chapters');
  const [challengeTargetCount, setChallengeTargetCount] = useState<number>(5);
  const [challengeDays, setChallengeDays] = useState<number>(7);
  const [challengeRewardXp, setChallengeRewardXp] = useState<number>(200);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeQuiz = quizzes.find((q) => q.tag === 'En curso') || quizzes[0];

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Comprensión profunda') return quiz.category === 'deep';
    if (selectedFilter === 'Trivia rápida') return quiz.category === 'trivia';
    if (selectedFilter === 'Vocabulario') return quiz.category === 'vocabulary';
    if (selectedFilter === 'Estructura narrativa') return quiz.category === 'structure';
    return true;
  });

  const activeChallengesCount = challenges.filter((c) => c.status === 'active').length;
  const completedChallengesCount = challenges.filter((c) => c.status === 'completed').length;
  const totalXp = challenges
    .filter((c) => c.status === 'completed')
    .reduce((acc, c) => acc + c.xpReward, 450);

  // Trigger AI quiz generation
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const generated = await generateQuizWithAI(
        selectedBookForQuiz.title,
        selectedBookForQuiz.author,
        quizTopicInput.trim() || undefined
      );
      setIsGeneratingQuiz(false);
      setGenerateQuizModalVisible(false);
      setQuizTopicInput('');
      showToast(`¡Cuestionario sobre «${selectedBookForQuiz.title}» creado exitosamente!`);
      // Navigate to created quiz directly
      setTimeout(() => {
        router.push(`/quiz/${generated.id}` as any);
      }, 500);
    } catch {
      setIsGeneratingQuiz(false);
      showToast('No se pudo generar el cuestionario. Intenta de nuevo.');
    }
  };

  // Suggest Challenge with AI
  const handleSuggestChallenge = () => {
    const bookTitle = selectedBookForChallenge.title;
    const lower = bookTitle.toLowerCase();

    if (lower.includes('odisea')) {
      setChallengeTitle('Travesía de Ítaca: 5 Cantos en 7 Días');
      setChallengeDesc('Lee y anota las pruebas de Odiseo analizando el concepto homérico de la astucia frente a la fuerza.');
      setChallengeType('chapters');
      setChallengeTargetCount(5);
      setChallengeDays(7);
      setChallengeRewardXp(250);
    } else if (lower.includes('soledad')) {
      setChallengeTitle('Memoria de Macondo: Cuestionario al 100%');
      setChallengeDesc('Supera la evaluación analítica sobre la soledad de los Buendía y el tiempo circular.');
      setChallengeType('quiz_score');
      setChallengeTargetCount(1);
      setChallengeDays(5);
      setChallengeRewardXp(300);
    } else if (lower.includes('klara')) {
      setChallengeTitle('Ensayo Socrático: El Sol como Gracia');
      setChallengeDesc('Lectura de 3 capítulos identificando contrastes entre la inocencia artificial y la fragilidad humana.');
      setChallengeType('chapters');
      setChallengeTargetCount(3);
      setChallengeDays(6);
      setChallengeRewardXp(180);
    } else {
      setChallengeTitle(`Inmersión Crítica: «${bookTitle}»`);
      setChallengeDesc(`Completar 4 capítulos y reflexionar sobre la voz narrativa y los dilemas éticos de la obra.`);
      setChallengeType('chapters');
      setChallengeTargetCount(4);
      setChallengeDays(7);
      setChallengeRewardXp(200);
    }
  };

  // Save new challenge
  const handleCreateChallenge = () => {
    const title = challengeTitle.trim() || `Reto: ${selectedBookForChallenge.title}`;
    const desc = challengeDesc.trim() || `Completar el objetivo fijado para ${selectedBookForChallenge.title}.`;

    addChallenge({
      bookId: selectedBookForChallenge.id,
      bookTitle: selectedBookForChallenge.title,
      bookAuthor: selectedBookForChallenge.author,
      title,
      description: desc,
      type: challengeType,
      targetCount: challengeTargetCount,
      daysRemaining: challengeDays,
      xpReward: challengeRewardXp,
      medalName: `Distinción ${selectedBookForChallenge.title.slice(0, 16)}`,
    });

    setCreateChallengeModalVisible(false);
    setChallengeTitle('');
    setChallengeDesc('');
    showToast('¡Nuevo reto literario activado en tu perfil!');
  };

  return (
    <View style={styles.screen}>
      <RospiereHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Editorial Page Intro */}
        <View style={styles.introSection}>
          <View style={styles.introTopRow}>
            <Text style={styles.introVolLabel}>VOLUMEN IV • COMPRENSIÓN & RETOS</Text>
            <View style={styles.activeChallengesBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeChallengesText}>
                {activeChallengesCount} RETOS ACTIVOS • {totalXp} XP
              </Text>
            </View>
          </View>

          <Text style={styles.introHeadline}>
            Evaluaciones <Text style={styles.headlineItalic}>y Retos</Text>
          </Text>
          <Text style={styles.introDesc}>
            Pon a prueba tu retención crítica, genera cuestionarios con IA y activa metas
            literarias para cualquier obra de tu biblioteca.
          </Text>
        </View>

        {/* High-End Main Navigation Tabs: Evaluaciones vs Retos */}
        <View style={styles.mainTabsContainer}>
          <Pressable
            style={[styles.mainTabBtn, mainTab === 'evaluaciones' && styles.mainTabBtnActive]}
            onPress={() => setMainTab('evaluaciones')}>
            <MaterialIcons
              name="quiz"
              size={16}
              color={mainTab === 'evaluaciones' ? RospiereColors.onPrimary : RospiereColors.onSurfaceVariant}
            />
            <Text style={[styles.mainTabText, mainTab === 'evaluaciones' && styles.mainTabTextActive]}>
              EVALUACIONES ({quizzes.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.mainTabBtn, mainTab === 'retos' && styles.mainTabBtnActive]}
            onPress={() => setMainTab('retos')}>
            <MaterialIcons
              name="emoji-events"
              size={16}
              color={mainTab === 'retos' ? RospiereColors.onPrimary : RospiereColors.onSurfaceVariant}
            />
            <Text style={[styles.mainTabText, mainTab === 'retos' && styles.mainTabTextActive]}>
              RETOS LITERARIOS ({challenges.length})
            </Text>
          </Pressable>
        </View>

        {/* ======================================================== */}
        {/* TAB 1: EVALUACIONES                                      */}
        {/* ======================================================== */}
        {mainTab === 'evaluaciones' && (
          <View>
            {/* AI Generator Action Card */}
            <View style={styles.aiGeneratorCard}>
              <View style={styles.aiGeneratorTopRow}>
                <View style={styles.aiProviderBadge}>
                  <MaterialIcons name="auto-awesome" size={13} color={RospiereColors.primary} />
                  <Text style={styles.aiProviderBadgeText}>
                    {aiApiKey ? `MOTOR IA • ${aiProvider.toUpperCase()}` : 'AGENTE LOCAL • OFFLINE'}
                  </Text>
                </View>
                <Text style={styles.aiBadgeSub}>SOCRÁTICO</Text>
              </View>

              <Text style={styles.aiGeneratorTitle}>Generar Cuestionario con IA</Text>
              <Text style={styles.aiGeneratorDesc}>
                Elige cualquier libro de tu colección o tomo EPUB para formular una evaluación analítica
                con explicaciones socráticas inmediatas.
              </Text>

              <Pressable
                style={({ pressed }) => [styles.generateQuizBtn, pressed && styles.cardPressed]}
                onPress={() => {
                  if (books.length > 0) setSelectedBookForQuiz(books[0]);
                  setGenerateQuizModalVisible(true);
                }}>
                <MaterialIcons name="psychology" size={16} color={RospiereColors.onPrimary} />
                <Text style={styles.generateQuizBtnText}>GENERAR NUEVO CUESTIONARIO CON IA</Text>
              </Pressable>
            </View>

            {/* In-Progress Reading Quiz: Featured Asymmetrical Card */}
            {activeQuiz && (
              <View style={styles.featuredSection}>
                <View style={styles.featuredCard}>
                  <View style={styles.featuredHeaderRow}>
                    <View style={styles.featuredTitleWrap}>
                      <Text style={styles.featuredTagText}>EN CURSO • SESIÓN ACTIVA</Text>
                      <Text style={styles.featuredBookTitle}>{activeQuiz.bookTitle}</Text>
                      <Text style={styles.featuredSubtitle}>
                        {activeQuiz.bookAuthor} • {activeQuiz.title}
                      </Text>
                    </View>
                    <View style={styles.featuredPercentWrap}>
                      <Text style={styles.featuredPercent}>
                        {Math.round((activeQuiz.completedQuestions / activeQuiz.totalQuestions) * 100)}%
                      </Text>
                      <Text style={styles.featuredRatioText}>
                        {activeQuiz.completedQuestions} de {activeQuiz.totalQuestions} preguntas
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round(
                            (activeQuiz.completedQuestions / activeQuiz.totalQuestions) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>

                  {/* Card Meta & Action */}
                  <View style={styles.featuredBottomRow}>
                    <View style={styles.featuredMetricsRow}>
                      <View>
                        <Text style={styles.metricLabel}>PREGUNTAS</Text>
                        <Text style={styles.metricValue}>{activeQuiz.questionCount} totales</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View>
                        <Text style={styles.metricLabel}>DURACIÓN</Text>
                        <Text style={styles.metricValue}>{activeQuiz.estimatedTime}</Text>
                      </View>
                    </View>

                    <Pressable
                      style={({ pressed }) => [styles.continueQuizBtn, pressed && styles.cardPressed]}
                      onPress={() => router.push(`/quiz/${activeQuiz.id}` as any)}>
                      <Text style={styles.continueQuizBtnText}>RESOLVER</Text>
                      <MaterialIcons name="arrow-forward" size={15} color={RospiereColors.onPrimary} />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}>
              {FILTER_PILLS.map((pill) => {
                const isActive = selectedFilter === pill;
                return (
                  <Pressable
                    key={pill}
                    style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
                    onPress={() => setSelectedFilter(pill)}>
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                      ]}>
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Curated & Generated Literary Quizzes Grid */}
            <View style={styles.quizzesSection}>
              <View style={styles.quizzesHeader}>
                <Text style={styles.quizzesTitle}>Cuestionarios Disponibles</Text>
                <Text style={styles.quizzesSubLabel}>COLECCIÓN LUMIERE & IA</Text>
              </View>

              <View style={styles.quizzesList}>
                {filteredQuizzes.map((quiz) => (
                  <Pressable
                    key={quiz.id}
                    style={({ pressed }) => [styles.quizCard, pressed && styles.cardPressed]}
                    onPress={() => router.push(`/quiz/${quiz.id}` as any)}>
                    <View style={styles.quizCoverWrap}>
                      <Image
                        source={{ uri: quiz.coverImage }}
                        style={styles.quizCover}
                        resizeMode="cover"
                      />
                      <View style={styles.quizTagBadge}>
                        <Text style={styles.quizTagText}>{quiz.tag}</Text>
                      </View>
                    </View>

                    <View style={styles.quizContent}>
                      <View>
                        <View style={styles.quizMetaTop}>
                          <Text style={styles.quizAuthor}>{quiz.bookAuthor.toUpperCase()}</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.quizLevel}>{quiz.level.toUpperCase()}</Text>
                          {quiz.hasGoldMedal && (
                            <View style={styles.goldBadge}>
                              <MaterialIcons name="stars" size={12} color={RospiereColors.primary} />
                              <Text style={styles.goldBadgeText}>MEDALLA</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.quizTitle} numberOfLines={2}>
                          {quiz.title}
                        </Text>
                        <Text style={styles.quizDesc} numberOfLines={2}>
                          {quiz.description}
                        </Text>
                      </View>

                      <View style={styles.quizBottomRow}>
                        <View style={styles.quizStatRow}>
                          <Text style={styles.quizStatText}>{quiz.questionCount} Preguntas</Text>
                          <Text style={styles.metaDot}>•</Text>
                          <Text style={styles.quizStatText}>{quiz.estimatedTime}</Text>
                        </View>

                        <Pressable
                          style={styles.startQuizBtn}
                          onPress={() => router.push(`/quiz/${quiz.id}` as any)}>
                          <Text style={styles.startQuizBtnText}>COMENZAR</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Reader Stats & High-End Minimal Medals */}
            <View style={styles.statsSection}>
              <View style={styles.statsCard}>
                <View style={styles.statsHeaderRow}>
                  <View>
                    <Text style={styles.statsPreLabel}>MÉTRICAS DE RETENCIÓN</Text>
                    <Text style={styles.statsTitle}>Estadísticas del Lector</Text>
                  </View>
                  <Text style={styles.statsPeriod}>Basado en evaluaciones registradas este ciclo</Text>
                </View>

                {/* Numeric Highlights */}
                <View style={styles.numbersGrid}>
                  <View style={styles.numBox}>
                    <Text style={styles.numValue}>{userStats.evaluatedBooks}</Text>
                    <Text style={styles.numLabel}>LIBROS EVALUADOS</Text>
                  </View>
                  <View style={styles.numBox}>
                    <Text style={styles.numValue}>{userStats.accuracyPercent}%</Text>
                    <Text style={styles.numLabel}>ACIERTOS GLOBALES</Text>
                  </View>
                  <View style={styles.numBox}>
                    <Text style={styles.numValue}>{userStats.streakDays}</Text>
                    <Text style={styles.numLabel}>DÍAS EN RACHA</Text>
                  </View>
                </View>

                {/* Minimalist Literary Medals */}
                <View style={styles.medalsContainer}>
                  <Text style={styles.medalsHeading}>DISTINCIONES OBTENIDAS</Text>
                  <View style={styles.medalsGrid}>
                    {medals.map((medal) => (
                      <View key={medal.id} style={styles.medalCard}>
                        <View style={styles.medalIconSquare}>
                          <MaterialIcons
                            name={medal.icon as any}
                            size={20}
                            color={RospiereColors.primary}
                          />
                        </View>
                        <View style={styles.medalTextWrap}>
                          <Text style={styles.medalTitle} numberOfLines={1}>
                            {medal.name}
                          </Text>
                          <Text style={styles.medalSub} numberOfLines={1}>
                            {medal.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RETOS LITERARIOS                                  */}
        {/* ======================================================== */}
        {mainTab === 'retos' && (
          <View style={styles.challengesTabContent}>
            {/* Create Challenge Banner */}
            <View style={styles.createChallengeBanner}>
              <View style={styles.challengeBannerTopRow}>
                <View style={styles.trophyIconWrap}>
                  <MaterialIcons name="military-tech" size={24} color={RospiereColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.challengeBannerPre}>DESAFÍOS EDITORIALES</Text>
                  <Text style={styles.challengeBannerTitle}>Crea tus Propios Retos</Text>
                </View>
              </View>

              <Text style={styles.challengeBannerDesc}>
                Selecciona cualquier libro de tu biblioteca (clásicos o EPUBs importados) y fija metas
                de lectura, constancia diaria o comprensión crítica.
              </Text>

              <Pressable
                style={({ pressed }) => [styles.openCreateChallengeBtn, pressed && styles.cardPressed]}
                onPress={() => {
                  if (books.length > 0) {
                    setSelectedBookForChallenge(books[0]);
                    handleSuggestChallenge();
                  }
                  setCreateChallengeModalVisible(true);
                }}>
                <MaterialIcons name="add" size={18} color={RospiereColors.onPrimary} />
                <Text style={styles.openCreateChallengeBtnText}>CREAR NUEVO RETO</Text>
              </Pressable>
            </View>

            {/* Challenges Stats Strip */}
            <View style={styles.challengeStatsStrip}>
              <View style={styles.challengeStatItem}>
                <Text style={styles.challengeStatNum}>{activeChallengesCount}</Text>
                <Text style={styles.challengeStatLabel}>RETOS ACTIVOS</Text>
              </View>
              <View style={styles.challengeStatDivider} />
              <View style={styles.challengeStatItem}>
                <Text style={styles.challengeStatNum}>{completedChallengesCount}</Text>
                <Text style={styles.challengeStatLabel}>COMPLETADOS</Text>
              </View>
              <View style={styles.challengeStatDivider} />
              <View style={styles.challengeStatItem}>
                <Text style={styles.challengeStatNum}>{totalXp}</Text>
                <Text style={styles.challengeStatLabel}>XP OBTENIDOS</Text>
              </View>
            </View>

            {/* List of Challenges */}
            <View style={styles.challengesListSection}>
              <View style={styles.challengesListHeader}>
                <Text style={styles.challengesListTitle}>Tus Retos Activos y Superados</Text>
                <Text style={styles.challengesListSub}>PROGRESO PERSONAL</Text>
              </View>

              <View style={styles.challengesGrid}>
                {challenges.map((ch) => {
                  const isDone = ch.status === 'completed';
                  const percent = Math.min(100, Math.round((ch.currentCount / ch.targetCount) * 100));

                  return (
                    <View
                      key={ch.id}
                      style={[styles.challengeItemCard, isDone && styles.challengeItemCardDone]}>
                      <View style={styles.challengeItemHeader}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.challengeItemBookTag}>
                            {ch.bookTitle} • {ch.bookAuthor}
                          </Text>
                          <Text style={styles.challengeItemTitle}>{ch.title}</Text>
                        </View>
                        <View
                          style={[
                            styles.challengeBadgeStatus,
                            isDone ? styles.badgeDone : styles.badgeActive,
                          ]}>
                          <Text
                            style={[
                              styles.challengeBadgeStatusText,
                              isDone ? styles.badgeDoneText : styles.badgeActiveText,
                            ]}>
                            {isDone ? 'COMPLETADO' : `${ch.daysRemaining} DÍAS`}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.challengeItemDesc}>{ch.description}</Text>

                      {/* Progress Track */}
                      <View style={styles.challengeProgressRow}>
                        <View style={styles.challengeProgressBarTrack}>
                          <View
                            style={[
                              styles.challengeProgressBarFill,
                              { width: `${percent}%` },
                              isDone && { backgroundColor: '#3A7D44' },
                            ]}
                          />
                        </View>
                        <Text style={styles.challengeProgressRatio}>
                          {ch.currentCount} / {ch.targetCount} ({percent}%)
                        </Text>
                      </View>

                      {/* Footer Actions */}
                      <View style={styles.challengeFooterRow}>
                        <View style={styles.rewardXpBadge}>
                          <MaterialIcons
                            name={isDone ? 'verified' : 'military-tech'}
                            size={14}
                            color={isDone ? '#3A7D44' : RospiereColors.primary}
                          />
                          <Text
                            style={[
                              styles.rewardXpText,
                              isDone && { color: '#3A7D44', fontWeight: '700' },
                            ]}>
                            +{ch.xpReward} XP
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {!isDone && (
                            <Pressable
                              style={styles.advanceChallengeBtn}
                              onPress={() => {
                                updateChallengeProgress(ch.id, 1);
                                showToast(`¡Progreso registrado en «${ch.title}»!`);
                              }}>
                              <MaterialIcons name="add" size={14} color={RospiereColors.onPrimary} />
                              <Text style={styles.advanceChallengeBtnText}>AVANZAR (+1)</Text>
                            </Pressable>
                          )}

                          <Pressable
                            style={styles.goToBookBtn}
                            onPress={() => {
                              if (ch.bookId.includes('odisea') || ch.bookId.startsWith('custom-')) {
                                router.push(`/epub/reader?id=${ch.bookId}` as any);
                              } else {
                                router.push(`/book/${ch.bookId}` as any);
                              }
                            }}>
                            <MaterialIcons name="menu-book" size={13} color={RospiereColors.primary} />
                            <Text style={styles.goToBookBtnText}>IR A LA OBRA</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL: GENERAR CUESTIONARIO CON IA                       */}
      {/* ======================================================== */}
      <Modal
        visible={generateQuizModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGenerateQuizModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setGenerateQuizModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalSubLabel}>GENERADOR EDITORIAL LUMIERE</Text>
                  <View style={styles.aiTagBadge}>
                    <Text style={styles.aiTagBadgeText}>
                      {aiApiKey ? `API ${aiProvider.toUpperCase()}` : 'AGENTE LOCAL'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>Crear Cuestionario con IA</Text>
              </View>
              <Pressable onPress={() => setGenerateQuizModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.modalInstruction}>
              Selecciona una obra de tu biblioteca y especifica un tema o capítulo para formular
              preguntas críticas con explicaciones socráticas.
            </Text>

            {/* Book Selector */}
            <Text style={styles.inputFieldLabel}>OBRA A EVALUAR</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookSelectorScroll}>
              {books.map((b) => {
                const isSelected = selectedBookForQuiz.id === b.id;
                return (
                  <Pressable
                    key={b.id}
                    style={[styles.bookSelectorCard, isSelected && styles.bookSelectorCardSelected]}
                    onPress={() => setSelectedBookForQuiz(b)}>
                    <Image source={{ uri: b.coverImage }} style={styles.bookSelectorCover} />
                    <Text style={styles.bookSelectorTitle} numberOfLines={1}>
                      {b.title}
                    </Text>
                    <Text style={styles.bookSelectorAuthor} numberOfLines={1}>
                      {b.author}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Section / Chapter Input */}
            <Text style={styles.inputFieldLabel}>SECCIÓN, CANTO O TEMA (OPCIONAL)</Text>
            <TextInput
              value={quizTopicInput}
              onChangeText={setQuizTopicInput}
              placeholder="Ej. Canto I, Simbolismo solar, Capítulo VII..."
              placeholderTextColor="#888888"
              style={styles.modalTextInput}
            />

            {/* Submit Button */}
            <View style={styles.modalActionsRow}>
              <Pressable
                style={[styles.modalSecondaryBtn, isGeneratingQuiz && styles.btnDisabled]}
                disabled={isGeneratingQuiz}
                onPress={() => setGenerateQuizModalVisible(false)}>
                <Text style={styles.modalSecondaryBtnText}>CANCELAR</Text>
              </Pressable>

              <Pressable
                style={[styles.modalPrimaryBtn, isGeneratingQuiz && styles.btnDisabled]}
                disabled={isGeneratingQuiz}
                onPress={handleGenerateQuiz}>
                {isGeneratingQuiz ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={RospiereColors.onPrimary} />
                    <Text style={styles.modalPrimaryBtnText}>CREANDO PREGUNTAS...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name="auto-awesome" size={16} color={RospiereColors.onPrimary} />
                    <Text style={styles.modalPrimaryBtnText}>GENERAR EVALUACIÓN</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVO RETO LITERARIO                         */}
      {/* ======================================================== */}
      <Modal
        visible={createChallengeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateChallengeModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCreateChallengeModalVisible(false)}>
          <Pressable
            style={[styles.modalCard, { maxHeight: '90%' }]}
            onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalSubLabel}>DESAFÍO PERSONALIZADO</Text>
                  <Text style={styles.modalTitle}>Crear Nuevo Reto Literario</Text>
                </View>
                <Pressable onPress={() => setCreateChallengeModalVisible(false)} hitSlop={10}>
                  <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
                </Pressable>
              </View>

              {/* 1. Select Book */}
              <Text style={styles.inputFieldLabel}>1. SELECCIONA LA OBRA PARA EL RETO</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookSelectorScroll}>
                {books.map((b) => {
                  const isSelected = selectedBookForChallenge.id === b.id;
                  return (
                    <Pressable
                      key={b.id}
                      style={[styles.bookSelectorCard, isSelected && styles.bookSelectorCardSelected]}
                      onPress={() => {
                        setSelectedBookForChallenge(b);
                      }}>
                      <Image source={{ uri: b.coverImage }} style={styles.bookSelectorCover} />
                      <Text style={styles.bookSelectorTitle} numberOfLines={1}>
                        {b.title}
                      </Text>
                      <Text style={styles.bookSelectorAuthor} numberOfLines={1}>
                        {b.author}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* AI Auto-suggest Button */}
              <Pressable
                style={styles.aiSuggestChallengeBtn}
                onPress={handleSuggestChallenge}>
                <MaterialIcons name="auto-awesome" size={14} color={RospiereColors.primary} />
                <Text style={styles.aiSuggestChallengeBtnText}>
                  ✨ SUGERIR RETO CON IA PARA «{selectedBookForChallenge.title.slice(0, 18)}...»
                </Text>
              </Pressable>

              {/* 2. Challenge Title */}
              <Text style={styles.inputFieldLabel}>2. TÍTULO DEL RETO</Text>
              <TextInput
                value={challengeTitle}
                onChangeText={setChallengeTitle}
                placeholder="Ej. Maratón de 5 Cantos en 7 Días"
                placeholderTextColor="#888888"
                style={styles.modalTextInput}
              />

              {/* 3. Challenge Description */}
              <Text style={styles.inputFieldLabel}>3. DESCRIPCIÓN DEL RETO</Text>
              <TextInput
                value={challengeDesc}
                onChangeText={setChallengeDesc}
                placeholder="Explica el objetivo de lectura o comprensión socrática..."
                placeholderTextColor="#888888"
                multiline
                numberOfLines={2}
                style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
              />

              {/* 4. Challenge Goal Type */}
              <Text style={styles.inputFieldLabel}>4. TIPO DE META</Text>
              <View style={styles.typeButtonsRow}>
                {[
                  { id: 'chapters', label: 'Capítulos / Cantos' },
                  { id: 'quiz_score', label: 'Cuestionario 100%' },
                  { id: 'daily_streak', label: 'Racha Diaria' },
                  { id: 'essay', label: 'Análisis Crítico' },
                ].map((t) => {
                  const isSelected = challengeType === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      style={[styles.typePill, isSelected && styles.typePillActive]}
                      onPress={() => setChallengeType(t.id as any)}>
                      <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 5. Metrics & Deadlines */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>OBJETIVO (CANTIDAD)</Text>
                  <View style={styles.numericPillsRow}>
                    {[3, 5, 7, 10].map((num) => (
                      <Pressable
                        key={num}
                        style={[styles.numPill, challengeTargetCount === num && styles.numPillActive]}
                        onPress={() => setChallengeTargetCount(num)}>
                        <Text
                          style={[
                            styles.numPillText,
                            challengeTargetCount === num && styles.numPillTextActive,
                          ]}>
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>PLAZO (DÍAS)</Text>
                  <View style={styles.numericPillsRow}>
                    {[3, 7, 14, 30].map((days) => (
                      <Pressable
                        key={days}
                        style={[styles.numPill, challengeDays === days && styles.numPillActive]}
                        onPress={() => setChallengeDays(days)}>
                        <Text
                          style={[
                            styles.numPillText,
                            challengeDays === days && styles.numPillTextActive,
                          ]}>
                          {days}d
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* 6. XP Reward */}
              <Text style={[styles.inputFieldLabel, { marginTop: 12 }]}>RECOMPENSA XP</Text>
              <View style={styles.numericPillsRow}>
                {[150, 200, 250, 300].map((xp) => (
                  <Pressable
                    key={xp}
                    style={[styles.numPill, challengeRewardXp === xp && styles.numPillActive]}
                    onPress={() => setChallengeRewardXp(xp)}>
                    <Text
                      style={[
                        styles.numPillText,
                        challengeRewardXp === xp && styles.numPillTextActive,
                      ]}>
                      +{xp} XP
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Submit Buttons */}
              <View style={[styles.modalActionsRow, { marginTop: 20 }]}>
                <Pressable
                  style={styles.modalSecondaryBtn}
                  onPress={() => setCreateChallengeModalVisible(false)}>
                  <Text style={styles.modalSecondaryBtnText}>CANCELAR</Text>
                </Pressable>

                <Pressable style={styles.modalPrimaryBtn} onPress={handleCreateChallenge}>
                  <Text style={styles.modalPrimaryBtnText}>GUARDAR Y ACTIVAR RETO</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================== */}
      {/* TOAST NOTIFICATION BADGE                                 */}
      {/* ======================================================== */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <View style={styles.toastCard}>
            <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const INITIAL_BOOK_FALLBACK: Book = {
  id: 'odisea-homero',
  title: 'La Odisea',
  author: 'Homero',
  coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  category: 'Novedades',
  edition: 'Edición Crítica Bilingüe Jónica',
  rating: 4.9,
  remainingTime: '14h 20m',
  pagesTotal: 440,
  currentPage: 184,
  isBookmarked: true,
  status: 'reading',
  synopsis: 'El regreso épico de Odiseo a Ítaca.',
  sampleChapter: {
    chapterNumber: 'Canto 1',
    part: 'I',
    title: 'Concilio de los dioses',
    quote: '«Háblame, Musa...»',
    content: ['Texto de apertura...'],
  },
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: RospiereColors.surface,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  introTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  introVolLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2.2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
  },
  activeChallengesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: RospiereColors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RospiereColors.primary,
  },
  activeChallengesText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: RospiereColors.onSurface,
    fontWeight: '700',
  },
  introHeadline: {
    fontFamily: RospiereFonts.headline,
    fontSize: 28,
    color: RospiereColors.onSurface,
    lineHeight: 34,
  },
  headlineItalic: {
    fontFamily: RospiereFonts.headlineItalic,
    fontStyle: 'italic',
  },
  introDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 340,
  },

  // Main Tabs (Evaluaciones vs Retos)
  mainTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  mainTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: RospiereColors.surfaceContainer,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabBtnActive: {
    backgroundColor: RospiereColors.primary,
    borderBottomColor: RospiereColors.primary,
  },
  mainTabText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.5,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
  },
  mainTabTextActive: {
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },

  // AI Generator Card
  aiGeneratorCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    backgroundColor: RospiereColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: RospiereColors.outlineVariant,
  },
  aiGeneratorTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiProviderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiProviderBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  aiBadgeSub: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
  },
  aiGeneratorTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 18,
    color: RospiereColors.onSurface,
    marginBottom: 4,
  },
  aiGeneratorDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 17,
    marginBottom: 14,
  },
  generateQuizBtn: {
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
  },
  generateQuizBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },

  // In-Progress Quiz
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuredCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featuredTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  featuredTagText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.8,
    color: RospiereColors.onSurfaceVariant,
    marginBottom: 4,
    fontWeight: '600',
  },
  featuredBookTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 19,
    color: RospiereColors.onSurface,
  },
  featuredSubtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.secondary,
    marginTop: 2,
  },
  featuredPercentWrap: {
    alignItems: 'flex-end',
  },
  featuredPercent: {
    fontFamily: RospiereFonts.headline,
    fontSize: 24,
    color: RospiereColors.onSurface,
    lineHeight: 28,
  },
  featuredRatioText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: RospiereColors.onSurfaceVariant,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: RospiereColors.surfaceContainerHigh,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  featuredBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  featuredMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  metricValue: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12,
    color: RospiereColors.onSurface,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: RospiereColors.outlineVariant,
    opacity: 0.4,
  },
  continueQuizBtn: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueQuizBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.8,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },

  // Filters
  filterPillsScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterPillActive: {
    backgroundColor: RospiereColors.primary,
  },
  filterPillInactive: {
    backgroundColor: RospiereColors.surfaceContainer,
  },
  filterPillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  filterPillTextActive: {
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: RospiereColors.onSurfaceVariant,
  },

  // Quizzes List
  quizzesSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  quizzesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  quizzesTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 20,
    color: RospiereColors.onSurface,
  },
  quizzesSubLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
  },
  quizzesList: {
    gap: 16,
  },
  quizCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.88,
  },
  quizCoverWrap: {
    width: 84,
    aspectRatio: 2 / 3,
    backgroundColor: RospiereColors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
  },
  quizCover: {
    width: '100%',
    height: '100%',
  },
  quizTagBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quizTagText: {
    fontFamily: RospiereFonts.label,
    fontSize: 7.5,
    letterSpacing: 1,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quizContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  quizMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  quizAuthor: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 9,
    color: RospiereColors.outlineVariant,
  },
  quizLevel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: RospiereColors.surfaceContainer,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  goldBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 7.5,
    letterSpacing: 0.8,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  quizTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14.5,
    color: RospiereColors.onSurface,
    lineHeight: 18,
    marginBottom: 4,
  },
  quizDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 16,
  },
  quizBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  quizStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quizStatText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    color: RospiereColors.secondary,
  },
  startQuizBtn: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  startQuizBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.6,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },

  // Stats & Medals
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  statsCard: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 22,
  },
  statsHeaderRow: {
    marginBottom: 18,
  },
  statsPreLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2.2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 2,
  },
  statsTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 22,
    color: RospiereColors.onSurface,
  },
  statsPeriod: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.secondary,
    marginTop: 3,
  },
  numbersGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  numBox: {
    flex: 1,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  numValue: {
    fontFamily: RospiereFonts.headline,
    fontSize: 24,
    color: RospiereColors.onSurface,
    marginBottom: 2,
  },
  numLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: RospiereColors.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '600',
  },
  medalsContainer: {
    borderTopWidth: 0,
  },
  medalsHeading: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 10,
  },
  medalsGrid: {
    gap: 8,
  },
  medalCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medalIconSquare: {
    width: 36,
    height: 36,
    backgroundColor: RospiereColors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalTextWrap: {
    flex: 1,
  },
  medalTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12.5,
    color: RospiereColors.onSurface,
  },
  medalSub: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
    color: RospiereColors.secondary,
    marginTop: 1,
  },

  // Challenges Tab
  challengesTabContent: {
    paddingTop: 4,
  },
  createChallengeBanner: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: RospiereColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: RospiereColors.outlineVariant,
    marginBottom: 18,
  },
  challengeBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  trophyIconWrap: {
    width: 42,
    height: 42,
    backgroundColor: RospiereColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeBannerPre: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.8,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  challengeBannerTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 20,
    color: RospiereColors.onSurface,
  },
  challengeBannerDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 17,
    marginBottom: 14,
  },
  openCreateChallengeBtn: {
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
  },
  openCreateChallengeBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },

  challengeStatsStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  challengeStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  challengeStatNum: {
    fontFamily: RospiereFonts.headline,
    fontSize: 22,
    color: RospiereColors.onSurface,
  },
  challengeStatLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
    marginTop: 2,
  },
  challengeStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: RospiereColors.outlineVariant,
    opacity: 0.4,
  },

  challengesListSection: {
    paddingHorizontal: 20,
  },
  challengesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  challengesListTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 18,
    color: RospiereColors.onSurface,
  },
  challengesListSub: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.8,
    color: RospiereColors.onSurfaceVariant,
  },
  challengesGrid: {
    gap: 14,
  },
  challengeItemCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: RospiereColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  challengeItemCardDone: {
    borderLeftColor: '#3A7D44',
    opacity: 0.9,
  },
  challengeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeItemBookTag: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  challengeItemTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 16,
    color: RospiereColors.onSurface,
  },
  challengeBadgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeActive: {
    backgroundColor: RospiereColors.surfaceContainerHigh,
  },
  badgeDone: {
    backgroundColor: '#E8F5E9',
  },
  challengeBadgeStatusText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  badgeActiveText: {
    color: RospiereColors.onSurface,
  },
  badgeDoneText: {
    color: '#2E7D32',
  },
  challengeItemDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 17,
    marginBottom: 12,
  },
  challengeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  challengeProgressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: RospiereColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  challengeProgressBarFill: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  challengeProgressRatio: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    color: RospiereColors.secondary,
  },
  challengeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 10,
  },
  rewardXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardXpText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1,
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  advanceChallengeBtn: {
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  advanceChallengeBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  goToBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: RospiereColors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  goToBookBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    fontWeight: '600',
  },

  // Modals Shared
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: RospiereColors.surface,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalSubLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  modalTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 20,
    color: RospiereColors.onSurface,
    marginTop: 2,
  },
  aiTagBadge: {
    backgroundColor: RospiereColors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiTagBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  modalInstruction: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 17,
    marginBottom: 16,
  },
  inputFieldLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: RospiereColors.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onSurface,
    marginBottom: 14,
  },
  bookSelectorScroll: {
    gap: 10,
    paddingBottom: 14,
  },
  bookSelectorCard: {
    width: 90,
    padding: 6,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  bookSelectorCardSelected: {
    borderColor: RospiereColors.primary,
    backgroundColor: RospiereColors.surfaceContainer,
  },
  bookSelectorCover: {
    width: 76,
    height: 106,
    marginBottom: 4,
    backgroundColor: RospiereColors.surfaceContainerHigh,
  },
  bookSelectorTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 10,
    color: RospiereColors.onSurface,
    textAlign: 'center',
  },
  bookSelectorAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 8.5,
    color: RospiereColors.secondary,
    textAlign: 'center',
  },
  aiSuggestChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: RospiereColors.surfaceContainer,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: RospiereColors.outlineVariant,
  },
  aiSuggestChallengeBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  typeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: RospiereColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typePillActive: {
    backgroundColor: RospiereColors.primary,
  },
  typePillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    color: RospiereColors.onSurfaceVariant,
  },
  typePillTextActive: {
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  numericPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numPill: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: RospiereColors.surfaceContainer,
    alignItems: 'center',
  },
  numPillActive: {
    backgroundColor: RospiereColors.primary,
  },
  numPillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    color: RospiereColors.onSurfaceVariant,
  },
  numPillTextActive: {
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: RospiereColors.surfaceContainer,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: RospiereColors.onSurface,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1.4,
    backgroundColor: RospiereColors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  toastCard: {
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
