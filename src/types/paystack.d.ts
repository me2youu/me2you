declare module '@paystack/inline-js' {
  interface TransactionResponse {
    reference: string;
    trans: string;
    status: string;
    message: string;
    transaction: string;
    trxref: string;
    redirecturl?: string;
  }

  interface PaystackPopOptions {
    onSuccess?: (response: TransactionResponse) => void;
    onCancel?: () => void;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }

  class PaystackPop {
    constructor();
    resumeTransaction(accessCode: string, options?: PaystackPopOptions): void;
    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      ref?: string;
      currency?: string;
      channels?: string[];
      metadata?: Record<string, any>;
      onSuccess?: (response: TransactionResponse) => void;
      onCancel?: () => void;
      onError?: (error: Error) => void;
    }): void;
  }

  export default PaystackPop;
}
