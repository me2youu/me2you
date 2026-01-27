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
  // Build the payment data object - ORDER MATTERS for signature
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
  paymentData.signature = generateSignature(paymentData, PAYFAST_CONFIG.passphrase);

  return {
    paymentUrl: getPayFastUrl(),
    paymentData,
  };
}

/**
 * Generate MD5 signature for PayFast
 * 
 * PayFast signature rules:
 * - Use raw (non-encoded) values in the signature string
 * - Trim whitespace from values
 * - Exclude empty values and the 'signature' key itself
 * - Only append passphrase if it is a non-empty string
 */
export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Build parameter string from the data - use raw values, NOT URL-encoded
  const pfOutput = Object.entries(data)
    .filter(([key, value]) => key !== 'signature' && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${String(value).trim()}`)
    .join('&');

  // Only append passphrase if it's a non-empty string
  const signatureString = passphrase && passphrase.length > 0
    ? `${pfOutput}&passphrase=${passphrase.trim()}`
    : pfOutput;

  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Validate PayFast ITN (Instant Transaction Notification)
 */
export async function validateITN(body: Record<string, string>): Promise<boolean> {
  // 1. Verify signature
  const receivedSignature = body.signature;
  const calculatedSignature = generateSignature(body, PAYFAST_CONFIG.passphrase);

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
