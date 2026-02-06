import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

interface InitializeTransactionParams {
  email: string;
  amount: number; // in cents (e.g., 100 = $1.00)
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  currency?: string;
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
    };
    metadata: Record<string, any>;
  };
}

/**
 * Initialize a Paystack transaction
 * Call this from your server, then pass access_code to frontend
 */
export async function initializeTransaction(params: InitializeTransactionParams): Promise<InitializeTransactionResponse> {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      currency: params.currency || 'USD',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize transaction');
  }

  return response.json();
}

/**
 * Verify a Paystack transaction
 * Call this after payment to confirm success
 */
export async function verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify transaction');
  }

  return response.json();
}

/**
 * Verify Paystack webhook signature
 * Returns true if signature is valid
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');
  
  return hash === signature;
}

/**
 * Generate a unique transaction reference
 */
export function generateReference(prefix: string = 'me2you'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}
