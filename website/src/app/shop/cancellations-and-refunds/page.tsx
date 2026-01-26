import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cancellations and Refunds - Mount Advertising',
  description: 'Cancellation and refund policy for Mount Advertising orders.',
  robots: { index: true, follow: true }
}

export default function CancellationsAndRefundsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-6">Cancellations and Refunds</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Order Cancellation</h2>
            <p className="text-gray-700 font-serif">
              You may request cancellation within 24 hours of placing an order, provided production has not started.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Custom Orders</h2>
            <p className="text-gray-700 font-serif">
              Custom signage orders are non-refundable once production has started. Please review design details carefully before purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Refunds</h2>
            <p className="text-gray-700 font-serif">
              Approved refunds are processed back to the original payment method within 5–7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Damaged or Incorrect Items</h2>
            <p className="text-gray-700 font-serif">
              If your item arrives damaged or incorrect, contact support within 48 hours with order details and photos.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
