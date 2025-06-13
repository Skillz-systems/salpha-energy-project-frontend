#!/bin/bash

# This script helps set up the Paystack integration

# Check if Paystack inline-js is installed
if ! grep -q "@paystack/inline-js" package.json; then
  echo "Installing Paystack inline-js package..."
  npm install @paystack/inline-js
fi

# Create or update .env file with Paystack key (will need to be replaced with actual key)
if [ ! -f .env ]; then
  touch .env
fi

# Check if PAYSTACK_PUBLIC_KEY already exists in .env
if ! grep -q "PAYSTACK_PUBLIC_KEY" .env; then
  echo "Adding Paystack public key to .env file..."
  echo "PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> .env
  echo "Please replace the default test key with your actual Paystack public key"
fi

# Remove Flutterwave references if they exist
if grep -q "VITE_FLW_PUBLIC_KEY" .env; then
  echo "Removing Flutterwave key from .env file..."
  sed -i '' '/VITE_FLW_PUBLIC_KEY/d' .env
fi

echo "Paystack setup script complete!"
echo "Remember to:"
echo "1. Replace the test Paystack key in your .env file with your actual key"
echo "2. Test the payment flow to ensure everything works as expected" 