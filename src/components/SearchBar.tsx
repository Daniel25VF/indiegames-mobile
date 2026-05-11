import React from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <TextInput
          style={styles.input}
          placeholder="Buscar juegos..."
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChange}
          onSubmitEditing={() => onSearch(value)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.btn} onPress={() => onSearch(value)}>
          <Ionicons name="search" size={16} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: '#e0e0e0',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  btn: {
    padding: 9,
  },
  btnText: {
    fontSize: 14,
  },
})
