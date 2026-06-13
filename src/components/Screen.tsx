import { SafeAreaView, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { colors, commonStyles } from '../lib/theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
}

export function Screen({ scroll, padded = true, children, style, ...rest }: ScreenProps) {
  const content = (
    <View style={[padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <SafeAreaView style={commonStyles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.screen, padded && styles.padded, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  padded: { padding: 20 },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 32 },
});
