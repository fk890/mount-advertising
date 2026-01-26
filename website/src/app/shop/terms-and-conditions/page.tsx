import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions - Mount Advertising',
  description: 'Terms and conditions for using the Mount Advertising website and services.',
  robots: { index: true, follow: true }
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-6">Terms and Conditions</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Use of Website</h2>
            <p className="text-gray-700 font-serif">
              By accessing and using this website, you agree to comply with these terms and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Orders</h2>
            <p className="text-gray-700 font-serif">
              All orders are subject to availability and confirmation. We reserve the right to cancel or refuse any order at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Custom Products</h2>
            <p className="text-gray-700 font-serif">
              Custom signage is produced based on customer specifications. Please ensure design details are correct before placing an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Intellectual Property</h2>
            <p className="text-gray-700 font-serif">
              All content, trademarks, and designs on this site are owned by Mount Advertising unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 font-serif mb-2">Limitation of Liability</h2>
            <p className="text-gray-700 font-serif">
              We are not liable for indirect, incidental, or consequential damages arising from the use of our products or website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
