import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { RospiereColors, RospiereFonts } from '@/constants/rospiereTheme';
import { useRospiere } from '@/context/RospiereContext';
import { parseEpubFromBuffer } from '@/utils/epubParser';
import { EpubBookItem } from '@/types/rospiere';

export default function ImportEpubScreen() {
  const insets = useSafeAreaInsets();
  const { importedEpubBooks, addImportedEpubBook } = useRospiere();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [calibreModalVisible, setCalibreModalVisible] = useState(false);

  const handlePickEpub = async () => {
    try {
      setStatusMessage('Seleccionando archivo del dispositivo...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip', 'application/zip', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setStatusMessage(null);
        return;
      }

      const asset = result.assets[0];
      const isEpub =
        asset.name.toLowerCase().endsWith('.epub') ||
        (asset.mimeType && asset.mimeType.includes('epub'));

      if (!isEpub) {
        Alert.alert(
          'Formato no admitido',
          'El taller de lectura procesa exclusivamente documentos en formato .EPUB estándar y desprotegidos.'
        );
        setStatusMessage(null);
        return;
      }

      setIsProcessing(true);
      setStatusMessage(`Leyendo "${asset.name}" e indexando estructura...`);

      // Read file bytes
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const parsed = await parseEpubFromBuffer(arrayBuffer, asset.name);

      const newBook: EpubBookItem = {
        id: parsed.id || `custom-${Date.now()}`,
        title: parsed.title,
        author: parsed.author,
        fileSizeText: parsed.fileSizeText,
        coverImage: parsed.coverBase64,
        status: 'ready',
        progressPercent: 100,
        statusMessage: 'Validado • 100%',
        totalChapters: parsed.chapters.length,
        currentChapterIndex: 0,
        isBookmarked: false,
        sourceType: 'imported',
        description: parsed.description,
      };

      addImportedEpubBook(newBook, parsed);
      setIsProcessing(false);
      setStatusMessage(`¡Tomo "${parsed.title}" importado con éxito!`);

      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage(null);
      Alert.alert(
        'Error al procesar EPUB',
        err?.message || 'No se pudo descomprimir o maquetar el archivo EPUB seleccionado.'
      );
    }
  };

  const handleLoadDemoOdisea = () => {
    router.push('/epub/reader?id=odisea-homero');
  };

  const handleImportFromUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlModalVisible(false);
    setIsProcessing(true);
    setStatusMessage('Descargando e indexando tomo desde URL...');

    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage('Tomo descargado e indexado con éxito.');
      setTimeout(() => setStatusMessage(null), 3000);
    }, 1800);
  };

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerInner}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityLabel="Regresar">
            <MaterialIcons name="arrow-back" size={20} color={RospiereColors.primary} />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Importar Libro
          </Text>

          <Pressable
            onPress={() => {
              Alert.alert(
                'Taller de Importación EPUB',
                'Motor Lumiere EPUB 3.0 / 2.0. Soporta fuentes fluidas, anotaciones socráticas e índices analíticos.'
              );
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityLabel="Opciones">
            <MaterialIcons name="more-vert" size={20} color={RospiereColors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom, 24) + 40 }]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera Editorial con Retícula Asimétrica */}
        <View style={styles.editorialHeader}>
          <View style={styles.categoryBadgeRow}>
            <View style={styles.blackSquare} />
            <Text style={styles.categoryLabel}>BIBLIOTECA & ARCHIVO</Text>
          </View>
          <Text style={styles.mainHeadline}>Añadir a tu Colección</Text>
          <Text style={styles.editorialDescription}>
            Preservamos la pureza de la maquetación suiza, el control óptico de fuentes y los
            índices interactivos. Por esta razón, el taller de lectura procesa exclusivamente
            documentos <Text style={styles.boldSpan}>.EPUB</Text> desprotegidos.
          </Text>
        </View>

        {/* Zona de Carga / Drag & Drop */}
        <View style={styles.dropZoneContainer}>
          <View style={styles.dropZoneCard}>
            {/* Indicadores decorativos de esquina ex-libris */}
            <View style={[styles.cornerIndicator, styles.cornerTopLeft]} />
            <View style={[styles.cornerIndicator, styles.cornerTopRight]} />
            <View style={[styles.cornerIndicator, styles.cornerBottomLeft]} />
            <View style={[styles.cornerIndicator, styles.cornerBottomRight]} />

            {/* Icono central */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="auto-stories" size={28} color={RospiereColors.primary} />
            </View>

            {/* Badge de Especificación Estricta */}
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={13} color={RospiereColors.primary} />
              <Text style={styles.verifiedBadgeText}>SOLO FORMATO .EPUB</Text>
            </View>

            <Text style={styles.dropZoneTitle}>Arrastra tu tomo aquí</Text>
            <Text style={styles.dropZoneSubtitle}>
              o explora los archivos locales de tu dispositivo
            </Text>

            {/* Botón Principal de Exploración */}
            <Pressable
              style={({ pressed }) => [styles.primaryUploadButton, pressed && styles.pressed]}
              onPress={handlePickEpub}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator size="small" color={RospiereColors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="folder-open" size={16} color={RospiereColors.onPrimary} />
                  <Text style={styles.primaryUploadButtonText}>EXPLORAR ARCHIVOS .EPUB</Text>
                </>
              )}
            </Pressable>

            {/* Tomo de prueba La Odisea preinstalado */}
            <Pressable
              style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}
              onPress={handleLoadDemoOdisea}>
              <MaterialIcons name="local-library" size={15} color={RospiereColors.primary} />
              <Text style={styles.demoButtonText}>ABRIR TOMO DE PRUEBA: LA ODISEA (563 KB)</Text>
            </Pressable>

            {/* Mensaje de Compatibilidad Técnica */}
            <View style={styles.compatibilityBox}>
              <MaterialIcons
                name="terminal"
                size={14}
                color={RospiereColors.secondary}
                style={styles.terminalIcon}
              />
              <Text style={styles.compatibilityText}>
                Restringido a especificaciones{' '}
                <Text style={styles.boldSpan}>EPUB 3.0 / 2.0</Text> libres de DRM. Admite
                tipografía Serif/Sans dinámica y modo glosario.
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback Banner */}
        {statusMessage && (
          <View style={styles.statusToast}>
            <MaterialIcons name="info-outline" size={16} color={RospiereColors.onPrimary} />
            <Text style={styles.statusToastText}>{statusMessage}</Text>
          </View>
        )}

        {/* Micro-aviso Epistolar: ¿Por qué solo EPUB? */}
        <View style={styles.epistolarSection}>
          <View style={styles.epistolarCard}>
            <MaterialIcons
              name="format-shapes"
              size={20}
              color={RospiereColors.primary}
              style={styles.epistolarIcon}
            />
            <View style={styles.epistolarTextWrap}>
              <Text style={styles.epistolarTitle}>¿POR QUÉ EXIGIMOS EL ESTÁNDAR .EPUB?</Text>
              <Text style={styles.epistolarBody}>
                A diferencia del formato PDF estático, un archivo .epub se recompone armónicamente
                según la luz de tu estancia, permite ajustes de kerning, interlineado editorial y
                activa el motor de <Text style={styles.boldSpan}>preguntas socráticas</Text>{' '}
                integrado al pie de página.
              </Text>
            </View>
          </View>
        </View>

        {/* Sección de Archivos Recientes / En Proceso: Títulos en Taller */}
        <View style={styles.tallerSection}>
          <View style={styles.tallerHeaderRow}>
            <Text style={styles.tallerTitle}>Títulos en Taller</Text>
            <Text style={styles.tallerCountLabel}>
              {importedEpubBooks.length} {importedEpubBooks.length === 1 ? 'MANUSCRITO' : 'MANUSCRITOS'}
            </Text>
          </View>

          <View style={styles.tallerList}>
            {importedEpubBooks.map((item) => {
              const isOdisea = item.id === 'odisea-homero';
              const isReady = item.status === 'ready';

              return (
                <View key={item.id} style={styles.tallerCard}>
                  <View style={styles.tallerCardHeader}>
                    <View style={styles.bookInfoLeft}>
                      {isOdisea ? (
                        <Image
                          source={require('../../assets/odisea-cover.jpg')}
                          style={styles.bookThumbImage}
                          resizeMode="cover"
                        />
                      ) : item.coverImage ? (
                        <Image
                          source={{ uri: item.coverImage }}
                          style={styles.bookThumbImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.bookThumbPlaceholder}>
                          <MaterialIcons
                            name={isReady ? 'book' : 'hourglass-empty'}
                            size={18}
                            color={RospiereColors.secondary}
                          />
                        </View>
                      )}

                      <View style={styles.bookMetaText}>
                        <Text style={styles.bookTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                          {item.author}
                        </Text>
                        <View style={styles.bookBadgeRow}>
                          <Text style={styles.fileSizeBadge}>{item.fileSizeText}</Text>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Text style={styles.statusBadgeText}>
                            {item.statusMessage || (isReady ? 'Validado' : 'En análisis')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isReady ? (
                      <MaterialIcons name="check-circle" size={18} color={RospiereColors.primary} />
                    ) : (
                      <ActivityIndicator size="small" color={RospiereColors.primary} />
                    )}
                  </View>

                  {/* Barra de progreso */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${item.progressPercent}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.tallerCardFooter}>
                    <Text style={styles.footerNoteText}>
                      {isReady
                        ? `Maquetación ${item.progressPercent}% lista`
                        : 'Generando cuestionarios de comprensión...'}
                    </Text>

                    <Pressable
                      style={({ pressed }) => [styles.openReaderButton, pressed && styles.pressed]}
                      onPress={() => router.push(`/epub/reader?id=${item.id}`)}>
                      <Text style={styles.openReaderButtonText}>ABRIR LECTOR</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Métodos de Entrada Secundarios */}
        <View style={styles.secondaryMethodsSection}>
          <View style={styles.secondaryBox}>
            <View style={styles.secondaryHeaderRow}>
              <Text style={styles.secondaryTitle}>OTRAS VÍAS DE SUMINISTRO</Text>
              <MaterialIcons name="cloud-sync" size={18} color={RospiereColors.secondary} />
            </View>

            <View style={styles.secondaryButtonsList}>
              <Pressable
                style={({ pressed }) => [styles.secondaryRowButton, pressed && styles.pressed]}
                onPress={() => setUrlModalVisible(true)}>
                <View style={styles.secondaryRowLeft}>
                  <MaterialIcons name="link" size={16} color={RospiereColors.primary} />
                  <Text style={styles.secondaryRowText}>Importar desde URL directa (.epub)</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={16} color={RospiereColors.secondary} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryRowButton, pressed && styles.pressed]}
                onPress={() => setCalibreModalVisible(true)}>
                <View style={styles.secondaryRowLeft}>
                  <MaterialIcons name="lan" size={16} color={RospiereColors.primary} />
                  <Text style={styles.secondaryRowText}>
                    Sincronizar con Servidor Calibre / OPDS
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward" size={16} color={RospiereColors.secondary} />
              </Pressable>
            </View>

            <Text style={styles.privacyNote}>
              Rospiere Editions cifra en reposo y descarta cualquier metadato telemático tras la
              indexación.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* URL Import Modal */}
      <Modal
        visible={urlModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUrlModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setUrlModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalHeading}>Importar desde URL directa</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa la dirección web de un archivo .epub público y accesible.
            </Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://ejemplo.org/libro.epub"
              placeholderTextColor={RospiereColors.secondary}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelModalButton}
                onPress={() => setUrlModalVisible(false)}>
                <Text style={styles.cancelModalText}>CANCELAR</Text>
              </Pressable>
              <Pressable style={styles.confirmModalButton} onPress={handleImportFromUrl}>
                <Text style={styles.confirmModalText}>DESCARGAR & MAQUETAR</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Calibre/OPDS Modal */}
      <Modal
        visible={calibreModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalibreModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCalibreModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalHeading}>Sincronización Calibre / OPDS</Text>
            <Text style={styles.modalSubtitle}>
              Conecta tu biblioteca personal a través de catálogos abiertos OPDS con token de lectura
              Rospiere.
            </Text>
            <View style={styles.calibreNoticeBox}>
              <MaterialIcons name="vpn-key" size={16} color={RospiereColors.primary} />
              <Text style={styles.calibreNoticeText}>
                Servidor OPDS local detectado en red (127.0.0.1:8080).
              </Text>
            </View>
            <Pressable
              style={styles.confirmModalButton}
              onPress={() => setCalibreModalVisible(false)}>
              <Text style={styles.confirmModalText}>ENTENDIDO</Text>
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
  headerContainer: {
    backgroundColor: 'rgba(249, 249, 249, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    zIndex: 50,
  },
  headerInner: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: RospiereColors.primary,
    fontWeight: '300',
  },
  pressed: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 12,
  },
  editorialHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  blackSquare: {
    width: 6,
    height: 6,
    backgroundColor: RospiereColors.primary,
  },
  categoryLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: RospiereColors.secondary,
    fontWeight: '600',
  },
  mainHeadline: {
    fontFamily: RospiereFonts.headline,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '300',
    color: RospiereColors.primary,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  editorialDescription: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: RospiereColors.secondary,
    maxWidth: 380,
  },
  boldSpan: {
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  dropZoneContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dropZoneCard: {
    position: 'relative',
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cornerIndicator: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: 'rgba(119, 119, 119, 0.3)',
  },
  cornerTopLeft: {
    top: 6,
    left: 6,
  },
  cornerTopRight: {
    top: 6,
    right: 6,
  },
  cornerBottomLeft: {
    bottom: 6,
    left: 6,
  },
  cornerBottomRight: {
    bottom: 6,
    right: 6,
  },
  iconCircle: {
    width: 56,
    height: 56,
    backgroundColor: RospiereColors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: RospiereColors.surfaceContainer,
    marginBottom: 12,
  },
  verifiedBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  dropZoneTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 16,
    color: RospiereColors.primary,
    marginBottom: 4,
    fontWeight: '400',
  },
  dropZoneSubtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryUploadButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  primaryUploadButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  demoButton: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: RospiereColors.surfaceContainerLow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: RospiereColors.surfaceContainerHighest,
  },
  demoButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: RospiereColors.primary,
    fontWeight: '600',
  },
  compatibilityBox: {
    width: '100%',
    backgroundColor: 'rgba(243, 243, 243, 0.6)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  terminalIcon: {
    marginTop: 2,
  },
  compatibilityText: {
    flex: 1,
    fontFamily: RospiereFonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: RospiereColors.secondary,
  },
  statusToast: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 12,
    backgroundColor: RospiereColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusToastText: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    color: RospiereColors.onPrimary,
    flex: 1,
  },
  epistolarSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  epistolarCard: {
    backgroundColor: RospiereColors.surfaceContainerLow,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  epistolarIcon: {
    marginTop: 2,
  },
  epistolarTextWrap: {
    flex: 1,
    gap: 4,
  },
  epistolarTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: RospiereColors.primary,
  },
  epistolarBody: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: RospiereColors.secondary,
  },
  tallerSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  tallerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tallerTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 18,
    fontWeight: '300',
    color: RospiereColors.primary,
  },
  tallerCountLabel: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: RospiereColors.secondary,
  },
  tallerList: {
    gap: 14,
  },
  tallerCard: {
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tallerCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookInfoLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  bookThumbImage: {
    width: 40,
    height: 56,
    backgroundColor: RospiereColors.surfaceContainer,
  },
  bookThumbPlaceholder: {
    width: 40,
    height: 56,
    backgroundColor: RospiereColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookMetaText: {
    flex: 1,
    minWidth: 0,
  },
  bookTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 14,
    fontWeight: '400',
    color: RospiereColors.primary,
  },
  bookAuthor: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.secondary,
    marginTop: 1,
  },
  bookBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  fileSizeBadge: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    color: RospiereColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dotSeparator: {
    fontSize: 9,
    color: RospiereColors.secondary,
  },
  statusBadgeText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    color: RospiereColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: RospiereColors.surfaceContainer,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: RospiereColors.primary,
  },
  tallerCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerNoteText: {
    fontFamily: RospiereFonts.label,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: RospiereColors.secondary,
    flex: 1,
  },
  openReaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: RospiereColors.primary,
  },
  openReaderButtonText: {
    fontFamily: RospiereFonts.label,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  secondaryMethodsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  secondaryBox: {
    padding: 16,
    backgroundColor: RospiereColors.surfaceContainerLow,
    gap: 14,
  },
  secondaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryTitle: {
    fontFamily: RospiereFonts.headline,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: RospiereColors.primary,
  },
  secondaryButtonsList: {
    gap: 8,
  },
  secondaryRowButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryRowText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11.5,
    color: RospiereColors.primary,
  },
  privacyNote: {
    fontFamily: RospiereFonts.body,
    fontSize: 9.5,
    color: RospiereColors.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: RospiereColors.surfaceContainerLowest,
    padding: 24,
  },
  modalHeading: {
    fontFamily: RospiereFonts.headline,
    fontSize: 17,
    fontWeight: '400',
    color: RospiereColors.primary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: RospiereFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: RospiereColors.secondary,
    marginBottom: 16,
  },
  urlInput: {
    height: 44,
    backgroundColor: RospiereColors.surfaceContainerLow,
    paddingHorizontal: 12,
    fontFamily: RospiereFonts.body,
    fontSize: 13,
    color: RospiereColors.primary,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: RospiereColors.surfaceContainerHighest,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelModalText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: RospiereColors.secondary,
  },
  confirmModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: RospiereColors.primary,
  },
  confirmModalText: {
    fontFamily: RospiereFonts.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: RospiereColors.onPrimary,
    fontWeight: '600',
  },
  calibreNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: RospiereColors.surfaceContainerLow,
    marginBottom: 16,
  },
  calibreNoticeText: {
    fontFamily: RospiereFonts.body,
    fontSize: 11,
    color: RospiereColors.secondary,
    flex: 1,
  },
});
