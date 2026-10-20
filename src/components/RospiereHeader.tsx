import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { router } from 'expo-router';

interface RospiereHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function RospiereHeader({ title, showBack, onBack, rightAction }: RospiereHeaderProps) {
  const insets = useSafeAreaInsets();
  const { userStats, medals, books } = useRospiere();
  const [profileVisible, setProfileVisible] = useState(false);

  const bookmarkedCount = books.filter((b) => b.isBookmarked).length;

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 14) }]}>
        <View style={styles.headerInner}>
          {showBack ? (
            <Pressable
              onPress={onBack || (() => router.back())}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityLabel="Regresar">
              <MaterialIcons name="arrow-back" size={20} color={RospiereColors.onSurface} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/libros')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityLabel="Buscar en Rospiere">
              <MaterialIcons name="search" size={22} color={RospiereColors.onSurface} />
            </Pressable>
          )}

          {title ? (
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>ROSPIERE</Text>
              <Text style={styles.brandSubtitle}>EDITIONS</Text>
            </View>
          )}

          {rightAction ? (
            rightAction
          ) : (
            <Pressable
              onPress={() => setProfileVisible(true)}
              style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
              accessibilityLabel="Perfil del Lector">
              <View style={styles.avatarCircle}>
                <MaterialIcons name="person" size={17} color={RospiereColors.onPrimary} />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* Profile & Reader Card Modal */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setProfileVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>CÍRCULO ROSPIERE</Text>
              </View>
              <Pressable onPress={() => setProfileVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={20} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.profileHero}>
                <View style={styles.largeAvatar}>
                  <MaterialIcons name="person" size={32} color={RospiereColors.onPrimary} />
                </View>
                <Text style={styles.profileName}>Lector Distinguido</Text>
                <Text style={styles.profileRole}>Membresía Coleccionista • 2026</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{userStats.evaluatedBooks}</Text>
                  <Text style={styles.statLabel}>LIBROS LEÍDOS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{userStats.accuracyPercent}%</Text>
                  <Text style={styles.statLabel}>ACIERTOS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{bookmarkedCount}</Text>
                  <Text style={styles.statLabel}>FAVORITOS</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>DISTINCIONES OBTENIDAS</Text>
                {medals.map((m) => (
                  <View key={m.id} style={styles.medalRow}>
                    <View style={styles.medalIconWrap}>
                      <MaterialIcons name={m.icon as any} size={18} color={RospiereColors.primary} />
                    </View>
                    <View style={styles.medalInfo}>
                      <Text style={styles.medalName}>{m.name}</Text>
                      <Text style={styles.medalDesc}>{m.description}</Text>
                    </View>
                    <MaterialIcons name="check" size={16} color={RospiereColors.primary} />
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>PREFERENCIAS CURATORIALES</Text>
                <Pressable
                  style={styles.modalActionItem}
                  onPress={() => {
                    setProfileVisible(false);
                    router.push('/(tabs)/libros');
                  }}>
                  <MaterialIcons name="bookmarks" size={18} color={RospiereColors.onSurface} />
                  <Text style={styles.modalActionText}>Ver mi estantería guardada</Text>
                  <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
                </Pressable>

                <Pressable
                  style={styles.modalActionItem}
                  onPress={() => {
                    setProfileVisible(false);
                    router.push('/(tabs)/cuestionarios');
                  }}>
                  <MaterialIcons name="quiz" size={18} color={RospiereColors.onSurface} />
                  <Text style={styles.modalActionText}>Historial de cuestionarios</Text>
                  <MaterialIcons name="chevron-right" size={18} color={RospiereColors.secondary} />
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(249, 249, 249, 0.95)',
    borderBottomWidth: 0,
    zIndex: 50,
  },
  headerInner: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  avatarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 17,
    letterSpacing: 4,
    color: RospiereColors.primary,
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 8.5,
    letterSpacing: 3,
    color: RospiereColors.secondary,
    textTransform: 'uppercase',
    marginTop: -2,
    fontWeight: '500',
  },
  headerTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 15,
    letterSpacing: 1.5,
    color: RospiereColors.primary,
    textTransform: 'uppercase',
    maxWidth: 220,
  },
  pressed: {
    opacity: 0.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 24,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  memberBadge: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  memberBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 2,
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: RospiereColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontFamily: RospiereFonts.headline,
    fontSize: 20,
    color: RospiereColors.onSurface,
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.secondary,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: RospiereFonts.headline,
    fontSize: 22,
    color: RospiereColors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 8,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 2,
    color: RospiereColors.secondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  medalIconWrap: {
    width: 32,
    height: 32,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalInfo: {
    flex: 1,
  },
  medalName: {
    fontFamily: RospiereFonts.headline,
    fontSize: 13,
    color: RospiereColors.onSurface,
  },
  medalDesc: {
    fontFamily: RospiereFonts.body,
    fontSize: 10,
    color: RospiereColors.secondary,
    marginTop: 1,
  },
  modalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: RospiereColors.surfaceContainerLow,
    gap: 12,
  },
  modalActionText: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.onSurface,
  },
});
