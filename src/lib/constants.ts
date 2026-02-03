// Developer emails that can bypass the payment gate
// These users can still make purchases via sandbox PayFast
export const DEV_EMAILS = [
  'anandpatel1221178@gmail.com',
  'luke.renton1@gmail.com',
  'lucy@simplydivine.co.za',
  'emiliadup26@gmail.com',
];

// Whether payments are live for the public
// Set NEXT_PUBLIC_PAYMENTS_LIVE=true on Vercel when PayFast vetting is complete
export const isPaymentsLive = process.env.NEXT_PUBLIC_PAYMENTS_LIVE === 'true';
