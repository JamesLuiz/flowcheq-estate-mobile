import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { BrandButton } from '../src/components/BrandButton';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { buildYouverifyWebViewHtml } from '../src/features/youverify/youverifyWebViewHtml';
import { api } from '../src/lib/api';
import { isYouverifyVerified, requiresYouverifyAccount } from '../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

function formatNgn(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function VerifyAccountScreen() {
  const { user, refresh, loading: authLoading, isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ fee?: string }>();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [sdkOpen, setSdkOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof api.youverify.getAccountStatus>> | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const next = await api.youverify.getAccountStatus();
      setStatus(next);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not load verification status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadStatus();
    }
  }, [isAuthenticated, loadStatus]);

  useEffect(() => {
    if (params.fee === 'success') {
      Alert.alert('Payment received', 'You can now complete identity verification.');
      void loadStatus();
      router.setParams({ fee: undefined });
    } else if (params.fee === 'failed') {
      Alert.alert('Payment failed', 'Verification fee was not completed. Please try again.');
      router.setParams({ fee: undefined });
    }
  }, [params.fee, loadStatus]);

  useEffect(() => {
    if (user && !requiresYouverifyAccount(user.role)) {
      router.replace('/');
    } else if (user && isYouverifyVerified(user)) {
      router.replace('/');
    }
  }, [user]);

  const sdkHtml = useMemo(() => {
    const sdkConfig = status?.sdkConfig;
    if (!sdkConfig?.vFormId || !sdkConfig.publicMerchantKey) return null;
    const [firstName, ...rest] = (user?.name ?? '').split(' ');
    return buildYouverifyWebViewHtml(
      {
        vFormId: sdkConfig.vFormId,
        publicMerchantKey: sdkConfig.publicMerchantKey,
        sandboxEnvironment: sdkConfig.sandboxEnvironment,
        metadata: { ...(sdkConfig.metadata ?? {}), userId: user?.id },
      },
      {
        firstName,
        lastName: rest.join(' '),
        email: user?.email,
      },
    );
  }, [status?.sdkConfig, user]);

  const payFee = async () => {
    setPaying(true);
    try {
      const result = await api.youverify.payVerificationFee('mobile');
      if (result.alreadyPaid || result.alreadyVerified) {
        await loadStatus();
        return;
      }
      if (result.paymentLink) {
        await WebBrowser.openBrowserAsync(result.paymentLink);
        await loadStatus();
      }
    } catch (e) {
      Alert.alert('Checkout failed', e instanceof Error ? e.message : 'Payment could not start');
    } finally {
      setPaying(false);
    }
  };

  const onSdkMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: 'success' | 'failure' | 'close';
        payload?: Record<string, unknown> & { message?: string };
      };

      if (data.type === 'success') {
        setCompleting(true);
        await api.youverify.completeSdkVerification(data.payload ?? {});
        await refresh();
        setSdkOpen(false);
        Alert.alert('Verified', 'Your identity has been verified.');
        router.replace('/');
        return;
      }

      if (data.type === 'failure') {
        setSdkOpen(false);
        Alert.alert('Verification did not pass', data.payload?.message ?? 'Please try again.');
        return;
      }

      if (data.type === 'close') {
        setSdkOpen(false);
      }
    } catch {
      setSdkOpen(false);
      Alert.alert('Verification error', 'Could not process YouVerify response.');
    } finally {
      setCompleting(false);
    }
  };

  if (authLoading || !isAuthenticated || (loading && !status)) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  const feePaid = status?.feePaid ?? false;
  const verificationFee = status?.verificationFee ?? 1500;

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Identity verification</Text>
        <Text style={typography.subtitle}>
          Step 1: Pay the verification fee. Step 2: Complete YouVerify (NIN + liveness) in the app.
        </Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={typography.label}>Wallet balance</Text>
        <Text style={styles.balance}>{formatNgn(status?.walletBalance ?? 0)}</Text>
        {status?.virtualAccount?.accountNumber ? (
          <Text style={typography.caption}>
            {status.virtualAccount.bankName} · {status.virtualAccount.accountNumber}
          </Text>
        ) : null}
        <BrandButton
          label="Manage wallet"
          variant="outline"
          style={{ marginTop: spacing.md }}
          onPress={() => router.push('/wallet')}
        />
      </View>

      <View style={[commonStyles.card, { marginTop: spacing.md }]}>
        <Text style={typography.label}>Verification fee</Text>
        <Text style={styles.fee}>{formatNgn(verificationFee)}</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          Status: {(status?.paymentStatus ?? 'pending').replace(/_/g, ' ')}
        </Text>

        {!feePaid ? (
          <BrandButton
            label={`Pay ${formatNgn(verificationFee)}`}
            loading={paying}
            style={{ marginTop: spacing.md }}
            onPress={() => void payFee()}
          />
        ) : !sdkOpen ? (
          <BrandButton
            label="Start verification"
            style={{ marginTop: spacing.md }}
            disabled={!sdkHtml || completing}
            onPress={() => setSdkOpen(true)}
          />
        ) : null}
      </View>

      {sdkOpen && sdkHtml ? (
        <View style={styles.sdkHost}>
          {completing ? (
            <View style={styles.sdkOverlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : null}
          <WebView
            originWhitelist={['*']}
            source={{ html: sdkHtml }}
            onMessage={(event) => void onSdkMessage(event)}
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            style={styles.webview}
          />
          <BrandButton
            label="Close verification"
            variant="secondary"
            style={{ marginTop: spacing.sm }}
            onPress={() => setSdkOpen(false)}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  balance: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  fee: { fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: 4 },
  sdkHost: {
    marginTop: spacing.lg,
    minHeight: 420,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  webview: { flex: 1, minHeight: 360, backgroundColor: colors.background },
  sdkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 2,
  },
});
