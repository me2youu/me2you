import crypto from 'crypto';

// PayFast configuration
const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  sandbox: process.env.PAYFAST_SANDBOX === 'true',
};

export function getPayFastUrl() {
  return PAYFAST_CONFIG.sandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

export function getPayFastValidateUrl() {
  return PAYFAST_CONFIG.sandbox
    ? 'https://sandbox.payfast.co.za/eng/query/validate'
    : 'https://www.payfast.co.za/eng/query/validate';
}

interface PayFastPaymentData {
  orderId: string;
  amount: number; // in ZAR
  itemName: string;
  itemDescription?: string;
  emailAddress?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Generate PayFast payment form data with signature
 */
export function generatePayFastPayment(data: PayFastPaymentData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Build the payment data object (order matters for signature!)
  const paymentData: Record<string, string> = {
    merchant_id: PAYFAST_CONFIG.merchantId,
    merchant_key: PAYFAST_CONFIG.merchantKey,
    return_url: data.returnUrl,
    cancel_url: data.cancelUrl,
    notify_url: data.notifyUrl,
    m_payment_id: data.orderId,
    amount: data.amount.toFixed(2),
    item_name: data.itemName,
  };

  if (data.itemDescription) {
    paymentData.item_description = data.itemDescription;
  }

  if (data.emailAddress) {
    paymentData.email_address = data.emailAddress;
  }

  // Generate signature
  paymentData.signature = generateSignature(paymentData);

  return {
    paymentUrl: getPayFastUrl(),
    paymentData,
  };
}

/**
 * Generate MD5 signature for PayFast
 * The signature is an MD5 hash of the URL-encoded parameter string
 */
export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const phrase = passphrase ?? PAYFAST_CONFIG.passphrase;

  // Create parameter string (alphabetical order is NOT required - use insertion order)
  // But we must exclude 'signature' itself
  const params = Object.entries(data)
    .filter(([key]) => key !== 'signature')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`)
    .join('&');

  // Append passphrase if set
  const signatureString = phrase
    ? `${params}&passphrase=${encodeURIComponent(phrase).replace(/%20/g, '+')}`
    : params;

  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Validate PayFast ITN (Instant Transaction Notification)
 */
export async function validateITN(body: Record<string, string>): Promise<boolean> {
  // 1. Verify signature
  const receivedSignature = body.signature;
  const calculatedSignature = generateSignature(body);

  if (receivedSignature !== calculatedSignature) {
    console.error('PayFast ITN: Signature mismatch');
    return false;
  }

  // 2. Verify with PayFast server
  try {
    const params = Object.entries(body)
      .filter(([key]) => key !== 'signature')
      .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`)
      .join('&');

    const response = await fetch(getPayFastValidateUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const result = await response.text();
    return result === 'VALID';
  } catch (error) {
    console.error('PayFast ITN: Validation request failed', error);
    return false;
  }
}

/**
 * PayFast sandbox test credentials
 * Merchant ID: 10000100
 * Merchant Key: 46f0cd694581a
 * Passphrase: (leave empty for sandbox)
 * 
 * Test buyer:
 * Email: sbtu01@payfast.co.za
 * Password: clientpass
 */
