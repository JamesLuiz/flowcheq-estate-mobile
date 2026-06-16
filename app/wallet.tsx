import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandButton } from '../src/components/BrandButton';
import { EmailVerificationBanner } from '../src/components/EmailVerificationBanner';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { api, type WithdrawalRecord } from '../src/lib/api';
import { canAccessWallet, canUseAgentMobileApp, isEmailVerified } from '../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

function formatNgn(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function WalletScreen() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [fundAmount, setFundAmount] = useState('5000');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawOtp, setWithdrawOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [wallet, setWallet] = useState<Awaited<ReturnType<typeof api.agents.getBankAccount>> | null>(
    null,
  );
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
  });

  const loadWallet = useCallback(async () => {
    setLoading(true);
    try {
      const [account, pinStatus, history] = await Promise.all([
        api.agents.getBankAccount(),
        api.agents.getTransactionPinStatus(),
        api.agents.getWithdrawals(),
      ]);
      setWallet(account);
      setHasPin(pinStatus.hasPin);
      setWithdrawals(history.withdrawals ?? []);
      if (account.bankAccount) {
        setBankForm({
          bankName: account.bankAccount.bankName,
          bankCode: account.bankAccount.bankCode,
          accountNumber: account.bankAccount.accountNumber,
          accountName: account.bankAccount.accountName,
        });
      }
    } catch (e) {
      Alert.alert('Wallet error', e instanceof Error ? e.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !canAccessWallet(user.role)) {
      router.replace('/');
      return;
    }
    if (user && !canUseAgentMobileApp(user.role)) {
      router.replace('/auth/login');
      return;
    }
    void loadWallet();
  }, [user, loadWallet]);

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
        await loadWallet();
      }
    } catch (e) {
      Alert.alert('Funding failed', e instanceof Error ? e.message : 'Could not start checkout');
    } finally {
      setFunding(false);
    }
  };

  const saveBankAccount = async () => {
    if (!bankForm.bankName || !bankForm.bankCode || !bankForm.accountNumber || !bankForm.accountName) {
      Alert.alert('Missing details', 'Fill in all bank account fields.');
      return;
    }
    setSavingBank(true);
    try {
      await api.agents.updateBankAccount(bankForm);
      await loadWallet();
      Alert.alert('Saved', 'Bank account updated.');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not save bank account');
    } finally {
      setSavingBank(false);
    }
  };

  const setPin = async () => {
    if (newPin.length !== 6 || confirmPin.length !== 6) {
      Alert.alert('Invalid PIN', 'PIN must be 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'PIN and confirmation must match.');
      return;
    }
    setSettingPin(true);
    try {
      await api.agents.setTransactionPin(newPin);
      setHasPin(true);
      setNewPin('');
      setConfirmPin('');
      Alert.alert('PIN set', 'Your withdrawal PIN is ready.');
    } catch (e) {
      Alert.alert('PIN failed', e instanceof Error ? e.message : 'Could not set PIN');
    } finally {
      setSettingPin(false);
    }
  };

  const requestOtpAndWithdraw = async () => {
    if (!isEmailVerified(user)) {
      Alert.alert('Verify email first', 'Confirm your email before withdrawing.');
      router.push('/verify-email');
      return;
    }
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount < 100) {
      Alert.alert('Invalid amount', 'Minimum withdrawal is ₦100');
      return;
    }
    if ((wallet?.walletBalance ?? 0) < amount) {
      Alert.alert('Insufficient balance', 'Enter an amount within your wallet balance.');
      return;
    }
    if (!hasPin || withdrawPin.length !== 6) {
      Alert.alert('PIN required', 'Set and enter your 6-digit transaction PIN.');
      return;
    }
    if (!wallet?.bankAccount?.accountNumber) {
      Alert.alert('Bank account required', 'Save your bank account before withdrawing.');
      return;
    }

    setWithdrawing(true);
    try {
      if (!withdrawOtp) {
        const otpResult = await api.agents.requestWithdrawalOtp();
        Alert.alert('OTP sent', otpResult.message || 'Check your email for the withdrawal OTP.');
        return;
      }
      const result = await api.agents.withdraw(amount, withdrawPin, withdrawOtp);
      setWithdrawAmount('');
      setWithdrawPin('');
      setWithdrawOtp('');
      await loadWallet();
      Alert.alert('Withdrawal started', result.message || 'Withdrawal submitted.');
    } catch (e) {
      Alert.alert('Withdrawal failed', e instanceof Error ? e.message : 'Could not withdraw');
    } finally {
      setWithdrawing(false);
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
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EmailVerificationBanner user={user} onResent={() => void refresh()} />

        <View style={commonStyles.card}>
          <Text style={typography.label}>Balance</Text>
          <Text style={styles.balance}>{formatNgn(wallet?.walletBalance ?? 0)}</Text>
          {virtualAccount?.accountNumber ? (
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>
              {virtualAccount.bankName} · {virtualAccount.accountNumber}
              {'\n'}
              {virtualAccount.accountName}
            </Text>
          ) : null}
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Fund wallet</Text>
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

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Withdrawal bank account</Text>
          {(['bankName', 'bankCode', 'accountNumber', 'accountName'] as const).map((field) => (
            <TextInput
              key={field}
              value={bankForm[field]}
              onChangeText={(value) => setBankForm((prev) => ({ ...prev, [field]: value }))}
              style={styles.input}
              placeholder={field}
              placeholderTextColor={colors.mutedForeground}
              keyboardType={field === 'accountNumber' || field === 'bankCode' ? 'numeric' : 'default'}
            />
          ))}
          <BrandButton
            label="Save bank account"
            loading={savingBank}
            variant="outline"
            style={{ marginTop: spacing.md }}
            onPress={() => void saveBankAccount()}
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Transaction PIN</Text>
          <Text style={typography.caption}>
            {hasPin ? 'PIN is set. Enter it when withdrawing.' : 'Set a 6-digit PIN before your first withdrawal.'}
          </Text>
          <TextInput
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            style={styles.input}
            placeholder="New PIN"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            style={styles.input}
            placeholder="Confirm PIN"
            placeholderTextColor={colors.mutedForeground}
          />
          <BrandButton
            label={hasPin ? 'Update PIN' : 'Set PIN'}
            loading={settingPin}
            variant="secondary"
            style={{ marginTop: spacing.md }}
            onPress={() => void setPin()}
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Withdraw</Text>
          <TextInput
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Amount in NGN"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            value={withdrawPin}
            onChangeText={setWithdrawPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            style={styles.input}
            placeholder="6-digit PIN"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            value={withdrawOtp}
            onChangeText={setWithdrawOtp}
            autoCapitalize="characters"
            maxLength={6}
            style={styles.input}
            placeholder="Email OTP (after requesting)"
            placeholderTextColor={colors.mutedForeground}
          />
          <BrandButton
            label={withdrawOtp ? 'Submit withdrawal' : 'Request OTP & withdraw'}
            loading={withdrawing}
            style={{ marginTop: spacing.md }}
            onPress={() => void requestOtpAndWithdraw()}
          />
        </View>

        <View style={[commonStyles.card, styles.section]}>
          <Text style={styles.sectionTitle}>Recent withdrawals</Text>
          {withdrawals.length === 0 ? (
            <Text style={typography.caption}>No withdrawals yet.</Text>
          ) : (
            withdrawals.slice(0, 5).map((item) => (
              <View key={item.id ?? item.reference} style={styles.withdrawalRow}>
                <Text style={typography.body}>{formatNgn(item.amount)}</Text>
                <Text style={typography.caption}>{item.status}</Text>
              </View>
            ))
          )}
        </View>

        <BrandButton
          label="Back to dashboard"
          variant="outline"
          style={{ marginTop: spacing.lg }}
          onPress={() => router.replace('/')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  balance: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm },
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
  withdrawalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
