import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';

interface SearchBarProps
{
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search by title, author',
}: SearchBarProps) 
{
    return (
        <View style={styles.container}>
            <Ionicons 
                name='search'
                size={22}
                color={colors.textDark}
                style={styles.icon}
            />
            <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textDark + '80'}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            />
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',        
    alignItems: 'center',      
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
    fontFamily: 'Lexend_400Regular',
    padding: 0,
  },
});