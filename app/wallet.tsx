import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandButton } from '../src/components/BrandButton';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/lib/api';
import { canAccessWallet } from '../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

function formatNgn(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function WalletScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [fundAmount, setFundAmount] = useState('5000');
  const [wallet, setWallet] = useState<Awaited<ReturnType<typeof api.agents.getBankAccount>> | null>(
    null,
  );

  useEffect(() => {
    if (user && !canAccessWallet(user.role)) {
      router.replace('/');
    }
  }, [user]);

  useEffect(() => {
    api.agents
      .getBankAccount()
      .then(setWallet)
      .catch((e) => Alert.alert('Wallet error', e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const fundWallet = async () => {
    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount < 100) {
      Alert.alert('Invalid amount', 'Enter at least ₦100');
      return;
    }

    setFunding(true);
    try {
      const result = await api.agents.fundWallet(amount);
      if (result.paymentLink) {
        await WebBrowser.openBrowserAsync(result.paymentLink);
        const refreshed = await api.agents.getBankAccount();
        setWallet(refreshed);
      }
    } catch (e) {
      Alert.alert('Funding failed', e instanceof Error ? e.message : 'Could not start checkout');
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  const virtualAccount = wallet?.virtualAccount;

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Virtual wallet</Text>
        <Text style={typography.subtitle}>
          Fund your Flutterwave wallet for platform payments. Separate from the one-time verification
          fee.
        </Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={typography.label}>Balance</Text>
        <Text style={styles.balance}>{formatNgn(wallet?.walletBalance ?? 0)}</Text>
        {virtualAccount?.accountNumber ? (
          <Text style={[typography.caption, { marginTop: spacing.sm }]}>
            {virtualAccount.bankName} · {virtualAccount.accountNumber}
            {'\n'}
            {virtualAccount.accountName}
          </Text>
        ) : (
          <Text style={[typography.caption, { marginTop: spacing.sm }]}>
            Virtual account details will appear after your wallet is provisioned.
          </Text>
        )}
      </View>

      <View style={[commonStyles.card, { marginTop: spacing.md }]}>
        <Text style={typography.label}>Fund wallet</Text>
        <TextInput
          value={fundAmount}
          onChangeText={setFundAmount}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Amount in NGN"
          placeholderTextColor={colors.mutedForeground}
        />
        <BrandButton
          label="Pay with Flutterwave"
          loading={funding}
          style={{ marginTop: spacing.md }}
          onPress={() => void fundWallet()}
        />
      </View>

      <BrandButton
        label="Back to verification"
        variant="outline"
        style={{ marginTop: spacing.lg }}
        onPress={() => router.push('/verify-account')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  balance: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  input: {
    marginTop: spacing.sm,
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
