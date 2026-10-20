import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';

const FILTER_PILLS = [
  'Todos (18)',
  'Comprensión profunda',
  'Trivia rápida',
  'Vocabulario',
  'Estructura narrativa',
];

export default function CuestionariosScreen() {
  const { quizzes, userStats, medals } = useRospiere();
  const [selectedFilter, setSelectedFilter] = useState('Todos (18)');

  const activeQuiz = quizzes.find((q) => q.tag === 'En curso') || quizzes[0];

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (selectedFilter === 'Todos (18)') return true;
    if (selectedFilter === 'Comprensión profunda') return quiz.category === 'deep';
    if (selectedFilter === 'Trivia rápida') return quiz.category === 'trivia';
    if (selectedFilter === 'Vocabulario') return quiz.category === 'vocabulary';
    if (selectedFilter === 'Estructura narrativa') return quiz.category === 'structure';
    return true;
  });

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
            <Text style={styles.introVolLabel}>VOLUMEN IV • COMPRENSIÓN</Text>
            <View style={styles.activeChallengesBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeChallengesText}>4 RETOS ACTIVOS</Text>
            </View>
          </View>

          <Text style={styles.introHeadline}>
            Evaluaciones <Text style={styles.headlineItalic}>y Retos</Text>
          </Text>
          <Text style={styles.introDesc}>
            Pon a prueba tu comprensión, retención y agudeza analítica sobre tus lecturas
            contemporáneas y clásicas.
          </Text>
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
                    {activeQuiz.bookAuthor} • Capítulos VII al XII
                  </Text>
                </View>
                <View style={styles.featuredPercentWrap}>
                  <Text style={styles.featuredPercent}>
                    {Math.round((activeQuiz.completedQuestions / activeQuiz.totalQuestions) * 100)}%
                  </Text>
                  <Text style={styles.featuredRatioText}>
                    {activeQuiz.completedQuestions} de {activeQuiz.totalQuestions} completadas
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
                    <Text style={styles.metricLabel}>ACIERTOS ESTIMADOS</Text>
                    <Text style={styles.metricValue}>6 / 7 verificados</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View>
                    <Text style={styles.metricLabel}>RITMO</Text>
                    <Text style={styles.metricValue}>{activeQuiz.estimatedTime}</Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.continueQuizBtn, pressed && styles.cardPressed]}
                  onPress={() => router.push(`/quiz/${activeQuiz.id}` as any)}>
                  <Text style={styles.continueQuizBtnText}>CONTINUAR</Text>
                  <MaterialIcons name="arrow-forward" size={15} color={RospiereColors.onPrimary} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Filter Pills (High-End Monochromatic) */}
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

        {/* Curated Literary Quizzes Grid */}
        <View style={styles.quizzesSection}>
          <View style={styles.quizzesHeader}>
            <Text style={styles.quizzesTitle}>Cuestionarios Destacados</Text>
            <Text style={styles.quizzesSubLabel}>SELECCIÓN DEL CURADOR</Text>
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
                      <Text style={styles.quizStatText}>
                        {quiz.approvalRate ? `${quiz.approvalRate} Aprobación` : quiz.estimatedTime}
                      </Text>
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
              <Text style={styles.statsPeriod}>Basado en evaluaciones registradas este trimestre</Text>
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
      </ScrollView>
    </View>
  );
}

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
    paddingBottom: 20,
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
    maxWidth: 320,
  },
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
});
