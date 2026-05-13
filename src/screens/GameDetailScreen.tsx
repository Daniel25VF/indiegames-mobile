import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width

function SkeletonBlock({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])
  return <Animated.View style={[{ backgroundColor: '#1c1c38', borderRadius: 4, opacity }, style]} />
}

function GameDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#07070f' }} showsVerticalScrollIndicator={false}>
      <SkeletonBlock style={{ width: '100%', height: 220 }} />
      <View style={{ padding: 16, gap: 14 }}>
        <SkeletonBlock style={{ height: 26, width: '65%' }} />
        <SkeletonBlock style={{ height: 14, width: '35%' }} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[80, 60, 70].map((w, i) => <SkeletonBlock key={i} style={{ height: 24, width: w, borderRadius: 3 }} />)}
        </View>
        <View style={{ backgroundColor: '#0f0f20', borderRadius: 8, padding: 16, gap: 12 }}>
          <SkeletonBlock style={{ height: 20, width: '40%' }} />
          <SkeletonBlock style={{ height: 44, borderRadius: 4 }} />
        </View>
        <SkeletonBlock style={{ height: 14, width: '30%' }} />
        {[100, 85, 90, 75].map((w, i) => <SkeletonBlock key={i} style={{ height: 13, width: `${w}%` }} />)}
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#14142a' }}>
            <SkeletonBlock style={{ width: 20, height: 20, borderRadius: 10 }} />
            <View style={{ flex: 1, gap: 4 }}>
              <SkeletonBlock style={{ height: 13, width: '70%' }} />
              <SkeletonBlock style={{ height: 11, width: '50%' }} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
import { SafeAreaView } from 'react-native-safe-area-context'
import type { StackScreenProps } from '@react-navigation/stack'
import type { RootStackParams } from '../navigation'
import {
  getGameById,
  mapApiGame,
  getGameAchievements,
  getGameBuildsAsUser,
  type AchievementResponse,
  type GameBuildAsUserListItem,
} from '@shared/services/api'
import type { Game } from '@shared/types/games'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import ReportModal from '../components/ReportModal'
import AuthModal from '../components/AuthModal'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Props = StackScreenProps<RootStackParams, 'GameDetail'>

const BUILD_VERSION_KEY = (gameId: string) => `indie_last_build_${gameId}`

