type YouverifySdkConfig = {
  vFormId: string;
  publicMerchantKey: string;
  sandboxEnvironment?: boolean;
  metadata?: Record<string, unknown>;
};

type PersonalInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export function buildYouverifyWebViewHtml(
  sdkConfig: YouverifySdkConfig,
  personal: PersonalInfo,
): string {
  const config = JSON.stringify({
    vFormId: sdkConfig.vFormId,
    publicMerchantKey: sdkConfig.publicMerchantKey,
    sandboxEnvironment: sdkConfig.sandboxEnvironment ?? false,
    personalInformation: personal,
    metadata: sdkConfig.metadata ?? {},
    appearance: {
      greeting:
        'Complete your NIN and liveness check below. This verification runs inside the Flowcheq app.',
      actionText: 'Continue with YouVerify',
      primaryColor: '#007AFF',
      buttonBackgroundColor: '#007AFF',
      buttonTextColor: '#FFFFFF',
      textColor: '#1A1A1A',
    },
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: #F8F9FA; font-family: system-ui, sans-serif; }
    #status { padding: 16px; text-align: center; color: #6A727D; font-size: 14px; }
    #yv-sdk-modal { border-radius: 12px; overflow: hidden; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/youverify-web-sdk@2.2.1/dist/index.js"></script>
</head>
<body>
  <div id="status">Loading YouVerify…</div>
  <script>
    (function () {
      const config = ${config};
      function post(type, payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
        }
      }
      try {
        if (!window.YouverifySDK) {
          throw new Error('YouVerify SDK failed to load');
        }
        const vForm = new YouverifySDK.vForm({
          ...config,
          onSuccess: function (result) { post('success', result || {}); },
          onFailure: function (error) {
            post('failure', { message: error && error.message ? error.message : String(error || 'failed') });
          },
          onClose: function () { post('close', {}); },
        });
        document.getElementById('status').textContent = '';
        vForm.initialize();
        vForm.start();
      } catch (e) {
        post('failure', { message: e && e.message ? e.message : String(e) });
      }
    })();
  </script>
</body>
</html>`;
}
