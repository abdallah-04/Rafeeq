import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { Text, View, StyleSheet, Image } from 'react-native';

const appIcon = require('@/assets/images/icon.png');

export default function App() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <Image source={appIcon} style={styles.icon} />
      </View>
      <ThemedText variant='h1' center >Rafeeq</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    alignSelf:'center',
    fontWeight: 'bold',
  },
    center: {
    alignItems: 'center',
    marginTop: 16,
  },
  icon: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginTop: 72,
  },
});