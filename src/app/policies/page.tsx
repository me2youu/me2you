import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: 'Policies | Me2You',
  description: 'Refund policy, cancellation policy, and terms of service for Me2You gift websites.',
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8 font-poppins">Policies</h1>

        <div className="space-y-12">
          {/* Refund Policy */}
          <section className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Refund Policy
            </h2>
            <div className="text-gray-400 space-y-3 text-sm leading-relaxed">
              <p>
                At Me2You, we want you to be completely satisfied with your purchase. Due to the digital and personalized nature of our gift websites, we handle refunds on a case-by-case basis.
              </p>
              <p><strong className="text-gray-300">Eligible for refund:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Technical issues that prevent the gift from being viewed</li>
                <li>Payment errors resulting in duplicate charges</li>
                <li>Gift not delivered within 24 hours of purchase</li>
              </ul>
              <p><strong className="text-gray-300">Not eligible for refund:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Change of mind after the gift has been created and shared</li>
                <li>Gifts that have already been viewed by the recipient</li>
                <li>Incorrect information entered by the customer</li>
              </ul>
              <p>
                To request a refund, please contact us at{' '}
                <a href="mailto:support@me2you.world" className="text-accent-purple hover:text-accent-pink transition-colors">
                  support@me2you.world
                </a>{' '}
                within 7 days of purchase with your order reference number.
              </p>
              <p>
                Approved refunds will be processed within 5-10 business days and returned to the original payment method.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancellation Policy
            </h2>
            <div className="text-gray-400 space-y-3 text-sm leading-relaxed">
              <p>
                Since Me2You gifts are digital products that are generated instantly upon purchase, cancellations are limited:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You may cancel your order before completing payment at checkout</li>
                <li>Once payment is processed and the gift is created, the order cannot be cancelled</li>
                <li>If you haven&apos;t shared the gift link yet, contact us and we may be able to assist</li>
              </ul>
              <p>
                For any cancellation requests, please email{' '}
                <a href="mailto:support@me2you.world" className="text-accent-purple hover:text-accent-pink transition-colors">
                  support@me2you.world
                </a>{' '}
                as soon as possible.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Policy
            </h2>
            <div className="text-gray-400 space-y-3 text-sm leading-relaxed">
              <p>
                Your privacy is important to us. Here&apos;s how we handle your data:
              </p>
              <p><strong className="text-gray-300">Information we collect:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Email address (for account creation and order confirmations)</li>
                <li>Payment information (processed securely by Paystack - we don&apos;t store card details)</li>
                <li>Gift content you create (names, messages, photos)</li>
              </ul>
              <p><strong className="text-gray-300">How we use your information:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To create and deliver your personalized gifts</li>
                <li>To send order confirmations and support communications</li>
                <li>To improve our services</li>
              </ul>
              <p><strong className="text-gray-300">We do NOT:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Sell your personal information to third parties</li>
                <li>Share your gift content with anyone except the intended recipient</li>
                <li>Send marketing emails without your consent</li>
              </ul>
              <p>
                Photos and content you upload are stored securely and only accessible via the unique gift link you create.
              </p>
            </div>
          </section>

          {/* Terms of Service */}
          <section className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Terms of Service
            </h2>
            <div className="text-gray-400 space-y-3 text-sm leading-relaxed">
              <p>
                By using Me2You, you agree to the following terms:
              </p>
              <p><strong className="text-gray-300">Acceptable Use:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You must be at least 18 years old to make a purchase</li>
                <li>Content must not be illegal, harmful, threatening, or offensive</li>
                <li>You must have rights to any photos or content you upload</li>
                <li>Gifts are for personal, non-commercial use only</li>
              </ul>
              <p><strong className="text-gray-300">Gift Availability:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>24-hour gifts expire after 24 hours from payment confirmation</li>
                <li>Extended duration gifts (3 days, 1 week) expire as selected</li>
                <li>Lifetime gifts remain available indefinitely</li>
                <li>We reserve the right to remove content that violates our policies</li>
              </ul>
              <p><strong className="text-gray-300">Payment:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All prices are displayed in USD</li>
                <li>Payments are processed in South African Rand (ZAR) at the current exchange rate</li>
                <li>Payment processing is handled securely by Paystack</li>
              </ul>
              <p>
                Me2You is a product of a South African registered company. These terms are governed by the laws of South Africa.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </h2>
            <div className="text-gray-400 space-y-3 text-sm leading-relaxed">
              <p>
                If you have any questions about our policies or need assistance, please contact us:
              </p>
              <p>
                <strong className="text-gray-300">Email:</strong>{' '}
                <a href="mailto:support@me2you.world" className="text-accent-purple hover:text-accent-pink transition-colors">
                  support@me2you.world
                </a>
              </p>
              <p>
                <strong className="text-gray-300">Response time:</strong> We aim to respond within 24-48 hours.
              </p>
              <p className="pt-2">
                <Link href="/contact" className="text-accent-purple hover:text-accent-pink transition-colors">
                  Or use our contact form &rarr;
                </Link>
              </p>
            </div>
          </section>
        </div>

        <p className="text-gray-600 text-xs text-center mt-12">
          Last updated: February 2025
        </p>
      </main>
    </div>
  );
}
