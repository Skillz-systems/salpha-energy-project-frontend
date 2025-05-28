// Paystack Configuration Utility
export const getPaystackConfig = () => {
  const config = {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 
               import.meta.env.PAYSTACK_PUBLIC_KEY || 
               "pk_test_764eb722cb244dc71a3dc8aba7875f6a7d1e9fd9",
    baseUrl: import.meta.env.VITE_API_BASE_URL || "",
    environment: import.meta.env.NODE_ENV || "development"
  };

  // Validation
  const isTestKey = config.publicKey.startsWith('pk_test_');
  const isLiveKey = config.publicKey.startsWith('pk_live_');
  const isDefaultKey = config.publicKey === "pk_test_764eb722cb244dc71a3dc8aba7875f6a7d1e9fd9";

  if (isDefaultKey) {
    console.warn('⚠️ Using default Paystack test key. Please set VITE_PAYSTACK_PUBLIC_KEY in your .env file');
  }

  if (config.environment === 'production' && !isLiveKey) {
    console.error('🚨 Production environment detected but using test key! Please set a live key (pk_live_...)');
  }

  if (config.environment === 'development' && isLiveKey) {
    console.warn('⚠️ Development environment detected but using live key! Consider using a test key (pk_test_...)');
  }

  console.log('Paystack Configuration:', {
    hasPublicKey: !!config.publicKey,
    keyType: isTestKey ? 'test' : isLiveKey ? 'live' : 'unknown',
    isDefaultKey,
    environment: config.environment,
    baseUrl: config.baseUrl || 'not set'
  });

  return config;
};

// Validate Paystack key format
export const validatePaystackKey = (key: string): { valid: boolean; message: string } => {
  if (!key) {
    return { valid: false, message: 'Paystack public key is required' };
  }

  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
    return { valid: false, message: 'Invalid Paystack key format. Must start with pk_test_ or pk_live_' };
  }

  if (key.length < 20) {
    return { valid: false, message: 'Paystack key appears to be too short' };
  }

  return { valid: true, message: 'Valid Paystack key' };
};

// Get environment-specific settings
export const getPaystackSettings = () => {
  const config = getPaystackConfig();
  const validation = validatePaystackKey(config.publicKey);

  return {
    ...config,
    validation,
    isReady: validation.valid,
    channels: ["card", "bank", "ussd", "qr", "mobile_money"] as const,
    currency: "NGN" as const
  };
}; 