import { Metadata } from 'next';
import { generateFAQSchema } from '@/shop-utils/faqSeo';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Mount Advertising',
  description: 'Find answers to common questions about Mount Advertising signage products, shipping, returns, customization, and installation.',
  keywords: ['advertising FAQ', 'signage information', 'LED boards', 'neon signage', 'banner printing', 'display solutions', 'Mount Advertising'],
  alternates: {
    canonical: 'https://mount-advertising.vercel.app/faq'
  }
};

const faqs = [
  {
    question: "What materials are used in Mount Advertising products?",
    answer: "Our products are crafted from premium materials including high-grade LEDs, durable neon tubing, weather-resistant banner materials, and professional-grade aluminum and acrylic for displays. Each product undergoes rigorous quality testing to ensure durability and long-lasting performance."
  },
  {
    question: "Can I customize my signage or display?",
    answer: "Yes! We offer full customization services. You can choose sizes, colors, designs, and text for your signage. Our design team can work with you to create unique pieces tailored to your brand. Custom orders typically take 2-4 weeks to complete."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a 30-day return policy for standard products in original condition. Custom and personalized signage cannot be returned unless defective. Returns must include original packaging and documentation."
  },
  {
    question: "How should I care for my Mount Advertising products?",
    answer: "For LED and neon signs, wipe gently with a soft, dry cloth. Avoid harsh chemicals and excessive moisture. For banners and displays, store in dry conditions when not in use. Follow the specific care instructions provided with each product."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship worldwide. International orders may be subject to customs duties and taxes determined by your country's regulations. Delivery times vary by destination, typically 7-14 business days for standard items."
  },
  {
    question: "Do you provide installation services?",
    answer: "We provide detailed installation instructions with all products. For complex installations, we can recommend professional installers in your area. Some products come with mounting hardware included."
  },
  {
    question: "Can you help with design and layout?",
    answer: "Yes, we offer design consultation services. Our experienced designers can help you create effective signage that maximizes visibility and reflects your brand identity. Contact our team to discuss your project."
  },
  {
    question: "What warranty do you provide?",
    answer: "All Mount Advertising products come with a 1-year warranty against manufacturing defects. This covers electrical components, structural issues, and material defects, but not damage from improper installation, accidents, or normal wear."
  }
];

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs))
        }}
      />
      
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-light text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find answers to common questions about our signage products, policies, and services.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-700 pb-8">
                <h2 className="text-xl font-medium text-white mb-4">
                  {faq.question}
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <a
              href="/support"
              className="inline-block bg-[#c8ff00] text-black px-8 py-3 hover:bg-[#b8ef00] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
