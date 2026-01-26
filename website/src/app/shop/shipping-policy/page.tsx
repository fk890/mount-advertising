import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy - Mount Advertising',
  description: 'Shipping policy for Mount Advertising orders.',
  robots: { index: true, follow: true }
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-6">Shipping Policy</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Processing Time</h2>
            <p className="text-gray-700 font-serif">
              Standard products are processed within 1–3 business days. Custom signage orders may take 7–14 business days depending on design complexity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Shipping Time</h2>
            <p className="text-gray-700 font-serif">
              Delivery typically takes 3–7 business days after dispatch. Remote locations may take longer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Tracking</h2>
            <p className="text-gray-700 font-serif">
              You will receive tracking details by email once your order ships.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Shipping Charges</h2>
            <p className="text-gray-700 font-serif">
              Shipping charges are displayed at checkout. Some items may qualify for free shipping based on order value or promotions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
