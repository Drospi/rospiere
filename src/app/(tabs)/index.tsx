import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RospiereHeader } from '@/components/RospiereHeader';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { Book } from '@/types/rospiere';

const CATEGORIES = [
  { name: 'Todos', icon: 'menu-book' },
  { name: 'eBooks', icon: 'devices' },
  { name: 'Novedades', icon: 'auto-awesome' },
  { name: 'Bestsellers', icon: 'workspace-premium' },
  { name: 'Audiolibros', icon: 'headphones' },
  { name: 'Ficción', icon: 'brush' },
  { name: 'Ensayo', icon: 'history-edu' },
  { name: 'Poesía', icon: 'flare' },
];

export default function DescubrirScreen() {
  const {
    books,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    toggleBookmark,
  } = useRospiere();

  const carouselRef = useRef<FlatList>(null);
  const scrollIndexRef = useRef(0);

  // Filter books based on category and search
  const filteredBooks = books.filter((book) => {
    const isEpubOrImported =
      book.isEpub ||
      book.category === 'Novedades' ||
      book.sourceType === 'imported' ||
      book.id === 'odisea-homero';

    const matchesCategory =
      selectedCategory === 'Todos' ||
      (selectedCategory === 'eBooks' && (book.badge === 'eBook' || book.isEpub)) ||
      (selectedCategory === 'Novedades' && isEpubOrImported) ||
      book.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Bestsellers' && book.rating >= 4.8);

    const matchesSearch =
      searchQuery.trim() === '' ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const scrollLeft = () => {
    if (scrollIndexRef.current > 0) {
      scrollIndexRef.current -= 1;
      carouselRef.current?.scrollToIndex({
        index: scrollIndexRef.current,
        animated: true,
      });
    }
  };

  const scrollRight = () => {
    if (scrollIndexRef.current < filteredBooks.length - 1) {
      scrollIndexRef.current += 1;
      carouselRef.current?.scrollToIndex({
        index: scrollIndexRef.current,
        animated: true,
      });
    }
  };

  const handleOpenBook = (item: Book) => {
    if (item.isEpub || item.id === 'odisea-homero' || item.sourceType === 'imported') {
      router.push(`/epub/reader?id=${item.id}` as any);
    } else {
      router.push(`/book/${item.id}` as any);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <Pressable
      style={({ pressed }) => [styles.bookCard, pressed && styles.cardPressed]}
      onPress={() => handleOpenBook(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.coverImage }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        {/* Minimal Bookmark Tag */}
        <Pressable
          style={styles.ribbonBadge}
          onPress={(e) => {
            e.stopPropagation();
            toggleBookmark(item.id);
          }}
          hitSlop={8}>
          <MaterialIcons
            name={item.isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={16}
            color={RospiereColors.onPrimary}
          />
        </Pressable>

        {/* Bottom category tag */}
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>
            {item.badge || (item.isEpub ? 'EPUB' : item.category)}
          </Text>
        </View>
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>

        <View style={styles.cardFooter}>
          <Pressable
            style={styles.readButton}
            onPress={() => handleOpenBook(item)}>
            <Text style={styles.readButtonText}>LEER</Text>
            <MaterialIcons name="arrow-forward" size={13} color={RospiereColors.primary} />
          </Pressable>

          <View style={styles.ratingBox}>
            <MaterialIcons name="star" size={13} color={RospiereColors.primary} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <RospiereHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Top Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <MaterialIcons
                name="search"
                size={19}
                color={RospiereColors.onSurfaceVariant}
                style={styles.searchIcon}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar obras, autores, ensayos..."
                placeholderTextColor="rgba(71, 71, 71, 0.6)"
                style={styles.searchInput}
                autoCorrect={false}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={16} color={RospiereColors.secondary} />
                </Pressable>
              ) : (
                <Pressable
                  style={styles.searchActionButton}
                  onPress={() => router.push('/(tabs)/libros')}>
                  <Text style={styles.searchActionButtonText}>BUSCAR</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.favoriteFilterBtn, pressed && styles.cardPressed]}
              onPress={() => router.push('/(tabs)/libros')}>
              <MaterialIcons name="bookmark-border" size={20} color={RospiereColors.onSurface} />
              {books.some((b) => b.isBookmarked) && <View style={styles.activeDot} />}
            </Pressable>
          </View>
        </View>

        {/* Editorial Categories Horizontal Scroll */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionSmallLabel}>CATEGORÍAS</Text>
            <Text style={styles.sectionSubItalic}>Colección 2026</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <Pressable
                  key={cat.name}
                  onPress={() => setSelectedCategory(cat.name)}
                  style={[
                    styles.categoryPill,
                    isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                  ]}>
                  <MaterialIcons
                    name={cat.icon as any}
                    size={16}
                    color={isActive ? RospiereColors.onPrimary : RospiereColors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                    ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Curated Popular Carousel ("Obras Populares") */}
        <View style={styles.popularSection}>
          <View style={styles.popularHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Obras Populares</Text>
              <Text style={styles.sectionSubtitle}>
                Lecturas comentadas por el círculo Rospiere
              </Text>
            </View>
            <View style={styles.carouselNavRow}>
              <Pressable
                onPress={scrollLeft}
                style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
                accessibilityLabel="Anterior">
                <MaterialIcons name="chevron-left" size={19} color={RospiereColors.onSurface} />
              </Pressable>
              <Pressable
                onPress={scrollRight}
                style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
                accessibilityLabel="Siguiente">
                <MaterialIcons name="chevron-right" size={19} color={RospiereColors.onSurface} />
              </Pressable>
            </View>
          </View>

          {filteredBooks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron libros con este filtro.</Text>
            </View>
          ) : (
            <FlatList
              ref={carouselRef}
              data={filteredBooks}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              snapToInterval={188}
              decelerationRate="fast"
            />
          )}
        </View>

        {/* Editorial Spotlight ("Curaduría Rospiere") */}
        <View style={styles.spotlightSection}>
          <View style={styles.spotlightHeader}>
            <Text style={styles.sectionSmallLabel}>CURADURÍA ROSPIERE</Text>
            <Text style={styles.sectionTitle}>Selección del Editor</Text>
          </View>

          {/* Main Feature Banner */}
          <View style={styles.featureBanner}>
            <View style={styles.featureTopRow}>
              <View style={styles.featureLeftText}>
                <View style={styles.yearTag}>
                  <Text style={styles.yearTagText}>EDICIÓN 2026</Text>
                </View>
                <Text style={styles.featureTitle}>Top 50 Lecturas Imprescindibles</Text>
                <Text style={styles.featureDesc}>
                  Las obras más influyentes de la literatura universal según nuestro comité crítico y
                  lectores.
                </Text>
              </View>

              {/* Minimalist Graphic Books Stack */}
              <View style={styles.bookStackGraphic}>
                <View style={styles.stackSpineTop}>
                  <View style={styles.spineWhiteMark} />
                </View>
                <View style={styles.stackSpineMiddle}>
                  <Text style={styles.spineText}>ROSPIERE</Text>
                  <View style={styles.spineBlackDot} />
                </View>
                <View style={styles.stackSpineThird} />
                <View style={styles.stackSpineBottom}>
                  <View style={styles.spineGrip} />
                </View>
              </View>
            </View>

            <View style={styles.featureBottomRow}>
              <Pressable
                style={({ pressed }) => [styles.exploreAllBtn, pressed && styles.cardPressed]}
                onPress={() => router.push('/curated/top-50-imprescindibles' as any)}>
                <Text style={styles.exploreAllBtnText}>EXPLORAR TODO</Text>
                <MaterialIcons name="north-east" size={15} color={RospiereColors.onPrimary} />
              </Pressable>
              <Text style={styles.featureMetricsText}>50 obras · 12 géneros</Text>
            </View>
          </View>

          {/* Triple Editorial Compact Tiles */}
          <View style={styles.tilesContainer}>
            <Pressable
              style={({ pressed }) => [styles.compactTile, pressed && styles.cardPressed]}
              onPress={() => router.push('/curated/top-50-clasicos' as any)}>
              <View style={styles.tileLeft}>
                <View style={styles.tileIconBox}>
                  <MaterialIcons name="account-balance" size={20} color={RospiereColors.onSurface} />
                </View>
                <View style={styles.tileTextWrap}>
                  <Text style={styles.tileTitle}>Top 50 Clásicos Universales</Text>
                  <Text style={styles.tileDesc}>De Homero a Virginia Woolf con notas críticas</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.compactTile, pressed && styles.cardPressed]}
              onPress={() => router.push('/curated/top-20-filosofico' as any)}>
              <View style={styles.tileLeft}>
                <View style={styles.tileIconBox}>
                  <MaterialIcons name="psychology" size={20} color={RospiereColors.onSurface} />
                </View>
                <View style={styles.tileTextWrap}>
                  <Text style={styles.tileTitle}>Top 20 Ensayo Filosófico</Text>
                  <Text style={styles.tileDesc}>
                    Pensamiento crítico para el mundo contemporáneo
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.compactTile, pressed && styles.cardPressed]}
              onPress={() => router.push('/(tabs)/cuestionarios')}>
              <View style={styles.tileLeft}>
                <View style={styles.tileIconBox}>
                  <MaterialIcons name="quiz" size={20} color={RospiereColors.onSurface} />
                </View>
                <View style={styles.tileTextWrap}>
                  <Text style={styles.tileTitle}>Cuestionarios de Comprensión</Text>
                  <Text style={styles.tileDesc}>
                    Evalúa tus interpretaciones y desbloquea insignias
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.compactTile, pressed && styles.cardPressed]}
              onPress={() => router.push('/epub/import')}>
              <View style={styles.tileLeft}>
                <View style={styles.tileIconBox}>
                  <MaterialIcons name="auto-stories" size={20} color={RospiereColors.onSurface} />
                </View>
                <View style={styles.tileTextWrap}>
                  <Text style={styles.tileTitle}>Taller EPUB & La Odisea</Text>
                  <Text style={styles.tileDesc}>
                    Importa libros .epub y disfruta el Lector con ajustes tipográficos
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
            </Pressable>
          </View>
        </View>

        {/* Literary Assistant Dialog Preview (Companion Banner) */}
        <View style={styles.companionBannerSection}>
          <View style={styles.companionCard}>
            <View style={styles.companionHeaderRow}>
              <View style={styles.companionBadge}>
                <MaterialIcons name="psychology" size={18} color={RospiereColors.onPrimary} />
                <Text style={styles.companionBadgeText}>COMPAÑERO LITERARIO</Text>
              </View>
              <View style={styles.pulseDot} />
            </View>

            <Text style={styles.companionQuote}>
              “¿Buscas una edición especial o un libro con temática existencialista para esta noche?”
            </Text>

            <View style={styles.companionBubbleMock}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={16}
                color="rgba(226, 226, 226, 0.85)"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.companionBubbleText}>
                Disponible para debatir tesis de autores, resumir capítulos o sugerirte tu próxima
                lectura según tu estado anímico.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.consultBtn, pressed && styles.cardPressed]}
              onPress={() => router.push('/(tabs)/asistente')}>
              <Text style={styles.consultBtnText}>CONSULTAR AL ASISTENTE</Text>
              <MaterialIcons name="send" size={15} color={RospiereColors.primary} />
            </Pressable>
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
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: RospiereColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.onSurface,
    paddingVertical: 0,
  },
  searchActionButton: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  searchActionButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  favoriteFilterBtn: {
    width: 48,
    height: 48,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    backgroundColor: RospiereColors.primary,
  },
  categoriesSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSmallLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 2.2,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionSubItalic: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
    color: 'rgba(71, 71, 71, 0.7)',
    fontStyle: 'italic',
  },
  categoriesScrollContent: {
    gap: 10,
    paddingBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: RospiereColors.primary,
  },
  categoryPillInactive: {
    backgroundColor: RospiereColors.surfaceContainerLow,
  },
  categoryText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  categoryTextActive: {
    color: RospiereColors.onPrimary,
  },
  categoryTextInactive: {
    color: RospiereColors.onSurface,
  },
  popularSection: {
    marginTop: 28,
  },
  popularHeaderRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 23,
    color: RospiereColors.onSurface,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 2,
  },
  carouselNavRow: {
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPressed: {
    backgroundColor: RospiereColors.surfaceContainer,
  },
  carouselContainer: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  bookCard: {
    width: 172,
    flexDirection: 'column',
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: RospiereColors.surfaceContainerLow,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  ribbonBadge: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 22,
    height: 28,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(249, 249, 249, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.4,
    color: RospiereColors.onSurface,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bookDetails: {
    marginTop: 10,
    flex: 1,
  },
  bookTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14.5,
    color: RospiereColors.onSurface,
    lineHeight: 18,
  },
  bookAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 2,
  },
  cardFooter: {
    marginTop: 8,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.5,
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.secondary,
  },
  spotlightSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  spotlightHeader: {
    marginBottom: 14,
  },
  featureBanner: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 22,
    marginBottom: 16,
  },
  featureTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureLeftText: {
    maxWidth: '68%',
  },
  yearTag: {
    alignSelf: 'flex-start',
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  yearTagText: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 2,
    color: RospiereColors.onPrimary,
    fontWeight: '700',
  },
  featureTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 19,
    color: RospiereColors.onSurface,
    lineHeight: 24,
  },
  featureDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 17,
  },
  bookStackGraphic: {
    width: 68,
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  stackSpineTop: {
    width: 52,
    height: 13,
    backgroundColor: RospiereColors.primary,
    marginBottom: 4,
    justifyContent: 'center',
    paddingLeft: 3,
  },
  spineWhiteMark: {
    width: 3,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  stackSpineMiddle: {
    width: 58,
    height: 16,
    backgroundColor: RospiereColors.surfaceContainerHighest,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  spineText: {
    fontFamily: RospiereFonts.label,
    fontSize: 6.5,
    letterSpacing: 0.5,
    color: RospiereColors.onSurfaceVariant,
    fontWeight: '700',
  },
  spineBlackDot: {
    width: 4,
    height: 8,
    backgroundColor: RospiereColors.primary,
  },
  stackSpineThird: {
    width: 62,
    height: 14,
    backgroundColor: RospiereColors.secondary,
    marginBottom: 4,
  },
  stackSpineBottom: {
    width: 68,
    height: 18,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spineGrip: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  featureBottomRow: {
    marginTop: 20,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exploreAllBtn: {
    backgroundColor: RospiereColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exploreAllBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  featureMetricsText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
  },
  tilesContainer: {
    gap: 10,
  },
  compactTile: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 10,
  },
  tileIconBox: {
    width: 38,
    height: 38,
    backgroundColor: RospiereColors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextWrap: {
    flex: 1,
  },
  tileTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13.5,
    color: RospiereColors.onSurface,
  },
  tileDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.onSurfaceVariant,
    marginTop: 2,
  },
  companionBannerSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  companionCard: {
    backgroundColor: RospiereColors.primary,
    padding: 22,
  },
  companionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  companionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companionBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: 'rgba(226, 226, 226, 0.85)',
    fontWeight: '600',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: RospiereColors.surfaceBright,
  },
  companionQuote: {
    fontFamily: RospiereFonts.headlineItalic,
    fontSize: 16.5,
    lineHeight: 23,
    color: RospiereColors.onPrimary,
    marginBottom: 14,
  },
  companionBubbleMock: {
    backgroundColor: 'rgba(59, 59, 59, 0.7)',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  companionBubbleText: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: 'rgba(226, 226, 226, 0.9)',
    lineHeight: 17,
  },
  consultBtn: {
    width: '100%',
    backgroundColor: RospiereColors.surfaceContainerLowest,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  consultBtnText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10.5,
    letterSpacing: 1.8,
    color: RospiereColors.onSurface,
    fontWeight: '600',
  },
});
