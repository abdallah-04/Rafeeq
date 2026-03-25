import PrimaryButton from '@/components/PrimaryButton';
import Spacer from '@/components/Spacer';
import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { Text, View, StyleSheet, Image } from 'react-native';

const appIcon = require('@/assets/images/icon.png');

export default function App() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <Spacer/>
        <Image source={appIcon} style={styles.icon} />
      </View>
      <ThemedText variant='h1' center >Rafeeq</ThemedText>
      <Spacer/>
      <View style={styles.buttonContainer}>
        <PrimaryButton
          label="          Get Started          "
          onPress={() => console.log("this is a test")}
          radius={20}
          disabeld={false}
          />
      </View>
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
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
});