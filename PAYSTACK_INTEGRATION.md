# Paystack Payment Integration Guide

## Overview
This project uses Paystack for payment processing with a robust, production-ready implementation that includes proper error handling, payment verification, and security best practices.

## Setup Instructions

### 1. Environment Configuration
Create a `.env` file in your project root with the following variables:

```bash
# Required: Your Paystack public key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# For production
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here

# Your API base URL
VITE_API_BASE_URL=https://your-api-url.com
```

### 2. Get Your Paystack Keys
1. Sign up at [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to Settings > API Keys & Webhooks
3. Copy your Public Key (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 3. Backend Requirements
Your backend must implement the following endpoints:

#### Payment Verification Endpoint
```
POST /v1/payment/verify
Body: { "reference": "payment_reference" }
Response: { "status": "success" | "failed", "data": {...} }
```

## Implementation Features

### ✅ Production-Ready Features
- **Script Loading Validation**: Ensures Paystack script is loaded before payment
- **Comprehensive Error Handling**: Handles network errors, validation errors, and payment failures
- **Payment Verification**: Verifies payments with your backend after completion
- **Type Safety**: Full TypeScript support with proper type definitions
- **Loading States**: Proper loading indicators during payment process
- **User Feedback**: Toast notifications for all payment states
- **Retry Logic**: Automatic retry for script loading failures

### ✅ Security Features
- **Environment Variables**: Secure key management
- **Payment Verification**: Server-side verification prevents fraud
- **Amount Validation**: Prevents negative or invalid amounts
- **Reference Validation**: Ensures unique payment references

## Usage

### Basic Payment Flow
```typescript
import { usePaystack } from '@/utils/usePaystack';

const { isReady, error, loading, initializePayment } = usePaystack();

const handlePayment = () => {
  initializePayment({
    key: 'pk_test_your_key',
    email: 'customer@email.com',
    amount: 10000, // Amount in Naira (will be converted to kobo automatically)
    ref: 'unique_reference',
    callback: (response) => {
      if (response.status === 'success') {
        // Handle successful payment
        console.log('Payment successful:', response.reference);
      }
    },
    onClose: () => {
      // Handle payment cancellation
      console.log('Payment cancelled');
    }
  });
};
```

### Advanced Configuration
```typescript
initializePayment({
  key: 'pk_test_your_key',
  email: 'customer@email.com',
  amount: 10000,
  currency: 'NGN',
  ref: 'unique_reference',
  metadata: {
    custom_fields: [
      {
        display_name: "Customer ID",
        variable_name: "customer_id",
        value: "12345"
      }
    ]
  },
  channels: ['card', 'bank', 'ussd', 'qr'],
  callback: async (response) => {
    // Verify payment with backend
    const verification = await verifyPayment(response.reference);
    if (verification.success) {
      // Payment verified successfully
    }
  }
});
```

## Error Handling

### Common Errors and Solutions

#### 1. "Payment system is not available"
**Cause**: Paystack script failed to load
**Solution**: 
- Check internet connection
- Verify the script tag in `index.html`: `<script src="https://js.paystack.co/v1/inline.js"></script>`
- Refresh the page

#### 2. "Invalid payment configuration"
**Cause**: Missing required fields
**Solution**: Ensure all required fields are provided:
- `key`: Your Paystack public key
- `email`: Customer email
- `amount`: Payment amount (must be > 0)
- `ref`: Unique payment reference

#### 3. "Payment verification failed"
**Cause**: Backend verification endpoint issues
**Solution**:
- Check backend endpoint is accessible
- Verify the payment reference is valid
- Check backend logs for errors

## Testing

### Test Mode
Use test keys (starting with `pk_test_`) for development:
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here
```

### Test Cards
Use these test card numbers in test mode:
- **Successful payment**: 4084084084084081
- **Insufficient funds**: 4084084084084081 (with CVV 408)
- **Invalid card**: 4084084084084082

## Production Deployment

### 1. Environment Setup
```bash
# Production environment
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
VITE_API_BASE_URL=https://your-production-api.com
NODE_ENV=production
```

### 2. Security Checklist
- [ ] Use live Paystack keys in production
- [ ] Implement webhook verification on backend
- [ ] Enable HTTPS for all payment pages
- [ ] Validate all payments server-side
- [ ] Log all payment attempts for audit

### 3. Monitoring
- Monitor payment success rates
- Set up alerts for payment failures
- Track payment verification failures
- Monitor API response times

## Troubleshooting

### Debug Mode
Enable debug logging by adding to your component:
```typescript
useEffect(() => {
  console.log('Paystack ready:', isReady);
  console.log('Payment error:', error);
  console.log('Payment loading:', loading);
}, [isReady, error, loading]);
```

### Common Issues
1. **Payments not completing**: Check network connectivity and backend availability
2. **Verification failures**: Ensure backend endpoint is correctly implemented
3. **Script loading issues**: Verify the Paystack script is included in `index.html`

## Support
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/contact)
- Check browser console for detailed error messages

## Migration from Other Payment Providers
If migrating from Flutterwave or other providers:
1. Update environment variables
2. Replace payment initialization code
3. Update backend verification endpoints
4. Test thoroughly in test mode before going live 