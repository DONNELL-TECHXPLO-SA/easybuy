import Breadcrumb from "@/components/Common/Breadcrumb";

export default function PrivacyPolicy() {
  return (
    <>
      <Breadcrumb title="Privacy Policy" pages={["Privacy Policy"]} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-12">
            <h1 className="text-3xl font-semibold mb-3 text-dark">Privacy Policy</h1>
            <p className="text-dark-5 text-sm mb-10">Last updated: April 2026</p>

            <div className="space-y-8 text-dark-5 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">1. Introduction</h2>
                <p>At TechXplo Commerce, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">2. Information We Collect</h2>
                <p className="mb-3">We may collect information about you in a variety of ways, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-dark">Personal Data:</strong> Name, email address, phone number, postal address, and billing information when you register, place an order, or contact us.</li>
                  <li><strong className="text-dark">Payment Information:</strong> Credit card details processed securely by our payment providers. We do not store full card numbers.</li>
                  <li><strong className="text-dark">Usage Data:</strong> IP address, browser type, pages visited, time spent on pages, and other diagnostic data.</li>
                  <li><strong className="text-dark">Cookies:</strong> We use cookies and similar tracking technologies to enhance your browsing experience and analyse site usage.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To process and fulfil your orders</li>
                  <li>To send order confirmations, shipping updates, and receipts</li>
                  <li>To respond to customer service requests</li>
                  <li>To send promotional communications (only with your consent)</li>
                  <li>To improve our website, products, and services</li>
                  <li>To detect and prevent fraudulent transactions</li>
                  <li>To comply with legal obligations under South African law</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">4. Data Sharing</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share data with trusted service providers who assist us in operating our website (e.g. payment processors, delivery partners), subject to confidentiality agreements.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">5. Data Security</h2>
                <p>We implement industry-standard security measures including SSL/TLS encryption, secure servers, and access controls to protect your personal data from unauthorised access, alteration, or disclosure.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">6. Your Rights (POPIA)</h2>
                <p className="mb-3">Under the Protection of Personal Information Act (POPIA), you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to the processing of your data</li>
                  <li>Opt out of marketing communications at any time</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">7. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <ul className="list-none mt-3 space-y-1">
                  <li><strong className="text-dark">Email:</strong> support@example.com</li>
                  <li><strong className="text-dark">Phone:</strong> +27 11 342 8734</li>
                  <li><strong className="text-dark">Address:</strong> 6 Surrey Glen, 304 Surrey Avenue, Ferndale, Randburg, 2194</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
