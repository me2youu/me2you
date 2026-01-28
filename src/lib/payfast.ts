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

// PayFast requires fields in this EXACT order for signature generation
const PAYFAST_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'notify_method',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'currency',
  'payment_method',
  'subscription_type',
  'passphrase',
  'billing_date',
  'recurring_amount',
  'frequency',
  'cycles',
  'subscription_notify_email',
  'subscription_notify_webhook',
  'subscription_notify_buyer',
];

interface PayFastPaymentData {
  orderId: string;
  amount: number; // in USD
  itemName: string;
  itemDescription?: string;
  emailAddress?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  currency?: string; // defaults to USD
}

/**
 * Generate PayFast payment form data with signature
 */
export function generatePayFastPayment(data: PayFastPaymentData) {
  // Build the payment data object
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

  // Only add currency for production (sandbox doesn't support multi-currency)
  if (!PAYFAST_CONFIG.sandbox && data.currency) {
    paymentData.currency = data.currency;
  }

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
 * PHP-compatible urlencode
 * PHP's urlencode encodes spaces as '+' and encodes ~ as %7E etc.
 */
function phpUrlencode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * Generate MD5 signature for PayFast payment integrations.
 * 
 * Based on PayFast's official PHP SDK (Auth::generateSignature):
 * - Fields must be in PayFast's defined order
 * - Values are URL-encoded using PHP-style urlencode (spaces = +)
 * - Empty values are excluded
 * - Passphrase is appended (URL-encoded) if non-empty
 */
export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Build sorted data - only include fields in the PayFast order, skip empty
  const sortedData: Record<string, string> = {};
  for (const field of PAYFAST_FIELD_ORDER) {
    if (field === 'passphrase' || field === 'signature') continue;
    if (data[field] !== undefined && data[field] !== '') {
      sortedData[field] = data[field];
    }
  }

  // Append passphrase if non-empty
  if (passphrase !== undefined && passphrase !== null && passphrase !== '') {
    sortedData['passphrase'] = passphrase.trim();
  }

  // Create parameter string: key=urlencode(trim(value))&...
  const pfOutput = Object.entries(sortedData)
    .map(([key, value]) => `${key}=${phpUrlencode(String(value).trim())}`)
    .join('&');

  return crypto.createHash('md5').update(pfOutput).digest('hex');
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
 * Passphrase: jt7NOE43FZPn (required for sandbox)
 * 
 * Test buyer:
 * Email: sbtu01@payfast.co.za
 * Password: clientpass
 */
