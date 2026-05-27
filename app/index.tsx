import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nestin Estate</Text>
      <Text style={styles.subtitle}>
        Landlords: use Nestin Capture for GPS-verified listing photos (no gallery uploads).
      </Text>
      <Link href="/nestin-capture" style={styles.link}>
        Open Nestin Capture
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0f172a' },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 24, lineHeight: 22 },
  link: {
    backgroundColor: '#2563eb',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: '600',
  },
});
