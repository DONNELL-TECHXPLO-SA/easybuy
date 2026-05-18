import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <section className="overflow-hidden py-20 bg-gray-2 min-h-screen">
      <div className="max-w-[570px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-3">
            Check Your Email
          </h1>
          <p className="text-dark-5 mb-6 leading-relaxed">
            We&apos;ve sent a verification email. Click the link in the email
            to verify your account and sign in.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-sm text-yellow-800 text-left">
            <strong className="block mb-1">Didn&apos;t receive the email?</strong>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>The link expires in 24 hours</li>
            </ul>
          </div>

          <Link
            href="/signin"
            className="inline-block font-medium text-white bg-dark py-3 px-8 rounded-lg ease-out duration-200 hover:bg-blue"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
