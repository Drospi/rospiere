import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { CURATED_LISTS } from '@/data/rospiereData';

export default function CuratedListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, toggleBookmark } = useRospiere();

  const curated = CURATED_LISTS.find((c) => c.id === id) || CURATED_LISTS[0];
  const listBooks = books.filter((b) => curated.bookIds.includes(b.id));

  return (
    <View style={styles.screen}>
      <RospiereHeader
        title={curated.subtitle}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Curated Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeBox}>
              <Text style={styles.badgeText}>{curated.editionBadge}</Text>
            </View>
            <Text style={styles.bookCountText}>{curated.booksCount}</Text>
          </View>

          <Text style={styles.heroTitle}>{curated.title}</Text>
          <Text style={styles.heroDesc}>{curated.description}</Text>
        </View>

        {/* List of Books */}
        <View style={styles.booksWrap}>
          <Text style={styles.sectionHeading}>OBRAS SELECCIONADAS</Text>

          {listBooks.map((book, index) => (
            <Pressable
              key={book.id}
              style={({ pressed }) => [styles.bookRow, pressed && styles.pressed]}
              onPress={() => router.push(`/book/${book.id}` as any)}>
              <View style={styles.indexNumBox}>
                <Text style={styles.indexNum}>
                  {(index + 1).toString().padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.coverThumbnail}>
                <Image
                  source={{ uri: book.coverImage }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.bookInfo}>
                <Text style={styles.bookCategory}>{book.category.toUpperCase()}</Text>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
              </View>

              <Pressable
                style={styles.bookmarkBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(book.id);
                }}>
                <MaterialIcons
                  name={book.isBookmarked ? 'bookmark' : 'bookmark-border'}
                  size={20}
                  color={RospiereColors.primary}
                />
              </Pressable>
            </Pressable>
          ))}
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
  heroBanner: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 24,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeBox: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 2,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bookCountText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.secondary,
  },
  heroTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 24,
    color: RospiereColors.onSurface,
    lineHeight: 30,
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 12.5,
    color: RospiereColors.onSurfaceVariant,
    lineHeight: 18,
  },
  booksWrap: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionHeading: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  bookRow: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  indexNumBox: {
    width: 24,
    alignItems: 'center',
  },
  indexNum: {
    fontFamily: RospiereFonts.mono,
    fontSize: 13,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  coverThumbnail: {
    width: 44,
    aspectRatio: 2 / 3,
    backgroundColor: RospiereColors.surfaceContainerLow,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  bookInfo: {
    flex: 1,
  },
  bookCategory: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.2,
    color: RospiereColors.secondary,
  },
  bookTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14,
    color: RospiereColors.onSurface,
    marginTop: 1,
  },
  bookAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 10.5,
    color: RospiereColors.onSurfaceVariant,
  },
  bookmarkBtn: {
    padding: 8,
  },
});
