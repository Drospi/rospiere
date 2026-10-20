import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';

type TabStatus = 'all' | 'reading' | 'to_read' | 'completed' | 'favorites';

export default function LibrosScreen() {
  const { books, toggleBookmark } = useRospiere();
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'title' | 'pages'>('rating');

  const filteredBooks = books
    .filter((book) => {
      if (activeTab === 'reading') return book.status === 'reading';
      if (activeTab === 'to_read') return book.status === 'to_read';
      if (activeTab === 'completed') return book.status === 'completed';
      if (activeTab === 'favorites') return book.isBookmarked;
      return true;
    })
    .filter((book) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'pages') return b.pagesTotal - a.pagesTotal;
      return 0;
    });

  const readingCount = books.filter((b) => b.status === 'reading').length;
  const favCount = books.filter((b) => b.isBookmarked).length;

  return (
    <View style={styles.screen}>
      <RospiereHeader title="Catálogo & Estantería" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.volLabel}>COLECCIÓN DIGITAL • ROSPIERE</Text>
          <Text style={styles.mainTitle}>Estantería Personal</Text>
          <Text style={styles.subtitle}>
            Ediciones críticas, literatura universal y tus lecturas en curso.
          </Text>
        </View>

        {/* EPUB Workshop Banner */}
        <View style={styles.epubBannerCard}>
          <View style={styles.epubBannerHeader}>
            <View style={styles.epubBadge}>
              <MaterialIcons name="auto-stories" size={14} color={RospiereColors.primary} />
              <Text style={styles.epubBadgeText}>TALLER EPUB & LECTOR</Text>
            </View>
            <Text style={styles.epubVersionText}>MOTOR LUMIERE</Text>
          </View>
          <Text style={styles.epubBannerTitle}>Añadir Libros EPUB a tu Colección</Text>
          <Text style={styles.epubBannerDesc}>
            Importa tus propios archivos .epub o lee «La Odisea» de Homero con nuestro motor tipográfico colapsable, notas marginales y sustratos papel/sepia/noche.
          </Text>
          <View style={styles.epubBannerActions}>
            <Pressable
              style={styles.epubImportBtn}
              onPress={() => router.push('/epub/import')}>
              <MaterialIcons name="folder-open" size={14} color={RospiereColors.onPrimary} />
              <Text style={styles.epubImportBtnText}>IMPORTAR .EPUB</Text>
            </Pressable>
            <Pressable
              style={styles.epubReadBtn}
              onPress={() => router.push('/epub/reader?id=odisea-homero')}>
              <MaterialIcons name="menu-book" size={14} color={RospiereColors.primary} />
              <Text style={styles.epubReadBtnText}>LEER LA ODISEA</Text>
            </Pressable>
          </View>
        </View>

        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          <Pressable
            style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
            onPress={() => setActiveTab('all')}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              TODOS ({books.length})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabPill, activeTab === 'reading' && styles.tabPillActive]}
            onPress={() => setActiveTab('reading')}>
            <Text style={[styles.tabText, activeTab === 'reading' && styles.tabTextActive]}>
              EN LECTURA ({readingCount})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabPill, activeTab === 'favorites' && styles.tabPillActive]}
            onPress={() => setActiveTab('favorites')}>
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              FAVORITOS ({favCount})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabPill, activeTab === 'to_read' && styles.tabPillActive]}
            onPress={() => setActiveTab('to_read')}>
            <Text style={[styles.tabText, activeTab === 'to_read' && styles.tabTextActive]}>
              POR LEER
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabPill, activeTab === 'completed' && styles.tabPillActive]}
            onPress={() => setActiveTab('completed')}>
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              TERMINADOS
            </Text>
          </Pressable>
        </ScrollView>

        {/* Search & Sort Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color={RospiereColors.secondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Filtrar por título, autor o género..."
              placeholderTextColor="rgba(71, 71, 71, 0.6)"
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={6}>
                <MaterialIcons name="close" size={15} color={RospiereColors.secondary} />
              </Pressable>
            )}
          </View>

          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>ORDEN:</Text>
            <Pressable
              onPress={() =>
                setSortBy((prev) =>
                  prev === 'rating' ? 'title' : prev === 'title' ? 'pages' : 'rating'
                )
              }
              style={styles.sortBtn}>
              <Text style={styles.sortBtnText}>
                {sortBy === 'rating' ? 'Calificación' : sortBy === 'title' ? 'Título' : 'Páginas'}
              </Text>
              <MaterialIcons name="swap-vert" size={15} color={RospiereColors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Books List */}
        <View style={styles.booksList}>
          {filteredBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="import-contacts" size={36} color={RospiereColors.secondary} />
              <Text style={styles.emptyTitle}>No hay libros que coincidan</Text>
              <Text style={styles.emptyDesc}>Prueba ajustando los términos de búsqueda o filtros.</Text>
            </View>
          ) : (
            filteredBooks.map((book) => {
              const progress =
                book.pagesTotal > 0
                  ? Math.round((book.currentPage / book.pagesTotal) * 100)
                  : 0;

              const handleOpenBook = () => {
                if (book.isEpub || book.id === 'odisea-homero' || book.sourceType === 'imported') {
                  router.push(`/epub/reader?id=${book.id}` as any);
                } else {
                  router.push(`/book/${book.id}` as any);
                }
              };

              return (
                <Pressable
                  key={book.id}
                  style={({ pressed }) => [styles.bookRowCard, pressed && styles.pressed]}
                  onPress={handleOpenBook}>
                  <View style={styles.rowCoverWrap}>
                    <Image
                      source={{ uri: book.coverImage }}
                      style={styles.rowCover}
                      resizeMode="cover"
                    />
                    <View style={styles.rowBadge}>
                      <Text style={styles.rowBadgeText}>{book.badge || (book.isEpub ? 'EPUB' : book.category)}</Text>
                    </View>
                  </View>

                  <View style={styles.rowContent}>
                    <View style={styles.rowHeader}>
                      <Text style={styles.rowCategory}>{book.category.toUpperCase()}</Text>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleBookmark(book.id);
                        }}
                        hitSlop={8}>
                        <MaterialIcons
                          name={book.isBookmarked ? 'bookmark' : 'bookmark-border'}
                          size={18}
                          color={RospiereColors.primary}
                        />
                      </Pressable>
                    </View>

                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.rowAuthor} numberOfLines={1}>
                      {book.author}
                    </Text>

                    {/* Progress Bar for Reading Books */}
                    {book.status === 'reading' ? (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressText}>
                            {book.isEpub && book.totalChapters
                              ? `Canto ${(book.currentChapterIndex || 0) + 1} de ${book.totalChapters} (${progress}%)`
                              : `Pág. ${book.currentPage} de ${book.pagesTotal} (${progress}%)`}
                          </Text>
                          <Text style={styles.progressRemaining}>{book.remainingTime}</Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${Math.max(5, progress)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.metadataRow}>
                        <Text style={styles.metadataText}>
                          {book.pagesTotal} págs. • {book.edition}
                        </Text>
                      </View>
                    )}

                    <View style={styles.rowActions}>
                      <Pressable
                        style={styles.actionReadBtn}
                        onPress={handleOpenBook}>
                        <Text style={styles.actionReadText}>
                          {book.status === 'reading' ? 'CONTINUAR' : 'LEER OBRA'}
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={12}
                          color={RospiereColors.onPrimary}
                        />
                      </Pressable>

                      <View style={styles.rowRating}>
                        <MaterialIcons name="star" size={13} color={RospiereColors.primary} />
                        <Text style={styles.rowRatingText}>{book.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
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
    paddingBottom: 40,
  },
  introSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  volLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2.2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 6,
  },
  mainTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 26,
    color: RospiereColors.onSurface,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: RospiereColors.surfaceContainerLow,
  },
  tabPillActive: {
    backgroundColor: RospiereColors.primary,
  },
  tabText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  tabTextActive: {
    color: RospiereColors.onPrimary,
  },
  controlsRow: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onSurface,
    paddingVertical: 0,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  sortLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sortBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    color: RospiereColors.primary,
    fontWeight: '500',
  },
  booksList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  bookRowCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  rowCoverWrap: {
    width: 90,
    aspectRatio: 2 / 3,
    backgroundColor: RospiereColors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
  },
  rowCover: {
    width: '100%',
    height: '100%',
  },
  rowBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(249, 249, 249, 0.94)',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  rowBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 7.5,
    letterSpacing: 1,
    color: RospiereColors.onSurface,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  rowCategory: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  rowTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 15,
    color: RospiereColors.onSurface,
    lineHeight: 19,
  },
  rowAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    color: RospiereColors.onSurface,
    fontWeight: '500',
  },
  progressRemaining: {
    fontFamily: RospiereFonts.body,
    fontSize: 9,
    color: RospiereColors.secondary,
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: RospiereColors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  metadataRow: {
    marginTop: 6,
    marginBottom: 4,
  },
  metadataText: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
    color: RospiereColors.secondary,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionReadBtn: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionReadText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  rowRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rowRatingText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: RospiereColors.surfaceContainerLow,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 16,
    color: RospiereColors.onSurface,
    marginTop: 8,
  },
  emptyDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.secondary,
    textAlign: 'center',
  },
  epubBannerCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    borderLeftWidth: 3,
    borderLeftColor: RospiereColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  epubBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  epubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: RospiereColors.surfaceContainerLow,
  },
  epubBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  epubVersionText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: RospiereColors.secondary,
  },
  epubBannerTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 16,
    fontWeight: '400',
    color: RospiereColors.primary,
    marginBottom: 4,
  },
  epubBannerDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: RospiereColors.secondary,
    marginBottom: 14,
  },
  epubBannerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  epubImportBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  epubImportBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  epubReadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: RospiereColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: RospiereColors.surfaceContainerHighest,
  },
  epubReadBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: RospiereColors.primary,
    fontWeight: '600',
  },
});
