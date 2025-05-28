import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, any>;
  channels?: string[];
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaymentConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: Record<string, any>;
  channels?: string[];
  onClose?: () => void;
  callback?: (response: PaystackResponse) => void;
}

export const usePaystack = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enhanced script loading detection
  const checkPaystackAvailability = useCallback(() => {
    const checkScript = () => {
      const hasPaystackPop = typeof window !== 'undefined' && 
                            window.PaystackPop && 
                            typeof window.PaystackPop === 'object' &&
                            typeof window.PaystackPop.setup === 'function';

      if (hasPaystackPop) {
        setIsReady(true);
        setError(null);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkScript()) return;
    
    // If not ready, check periodically for up to 15 seconds
    let attempts = 0;
    const maxAttempts = 30; // 15 seconds with 500ms intervals
    
    const interval = setInterval(() => {
      attempts++;
      
      if (checkScript() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts && !isReady) {
          const errorMsg = "Payment system is not available. Please refresh the page and try again.";
          console.error(errorMsg);
          setError(errorMsg);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isReady]);

  // Enhanced payment initialization with detailed logging
  const initializePayment = useCallback((config: PaymentConfig) => {
    // Check if Paystack is ready
    if (!isReady) {
      const errorMsg = "Payment system is not ready. Please wait a moment and try again.";
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Validate required fields
    const validationErrors = [];
    if (!config.key) validationErrors.push('key');
    if (!config.email) validationErrors.push('email');
    if (!config.amount) validationErrors.push('amount');
    if (!config.ref) validationErrors.push('ref');

    if (validationErrors.length > 0) {
      const errorMsg = `Invalid payment configuration. Missing: ${validationErrors.join(', ')}`;
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    if (config.amount <= 0) {
      const errorMsg = "Invalid payment amount. Amount must be greater than 0.";
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email)) {
      const errorMsg = "Invalid email format.";
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInKobo = Math.round(config.amount * 100);

      const paymentConfig: PaystackConfig = {
        key: config.key,
        email: config.email,
        amount: amountInKobo,
        currency: config.currency || "NGN",
        ref: config.ref,
        metadata: config.metadata || {},
        channels: config.channels || ["card", "bank", "ussd", "qr", "mobile_money"],
        onClose: () => {
          setLoading(false);
          if (config.onClose) {
            config.onClose();
          } else {
            toast.info("Payment was cancelled");
          }
        },
        callback: (response: PaystackResponse) => {
          setLoading(false);
          if (config.callback) {
            config.callback(response);
          } else {
            if (response.status === "success") {
              toast.success("Payment completed successfully!");
            } else {
              toast.error("Payment failed. Please try again.");
            }
          }
        }
      };

      // Double-check Paystack is still available
      if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
        throw new Error('Paystack script is not available');
      }

      const handler = window.PaystackPop.setup(paymentConfig);
      
      if (!handler || typeof handler.openIframe !== 'function') {
        throw new Error('Failed to create Paystack handler');
      }

      handler.openIframe();
      return true;

    } catch (error: any) {
      console.error("Paystack initialization error:", error);
      const errorMsg = `Failed to initialize payment: ${error.message || 'Unknown error'}`;
      setError(errorMsg);
      setLoading(false);
      toast.error("Payment initialization failed");
      return false;
    }
  }, [isReady]);

  // Check availability on mount and when window loads
  useEffect(() => {
    checkPaystackAvailability();

    // Also check when window loads (in case script is still loading)
    const handleWindowLoad = () => {
      setTimeout(checkPaystackAvailability, 100);
    };

    if (document.readyState === 'complete') {
      handleWindowLoad();
    } else {
      window.addEventListener('load', handleWindowLoad);
      return () => window.removeEventListener('load', handleWindowLoad);
    }
  }, [checkPaystackAvailability]);

  return {
    isReady,
    error,
    loading,
    initializePayment,
    checkAvailability: checkPaystackAvailability
  };
}; 