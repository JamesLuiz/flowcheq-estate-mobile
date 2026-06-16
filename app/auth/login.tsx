import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandButton } from '../../src/components/BrandButton';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { getPostLoginPath } from '../../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../../src/lib/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      router.replace(getPostLoginPath(user) as '/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Flowcheq Estate</Text>
        <Text style={typography.title}>Sign in</Text>
        <Text style={typography.subtitle}>
          Use your Flowcheq account to access field capture, wallet, and identity verification.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={typography.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.mutedForeground}
        />

        <Text style={[typography.label, { marginTop: spacing.md }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
        />

        {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

        <BrandButton
          label="Sign in"
          loading={loading}
          style={{ marginTop: spacing.lg }}
          onPress={() => void onSubmit()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  form: { gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
});