export default function GameDetailScreen({ route, navigation }: Props) {
  const { game: initialGame } = route.params
  const [game, setGame] = useState<Game>(initialGame)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const { cartItems, ownedGameIds, addToCartLocal, authUser, userId, handleAuthSuccess } = useApp()
  const isOwned = ownedGameIds.has(initialGame.id)
  const [reportVisible, setReportVisible] = useState(false)
  const [authModalVisible, setAuthModalVisible] = useState(false)

  const [achievements, setAchievements] = useState<AchievementResponse[]>([])
  const [loadingAchievements, setLoadingAchievements] = useState(false)

  const [builds, setBuilds] = useState<GameBuildAsUserListItem[]>([])
  const [acknowledgedBuildId, setAcknowledgedBuildId] = useState<string | null>(null)

  const releaseBuild = builds.find(b => b.isReleaseBuild) ?? null
  const hasUpdate = !!authUser && releaseBuild !== null && acknowledgedBuildId !== releaseBuild.id

  const inCart = cartItems.some(g => g.id === game.id)

  useEffect(() => {
    getGameById(initialGame.id)
      .then(detail => setGame(mapApiGame(detail)))
      .catch(() => { /* keep partial */ })
      .finally(() => setLoadingDetail(false))
  }, [initialGame.id])

  useEffect(() => {
    if (!userId) return
    setLoadingAchievements(true)
    getGameAchievements(initialGame.id, userId)
      .then(list => setAchievements(list))
      .catch(() => {})
      .finally(() => setLoadingAchievements(false))
  }, [initialGame.id, userId])

  useEffect(() => {
    if (!authUser) return
    getGameBuildsAsUser(initialGame.id)
      .then(page => setBuilds(page.items))
      .catch(() => {})
  }, [initialGame.id, authUser])

  useEffect(() => {
    AsyncStorage.getItem(BUILD_VERSION_KEY(initialGame.id))
      .then(val => setAcknowledgedBuildId(val))
      .catch(() => {})
  }, [initialGame.id])

  const handleAcknowledgeUpdate = async () => {
    if (!releaseBuild) return
    await AsyncStorage.setItem(BUILD_VERSION_KEY(initialGame.id), releaseBuild.id)
    setAcknowledgedBuildId(releaseBuild.id)
  }

  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [game.image]

  const discount = game.oldPrice && game.price != null
    ? Math.round((1 - game.price / game.oldPrice) * 100)
    : null

  const unlockedCount = achievements.filter(a => a.isUnlocked).length

  if (loadingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#07070f" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{initialGame.title}</Text>
        </View>
        <GameDetailSkeleton onBack={() => navigation.goBack()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07070f" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{game.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Carousel */}
        <View style={styles.carouselWrapper}>
          {loadingDetail && (
            <View style={styles.carouselLoading}>
              <ActivityIndicator color="#a78bfa" />
            </View>
          )}
          <FlatList
            data={screenshots}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width)
              setSlideIndex(idx)
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.slide, { width: SCREEN_WIDTH }]} resizeMode="cover" />
            )}
          />
          <View style={styles.dotsRow}>
            {screenshots.map((_, i) => (
              <View key={i} style={[styles.dot, i === slideIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>

          {/* Title + meta */}
          <Text style={styles.title}>{game.title}</Text>
          {game.developer && (
            <Text style={styles.developer}>por {game.developer}</Text>
          )}

          {game.genres.length > 0 && (
            <View style={styles.tagsRow}>
              {game.genres.map(g => (
                <TouchableOpacity
                  key={g}
                  style={styles.tag}
                  onPress={() => navigation.navigate('SearchResults', { query: g })}
                >
                  <Text style={styles.tagTxt}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Purchase box */}
          <View style={styles.purchaseBox}>
            <View style={styles.priceRow}>
              {discount != null && game.price != null && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountTxt}>-{discount}%</Text>
                </View>
              )}
              {game.oldPrice != null && (
                <Text style={styles.oldPrice}>{game.oldPrice.toFixed(2)}€</Text>
              )}
              {game.price != null && (
                <Text style={styles.price}>{game.price.toFixed(2)}€</Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.buyBtn,
                isOwned ? styles.buyBtnOwned : inCart ? styles.buyBtnInCart : null,
              ]}
              onPress={() => {
                if (isOwned) return
                if (!authUser) { setAuthModalVisible(true); return }
                if (!inCart) addToCartLocal(game)
              }}
            >
              <View style={styles.buyBtnContent}>
                {isOwned && <Ionicons name="checkmark-circle" size={14} color="#a78bfa" style={{ marginRight: 6 }} />}
                {inCart && !isOwned && <Ionicons name="checkmark" size={14} color="#6a9a30" style={{ marginRight: 4 }} />}
                <Text style={[styles.buyBtnTxt, isOwned ? styles.buyBtnOwnedTxt : inCart ? styles.buyBtnInCartTxt : null]}>
                  {isOwned ? 'Ya tienes este juego' : inCart ? 'En el carrito' : 'Añadir al carrito'}
                </Text>
              </View>
            </TouchableOpacity>
            {releaseBuild && (
              <Text style={styles.versionLabel}>Versión {releaseBuild.versioName}</Text>
            )}
          </View>

          {/* Description */}
          {game.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{game.description}</Text>
            </View>
          )}

          {/* Achievements */}
          <View style={styles.section}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.sectionTitle}>Logros</Text>
              {authUser && achievements.length > 0 && (
                <Text style={styles.achievementsCount}>
                  {unlockedCount}/{achievements.length}
                </Text>
              )}
            </View>

            {loadingAchievements ? (
              <ActivityIndicator color="#a78bfa" style={{ marginTop: 8 }} />
            ) : achievements.length === 0 ? (
              <Text style={styles.emptyTxt}>Este juego no tiene logros.</Text>
            ) : (
              achievements.map(a => (
                <View key={a.id} style={styles.achievementRow}>
                  <Ionicons
                    name={a.isUnlocked ? 'trophy' : 'lock-closed'}
                    size={20}
                    color={a.isUnlocked ? '#a78bfa' : '#444'}
                  />
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, a.isUnlocked === false && styles.achievementLocked]}>
                      {a.name}
                    </Text>
                    <Text style={styles.achievementDesc}>{a.description}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Info */}
          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>FECHA DE LANZAMIENTO</Text>
              <Text style={styles.metaValue}>{game.releaseDate ?? '2025'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>DESARROLLADOR</Text>
              <Text style={styles.metaValue}>{game.developer ?? 'Indie Studio'}</Text>
            </View>
          </View>

          {/* Report */}
          <TouchableOpacity style={styles.reportBtn} onPress={() => setReportVisible(true)}>
            <Text style={styles.reportTxt}>Denunciar este juego</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <ReportModal
        visible={reportVisible}
        gameName={game.title}
        onClose={() => setReportVisible(false)}
        onSubmit={(reason, description) => {
          console.log('[Report]', { gameId: game.id, reason, description })
        }}
      />

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onAuthSuccess={(user) => {
          handleAuthSuccess(user)
          setAuthModalVisible(false)
          if (!inCart) addToCartLocal(game)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070f' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  backBtn: { paddingVertical: 4 },
  backTxt: { color: '#a78bfa', fontSize: 14 },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 15 },
  carouselWrapper: { height: 220, backgroundColor: '#000' },
  carouselLoading: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  slide: { width: 360, height: 220, resizeMode: 'cover' },
  dotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff' },
  body: { padding: 16, gap: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  developer: { color: '#a78bfa', fontSize: 13 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#0f0f20',
    borderWidth: 1,
    borderColor: '#1c1c38',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagTxt: { color: '#aaa', fontSize: 11 },
  purchaseBox: {
    backgroundColor: '#0f0f20',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discountBadge: {
    backgroundColor: '#4c6b22',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountTxt: { color: '#a4d007', fontSize: 12, fontWeight: '700' },
  oldPrice: { color: '#666', fontSize: 13, textDecorationLine: 'line-through' },
  price: { color: '#fff', fontSize: 20, fontWeight: '700' },
  buyBtn: {
    backgroundColor: '#4c6b22',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyBtnContent: { flexDirection: 'row', alignItems: 'center' },
  buyBtnInCart: { backgroundColor: '#2a3a1a' },
  buyBtnOwned: { backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  buyBtnTxt: { color: '#a4d007', fontWeight: '700', fontSize: 14, fontFamily: 'Poppins_700Bold' },
  buyBtnInCartTxt: { color: '#6a9a30' },
  buyBtnOwnedTxt: { color: '#a78bfa' },
  section: { gap: 8 },
  sectionTitle: { color: '#aaa', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  description: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsCount: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  achievementIcon: { lineHeight: 28 },
  achievementInfo: { flex: 1, gap: 2 },
  achievementName: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  achievementLocked: { color: '#666' },
  achievementDesc: { color: '#888', fontSize: 12 },
  emptyTxt: { color: '#666', fontSize: 13 },
  metaBox: {
    borderTopWidth: 1,
    borderTopColor: '#14142a',
    paddingTop: 14,
    gap: 10,
  },
  metaRow: { gap: 2 },
  metaLabel: { color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { color: '#ccc', fontSize: 12 },
  reportBtn: { alignItems: 'center', paddingVertical: 8 },
  reportTxt: { color: '#666', fontSize: 12, textDecorationLine: 'underline' },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(39,174,96,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.4)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  updateBannerLeft: { flex: 1, gap: 2 },
  updateBannerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  updateBannerTitle: { color: '#2ecc71', fontWeight: '700', fontSize: 13 },
  updateBannerSub: { color: '#888', fontSize: 11 },
  updateBannerBtn: {
    color: '#fff',
    backgroundColor: '#27ae60',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  versionLabel: { color: '#555', fontSize: 11, textAlign: 'right', marginTop: 4 },
})
