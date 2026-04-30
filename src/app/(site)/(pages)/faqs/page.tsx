"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How long does delivery take?",
    answer: "Standard delivery typically takes 3–5 business days within South Africa. Express delivery options are available at checkout for faster shipping. Remote areas may take 1–2 additional days.",
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items in original, unused condition. Products must be returned in their original packaging with all accessories included. Please visit our Refund Policy page for full details.",
  },
  {
    id: 3,
    question: "Do you ship internationally?",
    answer: "Currently we ship within South Africa only. For international shipping enquiries, please contact our support team at support@example.com and we will do our best to assist.",
  },
  {
    id: 4,
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive a confirmation email with a tracking number. You can use this to track your parcel on the courier's website, or log into your account dashboard for real-time updates.",
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, PayPal, Apple Pay, and Google Pay. All transactions are processed securely using SSL encryption. We do not store your full card details.",
  },
  {
    id: 6,
    question: "Is my personal information secure?",
    answer: "Absolutely. We use industry-standard SSL/TLS encryption and follow strict data protection practices in compliance with South Africa's POPIA legislation. Your personal and payment data is never sold to third parties.",
  },
  {
    id: 7,
    question: "Can I modify or cancel my order?",
    answer: "Orders can be modified or cancelled within 24 hours of being placed. After that, the order enters our fulfilment process and changes may not be possible. Contact our support team as quickly as possible if you need to make changes.",
  },
  {
    id: 8,
    question: "What if I received a damaged or incorrect item?",
    answer: "Please contact us within 48 hours of delivery with photos of the item and packaging. We will arrange a replacement or full refund at no cost to you, including free return shipping.",
  },
  {
    id: 9,
    question: "Do I need an account to place an order?",
    answer: "You can browse and shop without an account. However, creating an account lets you track orders, save addresses, manage your wishlist, and access your order history for easier re-ordering.",
  },
  {
    id: 10,
    question: "How do I use a promo code or discount?",
    answer: "Enter your promo code in the 'Coupon Code' field on the Cart or Checkout page and click Apply. The discount will be reflected in your order total before payment.",
  },
];

export default function FAQsPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      <Breadcrumb title="Frequently Asked Questions" pages={["FAQ's"]} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-12">
            <h1 className="text-3xl font-semibold mb-2 text-dark">Frequently Asked Questions</h1>
            <p className="text-dark-5 mb-10">
              Can&apos;t find what you&apos;re looking for? Contact our support team and we&apos;ll be happy to help.
            </p>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-3 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-1 transition-colors duration-200"
                  >
                    <span className="font-medium text-dark pr-4">{faq.question}</span>
                    <svg
                      className={`flex-shrink-0 w-5 h-5 text-dark-5 transition-transform duration-200 ${openId === faq.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openId === faq.id && (
                    <div className="px-6 py-4 bg-gray-1 border-t border-gray-3">
                      <p className="text-dark-5 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gray-1 rounded-lg border border-gray-3">
              <h3 className="text-lg font-semibold text-dark mb-2">Still have a question?</h3>
              <p className="text-dark-5 mb-5">Our team is available Monday to Friday, 8am – 5pm SAST.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@example.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-dark text-white rounded-lg font-medium ease-out duration-200 hover:bg-blue"
                >
                  Email Support
                </a>
                <a
                  href="tel:+27113428734"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-3 text-dark rounded-lg font-medium ease-out duration-200 hover:border-blue hover:text-blue"
                >
                  +27 11 342 8734
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
