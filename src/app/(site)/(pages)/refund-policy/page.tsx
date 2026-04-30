import Breadcrumb from "@/components/Common/Breadcrumb";

export default function RefundPolicy() {
  return (
    <>
      <Breadcrumb title="Refund Policy" pages={["Refund Policy"]} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-10 xl:p-12">
            <h1 className="text-3xl font-semibold mb-3 text-dark">Refund Policy</h1>
            <p className="text-dark-5 text-sm mb-10">Last updated: April 2026</p>

            <div className="space-y-8 text-dark-5 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">1. Our Commitment</h2>
                <p>We want you to be completely satisfied with every purchase. If you are not happy with your order for any reason, we offer a straightforward return and refund process as outlined below.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">2. Refund Eligibility</h2>
                <p className="mb-3">To be eligible for a refund, the following conditions must be met:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Refund request must be submitted within <strong className="text-dark">30 days</strong> of the purchase date</li>
                  <li>Products must be in their original, unused condition with all original packaging</li>
                  <li>All tags, accessories, and included documentation must be intact</li>
                  <li>Proof of purchase (order number or receipt) must be provided</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">3. Non-Refundable Items</h2>
                <p className="mb-3">The following items are not eligible for refunds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sale, clearance, or final-sale items</li>
                  <li>Custom-made or personalised products</li>
                  <li>Digital products and downloadable content</li>
                  <li>Items returned after 30 days of purchase</li>
                  <li>Products showing signs of use, damage, or tampering by the customer</li>
                  <li>Hygiene-sensitive products (e.g. earrings, swimwear) once opened</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">4. How to Request a Refund</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team at <strong className="text-dark">support@example.com</strong> with your order number and reason for return</li>
                  <li>Attach supporting photos if the item is damaged or incorrect</li>
                  <li>Receive a Return Merchandise Authorisation (RMA) number from our team</li>
                  <li>Ship the item back in its original packaging, clearly marked with your RMA number</li>
                  <li>Once received and inspected, we will process your refund within 5&ndash;10 business days</li>
                </ol>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">5. Return Shipping</h2>
                <p>The customer is responsible for return shipping costs unless the return is due to our error (wrong item sent, manufacturing defect, or damage in transit). In such cases, we will provide a prepaid return label.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">6. Refund Processing</h2>
                <p>Approved refunds will be credited to your original payment method within <strong className="text-dark">5&ndash;10 business days</strong> of us receiving and inspecting the returned item. Processing times may vary depending on your bank or payment provider.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">7. Defective or Incorrect Items</h2>
                <p>If you receive a defective, damaged, or incorrect item, please contact us within <strong className="text-dark">48 hours</strong> of delivery with photos. We will arrange a replacement or full refund at no cost to you, including free return shipping.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">8. Exchanges</h2>
                <p>We offer exchanges for different sizes or colours, subject to stock availability. Exchanges must be requested within 30 days of purchase. Contact our support team to initiate an exchange.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-dark mb-3">9. Contact Us</h2>
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
