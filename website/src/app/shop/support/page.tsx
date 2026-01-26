export default function SupportPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-serif text-gray-900 mb-8">Help Center</h1>
        
        <div className="prose prose-lg text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Customer Support</h2>
            <p>
              Our dedicated customer service team is here to help you with any questions 
              or concerns about your Mount Advertising experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-gray-600">hello@mountadvertising.com</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-gray-600">Available on our website</p>
                <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How do I determine my ring size?</h3>
                <p className="text-gray-600">Visit our size guide page for detailed instructions and a printable ring sizer.</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Can I track my order?</h3>
                <p className="text-gray-600">Yes! Once your order ships, you&apos;ll receive a tracking number via email.</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer custom designs?</h3>
                <p className="text-gray-600">Absolutely! Contact us to discuss your custom product design ideas.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Care</h2>
            <p>
              Proper care ensures your Mount Advertising products maintain their quality for years to come. 
              Visit our product care guide for detailed maintenance instructions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
