import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';

export default function QuizRunnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getQuiz, submitQuizAnswer } = useRospiere();

  const quiz = getQuiz(id || 'quiz-klara') || getQuiz('quiz-klara')!;
  const questions = quiz.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleVerify = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsAnswerChecked(true);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    submitQuizAnswer(quiz.id, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setQuizFinished(false);
  };

  const percentScore = Math.round((correctCount / questions.length) * 100);

  if (quizFinished) {
    return (
      <View style={styles.screen}>
        <RospiereHeader
          title="Resultado de la Evaluación"
          showBack
          onBack={() => router.back()}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.resultContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.resultCard}>
            <View style={styles.resultBadge}>
              <MaterialIcons name="auto-awesome" size={24} color={RospiereColors.primary} />
            </View>

            <Text style={styles.resultTag}>EVALUACIÓN CONCLUIDA</Text>
            <Text style={styles.resultTitle}>{quiz.bookTitle}</Text>
            <Text style={styles.resultScoreText}>{percentScore}% de Precisión</Text>
            <Text style={styles.resultRatio}>
              {correctCount} de {questions.length} respuestas correctas
            </Text>

            <View style={styles.resultDivider} />

            <View style={styles.accoladeUnlocked}>
              <MaterialIcons name="military-tech" size={28} color={RospiereColors.primary} />
              <View style={styles.accoladeTextWrap}>
                <Text style={styles.accoladeTitle}>Distinción Concedida</Text>
                <Text style={styles.accoladeDesc}>
                  Has demostrado comprensión analítica de los ejes simbólicos de {quiz.bookTitle}.
                </Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <Pressable
                style={styles.actionBtnPrimary}
                onPress={() => router.push(`/book/${quiz.bookId}` as any)}>
                <Text style={styles.actionBtnPrimaryText}>VOLVER AL LIBRO</Text>
                <MaterialIcons name="menu-book" size={15} color={RospiereColors.onPrimary} />
              </Pressable>

              <Pressable style={styles.actionBtnSecondary} onPress={handleRestart}>
                <Text style={styles.actionBtnSecondaryText}>REPETIR CUESTIONARIO</Text>
              </Pressable>

              <Pressable
                style={styles.actionBtnGhost}
                onPress={() => router.push('/(tabs)/cuestionarios')}>
                <Text style={styles.actionBtnGhostText}>EXPLORAR OTROS RETOS</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <RospiereHeader
        title={quiz.bookTitle}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Progress Header */}
        <View style={styles.quizHeader}>
          <View style={styles.quizHeaderTop}>
            <Text style={styles.quizHeaderLabel}>
              PREGUNTA {currentIndex + 1} DE {questions.length}
            </Text>
            <Text style={styles.quizHeaderTime}>
              <MaterialIcons name="timer" size={12} color={RospiereColors.secondary} /> 1m estimada
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Question Prompt */}
        <View style={styles.questionCard}>
          <Text style={styles.questionTopic}>ANÁLISIS CRÍTICO</Text>
          <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            return (
              <Pressable
                key={idx}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                  isAnswerChecked && isCorrect && styles.optionItemCorrect,
                  isAnswerChecked && isSelected && !isCorrect && styles.optionItemWrong,
                ]}
                onPress={() => handleSelectOption(idx)}>
                <View style={styles.optionIndexBox}>
                  <Text style={styles.optionIndexLetter}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    isAnswerChecked && isCorrect && styles.optionTextCorrect,
                    isAnswerChecked && isSelected && !isCorrect && styles.optionTextWrong,
                  ]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Explanation Card when checked */}
        {isAnswerChecked && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <MaterialIcons
                name={
                  selectedOption === currentQuestion.correctIndex
                    ? 'check-circle'
                    : 'info'
                }
                size={18}
                color={
                  selectedOption === currentQuestion.correctIndex
                    ? RospiereColors.primary
                    : RospiereColors.secondary
                }
              />
              <Text style={styles.explanationTitle}>
                {selectedOption === currentQuestion.correctIndex
                  ? 'Acierto Curatorial'
                  : 'Nota Explicativa'}
              </Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        {/* Bottom Verify / Next Button */}
        <View style={styles.bottomBar}>
          {!isAnswerChecked ? (
            <Pressable
              style={[
                styles.primaryBtn,
                selectedOption === null && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={selectedOption === null}>
              <Text style={styles.primaryBtnText}>COMPROBAR RESPUESTA</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.primaryBtn} onPress={handleNext}>
              <Text style={styles.primaryBtnText}>
                {currentIndex < questions.length - 1 ? 'SIGUIENTE PREGUNTA' : 'VER RESULTADOS'}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color={RospiereColors.onPrimary} />
            </Pressable>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  quizHeader: {
    marginBottom: 20,
  },
  quizHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizHeaderLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    fontWeight: '700',
  },
  quizHeaderTime: {
    fontFamily: RospiereFonts.body,
    fontSize: 10.5,
    color: RospiereColors.secondary,
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: RospiereColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  questionCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  questionTopic: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.8,
    color: RospiereColors.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionPrompt: {
    fontFamily: RospiereFonts.headline,
    fontSize: 18,
    color: RospiereColors.onSurface,
    lineHeight: 25,
  },
  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  optionItem: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: RospiereColors.primary,
    backgroundColor: RospiereColors.surfaceContainerLow,
  },
  optionItemCorrect: {
    borderColor: RospiereColors.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  optionItemWrong: {
    borderColor: RospiereColors.error,
    backgroundColor: RospiereColors.errorContainer,
  },
  optionIndexBox: {
    width: 28,
    height: 28,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndexLetter: {
    fontFamily: RospiereFonts.mono,
    fontSize: 12,
    color: RospiereColors.primary,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.onSurface,
    lineHeight: 18,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  optionTextWrong: {
    color: RospiereColors.error,
  },
  explanationCard: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 16,
    marginBottom: 20,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  explanationTitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.5,
    color: RospiereColors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  explanationText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 18,
  },
  bottomBar: {
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: RospiereColors.primary,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 2,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  resultContainer: {
    padding: 24,
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },
  resultBadge: {
    width: 52,
    height: 52,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTag: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 22,
    color: RospiereColors.onSurface,
    textAlign: 'center',
    marginBottom: 10,
  },
  resultScoreText: {
    fontFamily: RospiereFonts.headline,
    fontSize: 32,
    color: RospiereColors.primary,
    marginVertical: 4,
  },
  resultRatio: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.secondary,
  },
  resultDivider: {
    width: '100%',
    height: 1,
    backgroundColor: RospiereColors.surfaceContainerLow,
    marginVertical: 20,
  },
  accoladeUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 14,
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  accoladeTextWrap: {
    flex: 1,
  },
  accoladeTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    color: RospiereColors.onSurface,
    marginBottom: 2,
  },
  accoladeDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 10.5,
    color: RospiereColors.secondary,
    lineHeight: 15,
  },
  resultActions: {
    width: '100%',
    gap: 10,
  },
  actionBtnPrimary: {
    backgroundColor: RospiereColors.primary,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnPrimaryText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    backgroundColor: RospiereColors.surfaceContainerHigh,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  actionBtnGhost: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnGhostText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: RospiereColors.secondary,
    textDecorationLine: 'underline',
  },
});
