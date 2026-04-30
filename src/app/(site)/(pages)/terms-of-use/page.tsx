import Breadcrumb from "@/components/Common/Breadcrumb";

export default function TermsOfUse() {
  return (
    <>
      <Breadcrumb title="Terms of Use" pages={["Terms of Use"]} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-12">
            <h1 className="text-3xl font-semibold mb-3 text-dark">Terms of Use</h1>
            <p className="text-dark-5 text-sm mb-10">Last updated: April 2026</p>

            <div className="space-y-8 text-dark-5 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">1. Acceptance of Terms</h2>
                <p>By accessing and using the TechXplo Commerce website, you confirm that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this website. We reserve the right to update these terms at any time without prior notice.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">2. Use of the Website</h2>
                <p className="mb-3">You agree to use this website only for lawful purposes. You must not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the site in any way that violates applicable local, national, or international laws</li>
                  <li>Transmit unsolicited or unauthorised advertising or promotional material</li>
                  <li>Attempt to gain unauthorised access to any part of the website or its related systems</li>
                  <li>Reproduce, duplicate, copy, or resell any part of the site without express written permission</li>
                  <li>Use the site to transmit any harmful, offensive, or disruptive content</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">3. Intellectual Property</h2>
                <p>All content on this website including text, graphics, logos, images, and software is the property of TechXplo Commerce and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">4. Product Information</h2>
                <p>We make every effort to display product descriptions, pricing, and availability accurately. However, we reserve the right to correct any errors and to cancel orders placed based on incorrect information. Prices are displayed in South African Rand (ZAR) and are subject to change without notice.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">5. Account Responsibility</h2>
                <p>If you create an account on our website, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">6. Disclaimer of Warranties</h2>
                <p>This website and its content are provided on an &quot;as is&quot; and &quot;as available&quot; basis without any warranties of any kind, either express or implied. TechXplo Commerce makes no representations or warranties regarding the accuracy, reliability, or completeness of any content on the site.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">7. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, TechXplo Commerce shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, this website or its content.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">8. Third-Party Links</h2>
                <p>Our website may contain links to third-party websites. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">9. Governing Law</h2>
                <p>These Terms of Use are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the South African courts.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">10. Contact Us</h2>
                <ul className="list-none space-y-1">
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
