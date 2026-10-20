import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';

const QUICK_PROMPTS = [
  '¿De qué trata este capítulo?',
  'Generar cuestionario de repaso',
  'Explicar simbolismo',
  'Recomiéndame una novela afín',
  'Analizar estilo de Ishiguro',
];

export default function AsistenteScreen() {
  const { chatMessages, sendMessage } = useRospiere();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<any>(null);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;
    sendMessage(text);
    if (!textToSend) setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <RospiereHeader title="Compañero Literario" />

      {/* Subheader: Companion Status Banner */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <View style={styles.aiAvatar}>
            <MaterialIcons name="psychology" size={20} color={RospiereColors.onPrimary} />
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.aiTitleWrap}>
            <View style={styles.aiNameRow}>
              <Text style={styles.aiName}>Compañero Literario</Text>
              <View style={styles.aiTag}>
                <Text style={styles.aiTagText}>ROSPIERE AI</Text>
              </View>
            </View>
            <Text style={styles.aiSubtitle}>En sintonía con tu estantería actual</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.tuneBtn, pressed && styles.pressed]}
          onPress={() => handleSend('¿Qué obras tienes indexadas para análisis curatorial?')}>
          <MaterialIcons name="tune" size={19} color={RospiereColors.secondary} />
        </Pressable>
      </View>

      {/* Quick Prompt Chips */}
      <View style={styles.quickPromptsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPromptsScroll}>
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              style={({ pressed }) => [styles.promptPill, pressed && styles.promptPillPressed]}
              onPress={() => handleSend(prompt)}>
              <Text style={styles.promptPillText}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {/* Timestamp Separator */}
        <View style={styles.sessionDivider}>
          <Text style={styles.sessionDividerText}>SESIÓN DE LECTURA ACTIVA • 2026</Text>
        </View>

        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <View key={msg.id} style={styles.userMessageRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{msg.text}</Text>
                </View>
                <Text style={styles.userTimestamp}>TÚ • {msg.timestamp}</Text>
              </View>
            );
          }

          return (
            <View key={msg.id} style={styles.botMessageRow}>
              <View style={styles.botAvatar}>
                <MaterialIcons name="auto-stories" size={15} color={RospiereColors.primary} />
              </View>

              <View style={styles.botBubbleWrap}>
                <View style={styles.botBubble}>
                  <Text style={styles.botText}>{msg.text}</Text>
                </View>

                {/* If message includes book recommendations */}
                {msg.bookCards && msg.bookCards.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.bookCardsScroll}>
                    {msg.bookCards.map((book) => (
                      <View key={book.id} style={styles.recCard}>
                        <View style={styles.recCoverWrap}>
                          <Image
                            source={{ uri: book.coverImage }}
                            style={styles.recCover}
                            resizeMode="cover"
                          />
                          <View style={styles.recBadge}>
                            <Text style={styles.recBadgeText}>{book.tag}</Text>
                          </View>
                        </View>

                        <View style={styles.recDetails}>
                          <Text style={styles.recTitle} numberOfLines={1}>
                            {book.title}
                          </Text>
                          <Text style={styles.recAuthor} numberOfLines={1}>
                            {book.author}
                          </Text>
                        </View>

                        <View style={styles.recActions}>
                          <Pressable
                            style={styles.recActionPrimary}
                            onPress={() => router.push(`/book/${book.id}` as any)}>
                            <Text style={styles.recActionPrimaryText}>VER DETALLES</Text>
                          </Pressable>
                          <Pressable
                            style={styles.recActionSecondary}
                            onPress={() => router.push(`/quiz/quiz-${book.id}` as any)}>
                            <Text style={styles.recActionSecondaryText}>VER CUESTIONARIO</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* If message includes quiz suggestion card */}
                {msg.quizCard && (
                  <View style={styles.quizSuggestCard}>
                    <View style={styles.quizSuggestLeft}>
                      <MaterialIcons name="fact-check" size={18} color={RospiereColors.primary} />
                      <Text style={styles.quizSuggestText}>{msg.quizCard.quizCountText}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push(`/quiz/${msg.quizCard?.quizId}` as any)}>
                      <Text style={styles.quizSuggestAction}>INICIAR MUESTRA</Text>
                    </Pressable>
                  </View>
                )}

                <Text style={styles.botTimestamp}>ROSPIERE • {msg.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputBarInner}>
          <Pressable
            style={styles.attachBtn}
            onPress={() => handleSend('Añadir fragmento de lectura actual')}>
            <MaterialIcons name="bookmark-add" size={19} color={RospiereColors.onSurface} />
          </Pressable>

          <View style={styles.inputBox}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Formula una pregunta o pide un análisis..."
              placeholderTextColor={RospiereColors.secondary}
              style={styles.textInput}
              multiline
              maxLength={400}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.sendBtn, pressed && styles.pressed]}
            onPress={() => handleSend()}>
            <MaterialIcons name="arrow-upward" size={18} color={RospiereColors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: RospiereColors.surface,
  },
  subHeader: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: RospiereColors.onSurface,
    borderWidth: 1.5,
    borderColor: RospiereColors.surfaceContainerLow,
  },
  aiTitleWrap: {
    justifyContent: 'center',
  },
  aiNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiName: {
    fontFamily: RospiereFonts.label,
    fontSize: 12,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  aiTag: {
    backgroundColor: RospiereColors.surfaceContainerHighest,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  aiTagText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
  },
  aiSubtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 10.5,
    color: RospiereColors.secondary,
    marginTop: 1,
  },
  tuneBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  quickPromptsWrap: {
    backgroundColor: RospiereColors.surface,
    paddingVertical: 10,
  },
  quickPromptsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  promptPill: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptPillPressed: {
    backgroundColor: RospiereColors.surfaceContainer,
  },
  promptPillText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: RospiereColors.onSurface,
    textTransform: 'uppercase',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 20,
  },
  sessionDivider: {
    alignItems: 'center',
    marginVertical: 4,
  },
  sessionDividerText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  userMessageRow: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: RospiereColors.primary,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  userText: {
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.onPrimary,
    lineHeight: 19,
  },
  userTimestamp: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
    marginTop: 4,
  },
  botMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: '92%',
  },
  botAvatar: {
    width: 28,
    height: 28,
    backgroundColor: RospiereColors.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  botBubbleWrap: {
    flex: 1,
  },
  botBubble: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  botText: {
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.onSurface,
    lineHeight: 20,
  },
  bookCardsScroll: {
    gap: 12,
    paddingVertical: 10,
  },
  recCard: {
    width: 176,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  recCoverWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: RospiereColors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  recCover: {
    width: '100%',
    height: '100%',
  },
  recBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 7.5,
    letterSpacing: 1,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recDetails: {
    marginBottom: 8,
  },
  recTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 12.5,
    color: RospiereColors.primary,
  },
  recAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
    color: RospiereColors.secondary,
    marginTop: 1,
  },
  recActions: {
    backgroundColor: 'rgba(243, 243, 243, 0.6)',
    padding: 6,
    gap: 4,
  },
  recActionPrimary: {
    backgroundColor: RospiereColors.primary,
    paddingVertical: 6,
    alignItems: 'center',
  },
  recActionPrimaryText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  recActionSecondary: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingVertical: 5,
    alignItems: 'center',
  },
  recActionSecondaryText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
  },
  quizSuggestCard: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quizSuggestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quizSuggestText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1,
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  quizSuggestAction: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: RospiereColors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  botTimestamp: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
    marginTop: 4,
    paddingLeft: 2,
  },
  inputContainer: {
    backgroundColor: 'rgba(249, 249, 249, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    minHeight: 40,
    maxHeight: 90,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: {
    fontFamily: RospiereFonts.body,
    fontSize: 12.5,
    color: RospiereColors.onSurface,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
