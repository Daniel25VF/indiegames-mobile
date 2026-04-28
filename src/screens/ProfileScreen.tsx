import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'

interface Friend {
  id: number
  name: string
  status: 'online' | 'offline' | 'playing'
  game?: string
}

interface Achievement {
  id: number
  title: string
  description: string
  game: string
  date: string
}

const mockFriends: Friend[] = [
  { id: 1, name: 'PlayerOne', status: 'online' },
  { id: 2, name: 'GamerX', status: 'playing', game: 'Cyber Adventure' },
  { id: 3, name: 'NightOwl', status: 'offline' },
  { id: 4, name: 'PixelHero', status: 'online' },
  { id: 5, name: 'DarkBlade99', status: 'playing', game: 'Dark Dungeon' },
  { id: 6, name: 'StarWatcher', status: 'offline' },
  { id: 7, name: 'IronFist', status: 'online' },
]

const mockAchievements: Achievement[] = [
  { id: 1, title: 'Primera sangre', description: 'Derrota a tu primer enemigo.', game: 'Cyber Adventure', date: 'hace 2 días' },
  { id: 2, title: 'Sin rasguños', description: 'Completa un nivel sin recibir daño.', game: 'Dark Dungeon', date: 'hace 3 días' },
  { id: 3, title: 'Explorador', description: 'Descubre todos los mapas del mundo.', game: 'Fantasy World', date: 'hace 5 días' },
  { id: 4, title: 'Coleccionista', description: 'Recoge 50 objetos distintos.', game: 'Pixel Quest', date: 'hace 1 semana' },
  { id: 5, title: 'Superviviente', description: 'Sobrevive 10 noches seguidas.', game: 'Space Survival', date: 'hace 1 semana' },
  { id: 6, title: 'Maestro del combate', description: 'Encadena 20 golpes sin fallar.', game: 'Shadow Blade', date: 'hace 2 semanas' },
  { id: 7, title: 'Velocista', description: 'Completa una carrera en menos de 2 minutos.', game: 'Storm Riders', date: 'hace 2 semanas' },
]

const STATUS_LABEL: Record<Friend['status'], string> = {
  online: 'En línea',
  offline: 'Desconectado',
  playing: 'Jugando',
}

const STATUS_COLOR: Record<Friend['status'], string> = {
  online: '#4caf50',
  playing: '#2196f3',
  offline: '#555',
}

export default function ProfileScreen() {
  const { authUser } = useApp()
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [addInput, setAddInput] = useState('')
  const [addError, setAddError] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showAchievements, setShowAchievements] = useState(false)

  const handleAddFriend = () => {
    const name = addInput.trim()
    if (!name) return
    if (friends.find(f => f.name.toLowerCase() === name.toLowerCase())) {
      setAddError('Ese usuario ya está en tu lista.')
      return
    }
    setFriends(prev => [...prev, { id: Date.now(), name, status: 'offline' }])
    setAddInput('')
    setAddError('')
  }

  const handleRemoveFriend = (id: number) => {
    setFriends(prev => prev.filter(f => f.id !== id))
    setSelectedFriend(null)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{authUser?.username ?? 'Invitado'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>LOGROS</Text>
              <TouchableOpacity onPress={() => setShowAchievements(true)}>
                <Text style={styles.verMas}>Ver más</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statPlaceholder} />
          </View>
        </View>

        {/* Add friend */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Añadir amigo</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Nombre de usuario..."
              placeholderTextColor="#555"
              value={addInput}
              onChangeText={t => { setAddInput(t); setAddError('') }}
              onSubmitEditing={handleAddFriend}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
              <Text style={styles.addBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
          {!!addError && <Text style={styles.addError}>{addError}</Text>}
        </View>

        {/* Friends list */}
        <View style={styles.section}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>LISTA DE AMIGOS</Text>
            <View style={styles.friendsCount}>
              <Text style={styles.friendsCountTxt}>{friends.length}</Text>
            </View>
          </View>

          {friends.map(friend => (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendRow}
              onPress={() => setSelectedFriend(friend)}
            >
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[friend.status] }]} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendStatus}>
                  {friend.status === 'playing' && friend.game
                    ? `Jugando a ${friend.game}`
                    : STATUS_LABEL[friend.status]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Friend detail modal */}
      <Modal
        visible={!!selectedFriend}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFriend(null)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelectedFriend(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedFriend(null)}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
            <View style={styles.modalAvatar} />
            <Text style={styles.modalName}>{selectedFriend?.name}</Text>
            <View style={styles.modalStatusRow}>
              <View style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLOR[selectedFriend?.status ?? 'offline'] },
              ]} />
              <Text style={styles.modalStatusTxt}>
                {selectedFriend?.status === 'playing' && selectedFriend.game
                  ? `Jugando a ${selectedFriend.game}`
                  : STATUS_LABEL[selectedFriend?.status ?? 'offline']}
              </Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => selectedFriend && handleRemoveFriend(selectedFriend.id)}
            >
              <Text style={styles.removeTxt}>Eliminar de la lista de amigos</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Achievements modal */}
      <Modal
        visible={showAchievements}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAchievements(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAchievements(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.achievementsModal}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>Logros recientes</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAchievements(false)}>
                <Text style={styles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockAchievements}
              keyExtractor={a => String(a.id)}
              renderItem={({ item }) => (
                <View style={styles.achievementItem}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{item.title}</Text>
                    <Text style={styles.achievementDesc}>{item.description}</Text>
                    <Text style={styles.achievementMeta}>{item.game} · {item.date}</Text>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b1b1b' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3a3a3a',
  },
  profileInfo: { gap: 6 },
  username: { color: '#fff', fontSize: 20, fontWeight: '700' },
  levelBadge: {
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  levelTxt: { color: '#6bb8e8', fontSize: 11, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: { color: '#888', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  statPlaceholder: { height: 60, backgroundColor: '#333', borderRadius: 4 },
  verMas: { color: '#6bb8e8', fontSize: 11 },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    gap: 10,
  },
  sectionLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8 },
  addInput: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtn: {
    backgroundColor: '#4a6fa5',
    borderRadius: 4,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTxt: { color: '#fff', fontSize: 20, lineHeight: 24 },
  addError: { color: '#f44336', fontSize: 12 },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendsTitle: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  friendsCount: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  friendsCountTxt: { color: '#aaa', fontSize: 11 },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  friendInfo: { flex: 1 },
  friendName: { color: '#e0e0e0', fontSize: 13, fontWeight: '500' },
  friendStatus: { color: '#888', fontSize: 11, marginTop: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#242424',
    borderRadius: 12,
    width: 280,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 6 },
  closeTxt: { color: '#666', fontSize: 14 },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3a3a3a',
    marginTop: 8,
  },
  modalName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalStatusTxt: { color: '#aaa', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#3a3a3a', width: '100%' },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  removeTxt: { color: '#f44336', fontSize: 13 },
  achievementsModal: {
    backgroundColor: '#242424',
    borderRadius: 12,
    width: 320,
    maxHeight: '80%',
    padding: 20,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  achievementItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  achievementIcon: { fontSize: 28 },
  achievementInfo: { flex: 1, gap: 2 },
  achievementTitle: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  achievementDesc: { color: '#aaa', fontSize: 12 },
  achievementMeta: { color: '#666', fontSize: 11 },
})
