import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BrandButton } from './BrandButton';
import { api } from '../lib/api';
import { isEmailVerified } from '../lib/roles';
import type { AppUser } from '../types/user';
import { colors, commonStyles, spacing } from '../lib/theme';

type Props = {
  user: AppUser | null;
  onResent?: () => void;
};

export function EmailVerificationBanner({ user, onResent }: Props) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || isEmailVerified(user)) return null;

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      const result = await api.auth.resendEmailVerification();
      setMessage(result.message || 'Verification email sent. Check your inbox.');
      onResent?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not send verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={commonStyles.warnBanner}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={commonStyles.warnText}>
        Confirm your email address to unlock wallet withdrawals and full agent features.
      </Text>
      <BrandButton
        label={sending ? 'Sending…' : 'Resend verification email'}
        loading={sending}
        style={{ marginTop: spacing.sm }}
        onPress={() => void resend()}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', color: colors.warning, marginBottom: 4 },
  message: { marginTop: spacing.sm, fontSize: 12, color: colors.mutedForeground },
});
