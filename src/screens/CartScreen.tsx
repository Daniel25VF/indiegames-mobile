import React from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import type { Game } from '../types/games'

export default function CartScreen() {
  const { cartItems, removeFromCartLocal } = useApp()

  const total = cartItems.reduce((sum, g) => sum + (g.price ?? 0), 0)

  const renderItem = ({ item }: { item: Game }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemGenres} numberOfLines={1}>
          {item.genres.length > 0 ? item.genres.join(', ') : 'Indie'}
        </Text>
        <View style={styles.itemPriceRow}>
          {item.oldPrice != null && (
            <Text style={styles.oldPrice}>{item.oldPrice.toFixed(2)}€</Text>
          )}
          {item.price != null && (
            <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCartLocal(item.id)}
      >
        <Text style={styles.removeTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carrito</Text>
        <Text style={styles.count}>{cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTxt}>No tienes juegos en el carrito.</Text>
          <Text style={styles.emptyHint}>Explora la tienda y añade juegos.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={g => g.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{total.toFixed(2)}€</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutTxt}>Continuar al pago</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b1b1b' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  count: { color: '#888', fontSize: 13, marginTop: 2 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIcon: { fontSize: 48 },
  emptyTxt: { color: '#aaa', fontSize: 15, fontWeight: '500' },
  emptyHint: { color: '#666', fontSize: 13 },
  list: { paddingBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    backgroundColor: '#222',
  },
  itemImage: {
    width: 90,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#3a3a3a',
  },
  itemInfo: { flex: 1 },
  itemTitle: { color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  itemGenres: { color: '#888', fontSize: 12, marginBottom: 5 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  oldPrice: { color: '#666', fontSize: 12, textDecorationLine: 'line-through' },
  itemPrice: { color: '#fff', fontSize: 15, fontWeight: '700' },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTxt: { color: '#666', fontSize: 12 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    backgroundColor: '#1b1b1b',
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: '#aaa', fontSize: 14 },
  totalPrice: { color: '#fff', fontSize: 22, fontWeight: '700' },
  checkoutBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
  },
  checkoutTxt: { color: '#1b1b1b', fontWeight: '700', fontSize: 15 },
})
