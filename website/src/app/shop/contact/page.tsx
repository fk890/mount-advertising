import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us - Mount Advertising',
  description: 'Contact Mount Advertising for help with orders, custom signage, and support.',
  robots: { index: true, follow: true }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 font-serif mb-6">Contact Us</h1>
        <p className="text-gray-700 font-serif mb-6">
          We’re here to help with orders, custom signage requests, and general support.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-serif">Email</h2>
            <p className="text-gray-700 font-serif">contact@mountadvertising.com</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-serif">Support Hours</h2>
            <p className="text-gray-700 font-serif">Mon–Sat, 10:00 AM – 7:00 PM (IST)</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-serif">Help Center</h2>
            <Link href="/shop/support" className="text-blue-600 hover:text-blue-800 font-serif">
              Visit Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
