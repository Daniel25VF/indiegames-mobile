import React, { useEffect, useState } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { StackScreenProps } from '@react-navigation/stack'
import type { RootStackParams } from '../navigation'
import { getGameById, mapApiGame } from '../services/api'
import type { Game } from '../types/games'
import { useApp } from '../context/AppContext'

type Props = StackScreenProps<RootStackParams, 'GameDetail'>

export default function GameDetailScreen({ route, navigation }: Props) {
  const { game: initialGame } = route.params
  const [game, setGame] = useState<Game>(initialGame)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const { cartItems, addToCartLocal } = useApp()

  const inCart = cartItems.some(g => g.id === game.id)

  useEffect(() => {
    getGameById(initialGame.id)
      .then(detail => setGame(mapApiGame(detail)))
      .catch(() => { /* keep partial */ })
      .finally(() => setLoadingDetail(false))
  }, [initialGame.id])

  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [game.image]

  const discount = game.oldPrice && game.price != null
    ? Math.round((1 - game.price / game.oldPrice) * 100)
    : null

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b1b1b" />

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
              <ActivityIndicator color="#6bb8e8" />
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
              <Image source={{ uri: item }} style={styles.slide} resizeMode="cover" />
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
                <View key={g} style={styles.tag}>
                  <Text style={styles.tagTxt}>{g}</Text>
                </View>
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
              style={[styles.buyBtn, inCart && styles.buyBtnInCart]}
              onPress={() => { if (!inCart) addToCartLocal(game) }}
            >
              <Text style={[styles.buyBtnTxt, inCart && styles.buyBtnInCartTxt]}>
                {inCart ? 'En el carrito ✓' : 'Añadir al carrito'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {game.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{game.description}</Text>
            </View>
          )}

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

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b1b1b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  backBtn: { paddingVertical: 4 },
  backTxt: { color: '#6bb8e8', fontSize: 14 },
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
  developer: { color: '#6bb8e8', fontSize: 13 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagTxt: { color: '#aaa', fontSize: 11 },
  purchaseBox: {
    backgroundColor: '#2a2a2a',
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
  buyBtnInCart: { backgroundColor: '#2a3a1a' },
  buyBtnTxt: { color: '#a4d007', fontWeight: '700', fontSize: 14 },
  buyBtnInCartTxt: { color: '#6a9a30' },
  wishlistBtn: {
    backgroundColor: '#4a6fa5',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  wishlistBtnActive: { backgroundColor: '#2d5080' },
  wishlistTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: { gap: 8 },
  sectionTitle: { color: '#aaa', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  description: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  metaBox: {
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    paddingTop: 14,
    gap: 10,
  },
  metaRow: { gap: 2 },
  metaLabel: { color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { color: '#ccc', fontSize: 12 },
})
