import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import {
  getCurrentUser,
  updateDisplayName,
  getUserLibrary,
  getGameAchievements,
  type BasicUserResponse,
  type AchievementResponse,
} from '@shared/services/api'

type RecentAchievement = AchievementResponse & { gameTitle: string }

interface Friend {
  id: number
  name: string
  status: 'online' | 'offline' | 'playing'
  game?: string
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
  const { authUser, userId } = useApp()
  const [apiUser, setApiUser] = useState<BasicUserResponse | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([])
  const [loadingAchievements, setLoadingAchievements] = useState(false)

  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [addInput, setAddInput] = useState('')
  const [addError, setAddError] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  const loadProfile = useCallback(async () => {
    if (!authUser) return
    setLoadingProfile(true)
    try {
      const user = await getCurrentUser()
      setApiUser(user)
      setAvatarUrl(user.profilePicture?.mediumPictureUrl ?? null)
    } catch { /* fallback a authUser */ } finally {
      setLoadingProfile(false)
    }
  }, [authUser])

  useEffect(() => { loadProfile() }, [loadProfile])

  useEffect(() => {
    if (!userId) return
    setLoadingAchievements(true)
    getUserLibrary()
      .then(async library => {
        const toCheck = library.slice(0, 8)
        const results = await Promise.allSettled(
          toCheck.map(game =>
            getGameAchievements(game.id, userId).then(list =>
              list
                .filter(a => a.isUnlocked)
                .map(a => ({ ...a, gameTitle: game.title }))
            )
          )
        )
        const all: RecentAchievement[] = results
          .filter((r): r is PromiseFulfilledResult<RecentAchievement[]> => r.status === 'fulfilled')
          .flatMap(r => r.value)
        all.sort((a, b) => {
          const da = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
          const db = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
          return db - da
        })
        setRecentAchievements(all.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoadingAchievements(false))
  }, [userId])

  const handleSaveName = async () => {
    const name = editName.trim()
    if (name.length < 3 || name.length > 24) return
    setSaving(true)
    try {
      await updateDisplayName(name)
      setApiUser(prev => prev ? { ...prev, displayName: name } : prev)
      setEditVisible(false)
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el nombre.')
    } finally {
      setSaving(false)
    }
  }

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

  const displayName = apiUser?.displayName ?? authUser?.username ?? 'Invitado'
  const handle = apiUser && apiUser.displayName !== authUser?.username ? authUser?.username : null

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          {loadingProfile ? (
            <View style={styles.avatar}>
              <ActivityIndicator color="#a78bfa" />
            </View>
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImg}
              onError={() => setAvatarUrl(null)}
            />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{displayName}</Text>
            {handle && <Text style={styles.handle}>@{handle}</Text>}
            {authUser && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => { setEditName(apiUser?.displayName ?? ''); setEditVisible(true) }}
              >
                <Text style={styles.editBtnTxt}>Editar perfil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recent achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>LOGROS RECIENTES</Text>
            {recentAchievements.length > 0 && (
              <View style={styles.achievementsCountBadge}>
                <Text style={styles.achievementsCountTxt}>{recentAchievements.length}</Text>
              </View>
            )}
          </View>

          {loadingAchievements && (
            <ActivityIndicator color="#a78bfa" style={{ marginTop: 4 }} />
          )}

          {!loadingAchievements && recentAchievements.length === 0 && (
            <View style={styles.achievementsEmpty}>
              <Text style={styles.achievementsEmptyIcon}>🏆</Text>
              <Text style={styles.achievementsEmptyText}>Aún no has desbloqueado ningún logro</Text>
            </View>
          )}

          {!loadingAchievements && recentAchievements.map(a => (
            <View key={a.id} style={styles.achievementRow}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{a.name}</Text>
                <Text style={styles.achievementDesc}>{a.description}</Text>
                <Text style={styles.achievementGame}>
                  {a.gameTitle}
                  {a.unlockedAt ? ` · ${new Date(a.unlockedAt).toLocaleDateString('es-ES')}` : ''}
                </Text>
              </View>
            </View>
          ))}
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

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setEditVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setEditVisible(false)}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <Text style={styles.modalLabel}>Nombre para mostrar</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nombre para mostrar..."
              placeholderTextColor="#555"
              maxLength={24}
              autoFocus
            />
            <Text style={styles.charCount}>{editName.trim().length}/24</Text>
            <TouchableOpacity
              style={[styles.saveBtn, (saving || editName.trim().length < 3) && styles.saveBtnDisabled]}
              onPress={handleSaveName}
              disabled={saving || editName.trim().length < 3}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnTxt}>Guardar</Text>
              }
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[selectedFriend?.status ?? 'offline'] }]} />
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070f' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#181830',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#181830',
  },
  profileInfo: { gap: 6 },
  username: { color: '#fff', fontSize: 20, fontWeight: '700' },
  handle: { color: '#888', fontSize: 13 },
  editBtn: {
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: '#252550',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  editBtnTxt: { color: '#a78bfa', fontSize: 12, fontWeight: '600' },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
    gap: 10,
  },
  sectionLabel: { color: '#aaa', fontSize: 12, fontWeight: '600' },
  addRow: { flexDirection: 'row', gap: 8 },
  addInput: {
    flex: 1,
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: '#1c1c38',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtn: {
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#12122a',
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
    borderBottomColor: '#14142a',
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
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
    backgroundColor: '#0b0b18',
    borderRadius: 12,
    width: 300,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 6 },
  closeTxt: { color: '#666', fontSize: 14 },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },
  modalLabel: { color: '#aaa', fontSize: 12, alignSelf: 'flex-start' },
  modalInput: {
    width: '100%',
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: '#1c1c38',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  charCount: { color: '#666', fontSize: 11, alignSelf: 'flex-end' },
  saveBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
  divider: { height: 1, backgroundColor: '#1c1c38', width: '100%' },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  removeTxt: { color: '#f44336', fontSize: 13 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementsCountBadge: {
    backgroundColor: '#12122a',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  achievementsCountTxt: { color: '#aaa', fontSize: 11 },
  achievementsEmpty: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  achievementsEmptyIcon: { fontSize: 28, opacity: 0.3 },
  achievementsEmptyText: { color: '#555', fontSize: 12 },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#14142a',
  },
  achievementIcon: { fontSize: 20, lineHeight: 26 },
  achievementInfo: { flex: 1, gap: 2 },
  achievementName: { color: '#e0e0e0', fontSize: 13, fontWeight: '600' },
  achievementDesc: { color: '#888', fontSize: 12 },
  achievementGame: { color: '#555', fontSize: 11, marginTop: 2 },
})
