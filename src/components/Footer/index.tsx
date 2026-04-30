import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-15">

          {/* Help & Support */}
          <div className="max-w-[330px] w-full">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
              Help &amp; Support
            </h2>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-4.5">
                <span className="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.25 8.51464C4.25 4.45264 7.77146 1.25 12 1.25C16.2285 1.25 19.75 4.45264 19.75 8.51464C19.75 12.3258 17.3871 16.8 13.5748 18.4292C12.574 18.8569 11.426 18.8569 10.4252 18.4292C6.61289 16.8 4.25 12.3258 4.25 8.51464ZM12 2.75C8.49655 2.75 5.75 5.38076 5.75 8.51464C5.75 11.843 7.85543 15.6998 11.0147 17.0499C11.639 17.3167 12.361 17.3167 12.9853 17.0499C16.1446 15.6998 18.25 11.843 18.25 8.51464C18.25 5.38076 15.5034 2.75 12 2.75ZM12 7.75C11.3096 7.75 10.75 8.30964 10.75 9C10.75 9.69036 11.3096 10.25 12 10.25C12.6904 10.25 13.25 9.69036 13.25 9C13.25 8.30964 12.6904 7.75 12 7.75ZM9.25 9C9.25 7.48122 10.4812 6.25 12 6.25C13.5188 6.25 14.75 7.48122 14.75 9C14.75 10.5188 13.5188 11.75 12 11.75C10.4812 11.75 9.25 10.5188 9.25 9ZM3.59541 14.9966C3.87344 15.3036 3.84992 15.7779 3.54288 16.0559C2.97519 16.57 2.75 17.0621 2.75 17.5C2.75 18.2637 3.47401 19.2048 5.23671 19.998C6.929 20.7596 9.31952 21.25 12 21.25C14.6805 21.25 17.071 20.7596 18.7633 19.998C20.526 19.2048 21.25 18.2637 21.25 17.5C21.25 17.0621 21.0248 16.57 20.4571 16.0559C20.1501 15.7779 20.1266 15.3036 20.4046 14.9966C20.6826 14.6895 21.1569 14.666 21.4639 14.9441C22.227 15.635 22.75 16.5011 22.75 17.5C22.75 19.2216 21.2354 20.5305 19.3788 21.3659C17.4518 22.2331 14.8424 22.75 12 22.75C9.15764 22.75 6.54815 22.2331 4.62116 21.3659C2.76457 20.5305 1.25 19.2216 1.25 17.5C1.25 16.5011 1.77305 15.635 2.53605 14.9441C2.84309 14.666 3.31738 14.6895 3.59541 14.9966Z" fill="#1cc7aa" />
                  </svg>
                </span>
                6 Surrey Glen, 304 Surrey Avenue, Ferndale, Randburg, 2194
              </li>
              <li>
                <a href="tel:+27113428734" className="flex items-center gap-4.5 ease-out duration-200 hover:text-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.7177 3.0919C5.94388 1.80096 7.9721 2.04283 8.98569 3.47641L10.2467 5.25989C11.0574 6.40656 10.9889 8.00073 10.0214 9.0194L9.7765 9.27719C9.76142 9.31935 9.7287 9.43513 9.7609 9.65489C9.82765 10.1104 10.1793 11.0361 11.607 12.5392C13.0391 14.0469 13.9078 14.4023 14.3103 14.4677C14.484 14.4959 14.5748 14.4714 14.6038 14.4612L15.0124 14.031C15.8862 13.111 17.2485 12.9298 18.347 13.5621L20.2575 14.6617C21.8904 15.6016 22.2705 17.9008 20.9655 19.2747L19.545 20.7703C19.1016 21.2371 18.497 21.6355 17.75 21.7092C15.9261 21.8893 11.701 21.6548 7.27161 16.9915C3.13844 12.64 2.35326 8.85513 2.25401 7.00591C2.20497 6.09224 2.61224 5.30855 3.1481 4.7444L4.7177 3.0919Z" fill="#1cc7aa" />
                  </svg>
                  +27 11 342 8734
                </a>
              </li>
              <li>
                <a href="mailto:support@example.com" className="flex items-center gap-4.5 ease-out duration-200 hover:text-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.94358 3.25H14.0564C15.8942 3.24998 17.3498 3.24997 18.489 3.40314C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33856 22.5969 7.51098C22.75 8.65019 22.75 10.1058 22.75 11.9436V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.6104 20.1071 19.6614 20.4392 18.489 20.5969C17.3498 20.75 15.8942 20.75 14.0564 20.75H9.94359C8.10583 20.75 6.65019 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10582 3.24998 9.94358 3.25ZM5.42383 7.51986C5.68901 7.20165 6.16193 7.15866 6.48014 7.42383L8.63903 9.22291C9.57199 10.0004 10.2197 10.5384 10.7666 10.8901C11.2959 11.2306 11.6549 11.3449 12 11.3449C12.3451 11.3449 12.7041 11.2306 13.2334 10.8901C13.7803 10.5384 14.428 10.0004 15.361 9.22291L17.5199 7.42383C17.8381 7.15866 18.311 7.20165 18.5762 7.51986C18.8413 7.83807 18.7983 8.31099 18.4801 8.57617L16.2836 10.4066C15.3973 11.1452 14.6789 11.7439 14.0448 12.1517C13.3843 12.5765 12.7411 12.8449 12 12.8449C11.2589 12.8449 10.6157 12.5765 9.95518 12.1517C9.32112 11.7439 8.60272 11.1452 7.71636 10.4066L5.51986 8.57617C5.20165 8.31099 5.15866 7.83807 5.42383 7.51986Z" fill="#1cc7aa" />
                  </svg>
                  support@example.com
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">Account</h2>
            <ul className="flex flex-col gap-3.5">
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/my-account">My Account</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/signin">Login / Register</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/cart">Cart</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/wishlist">Wishlist</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/shop-with-sidebar">Shop</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">Quick Link</h2>
            <ul className="flex flex-col gap-3">
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/refund-policy">Refund Policy</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/terms-of-use">Terms of Use</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/faqs">FAQ&apos;s</Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue" href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-dark">Follow Us</h2>
            <p className="text-custom-sm text-dark-5 mb-5">Stay connected on social media</p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 ease-out duration-200 hover:border-blue hover:text-blue"
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.99984 0.666504C7.48706 0.666504 6.09165 1.04648 4.81361 1.80644C3.53557 2.54019 2.51836 3.5491 1.76197 4.83317C1.03166 6.11724 0.666504 7.51923 0.666504 9.03915C0.666504 10.428 0.966452 11.7252 1.56635 12.9307C2.19233 14.1099 3.04 15.0926 4.10938 15.8788C5.17876 16.6649 6.37855 17.1497 7.70876 17.3332V11.4763H5.59608V9.03915H7.70876V7.19166C7.70876 6.16965 7.98262 5.37038 8.53035 4.79386C9.10417 4.21734 9.8736 3.92908 10.8386 3.92908C11.4646 3.92908 12.0906 3.98149 12.7166 4.08632V6.16965H11.6602C11.1908 6.16965 10.8386 6.30068 10.6039 6.56273C10.3952 6.79858 10.2909 7.09994 10.2909 7.46682V9.03915H12.6383L12.2471 11.4763H10.2909V17.3332C11.6472 17.1235 12.86 16.6256 13.9294 15.8395C14.9988 15.0533 15.8334 14.0706 16.4333 12.8913C17.0332 11.6859 17.3332 10.4018 17.3332 9.03915C17.3332 7.51923 16.955 6.11724 16.1986 4.83317C15.4683 3.5491 14.4641 2.54019 13.1861 1.80644C11.908 1.04648 10.5126 0.666504 8.99984 0.666504Z" fill="" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 ease-out duration-200 hover:border-blue hover:text-blue"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.3332 4.91293C17.7353 5.18229 17.0875 5.36594 16.39 5.46389C17.1124 5.02312 17.6107 4.39869 17.8847 3.59061C17.2121 3.98241 16.4896 4.25177 15.7173 4.39869C15.0447 3.68856 14.1976 3.3335 13.1762 3.3335C12.2544 3.3335 11.4572 3.66407 10.7846 4.32523C10.1119 4.98639 9.77562 5.78223 9.77562 6.71274C9.77562 6.95762 9.81299 7.21473 9.88773 7.48409C8.49261 7.41063 7.17223 7.06781 5.92659 6.45563C4.70587 5.81896 3.67198 4.98639 2.82495 3.95792C2.526 4.47216 2.37652 5.03536 2.37652 5.64755C2.37652 6.23524 2.51354 6.77396 2.78758 7.26371C3.06162 7.75345 3.42286 8.14525 3.87129 8.4391C3.34812 8.4391 2.83741 8.30442 2.33915 8.03506V8.07179C2.33915 8.87987 2.60073 9.59 3.1239 10.2022C3.64707 10.8144 4.29481 11.2062 5.0671 11.3776C4.79306 11.451 4.49411 11.4878 4.17024 11.4878C3.97094 11.4878 3.75918 11.4633 3.53496 11.4143C3.75918 12.0999 4.15778 12.6632 4.73078 13.1039C5.32869 13.5202 5.98888 13.7406 6.71135 13.7651C5.49062 14.7201 4.08305 15.1976 2.48863 15.1976C2.21459 15.1976 1.94054 15.1853 1.6665 15.1609C3.26092 16.1648 5.00482 16.6668 6.89819 16.6668C8.89122 16.6668 10.66 16.1648 12.2046 15.1609C13.6247 14.2793 14.7333 13.0794 15.5305 11.5612C16.2779 10.1165 16.6516 8.635 16.6516 7.11678L16.6142 6.67601C17.2868 6.21075 17.8598 5.62306 18.3332 4.91293Z" fill="" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 ease-out duration-200 hover:border-blue hover:text-blue"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_footer_ig)">
                    <path d="M19.6562 6C19.625 5 19.4375 4.28125 19.2187 3.625C19 2.96875 18.6562 2.4375 18.125 1.90625C17.5937 1.375 17.0625 1.0625 16.4375 0.8125C15.8125 0.5625 15.125 0.40625 14.0625 0.375C12.9687 0.3125 12.6562 0.3125 10 0.3125C7.34375 0.3125 7.0625 0.3125 6 0.34375C4.9375 0.375 4.28125 0.5625 3.625 0.78125C2.96875 1 2.4375 1.375 1.90625 1.90625C1.375 2.4375 1.03125 2.96875 0.8125 3.625C0.5625 4.25 0.40625 4.9375 0.375 6C0.34375 7.0625 0.3125 7.34375 0.3125 10C0.3125 12.6562 0.3125 12.9375 0.34375 14C0.375 15.0625 0.5625 15.7188 0.78125 16.375C1 17.0312 1.34375 17.5625 1.875 18.0938C2.40625 18.625 2.96875 18.9688 3.59375 19.1875C4.21875 19.4062 4.90625 19.5938 5.96875 19.625C7.03125 19.6875 7.3125 19.6875 9.96875 19.6875C12.625 19.6875 12.9062 19.6875 13.9687 19.6562C15.0312 19.625 15.6875 19.4375 16.3437 19.2188C17 19 17.5312 18.6562 18.0625 18.125C18.5937 17.5938 18.9375 17.0312 19.1562 16.4062C19.375 15.7812 19.5625 15.0938 19.5937 14.0312C19.625 13.0312 19.625 12.7188 19.625 10.0625C19.625 7.40625 19.6875 7.0625 19.6562 6ZM10.0005 13.25C8.18799 13.25 6.75049 11.7812 6.75049 10C6.75049 8.21875 8.21924 6.75 10.0005 6.75C11.813 6.75 13.2505 8.1875 13.2505 10C13.2505 11.8125 11.813 13.25 10.0005 13.25ZM15.2188 5.96875C14.5802 5.96875 14.0625 5.45106 14.0625 4.8125C14.0625 4.17391 14.5802 3.65625 15.2188 3.65625C15.8573 3.65625 16.375 4.17391 16.375 4.8125C16.375 5.45106 15.8573 5.96875 15.2188 5.96875Z" fill="" />
                  </g>
                  <defs>
                    <clipPath id="clip0_footer_ig">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 ease-out duration-200 hover:border-blue hover:text-blue"
              >
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6535 1.6665C17.1222 1.6665 17.5129 1.83577 17.8254 2.17432C18.1639 2.48682 18.3332 2.87744 18.3332 3.34619V16.6535C18.3332 17.1222 18.1639 17.5259 17.8254 17.8644C17.5129 18.1769 17.1222 18.3332 16.6535 18.3332H3.34619C2.87744 18.3332 2.4738 18.1769 2.13525 17.8644C1.82275 17.5259 1.6665 17.1222 1.6665 16.6535V3.34619C1.6665 2.87744 1.82275 2.48682 2.13525 2.17432C2.4738 1.83577 2.87744 1.6665 3.34619 1.6665H16.6535ZM15.4295 15.4295V11.0155C15.4295 10.2603 15.1561 9.62223 14.6092 9.1014C14.0884 8.55452 13.4504 8.28109 12.6952 8.28109C12.3306 8.28109 11.966 8.38525 11.6014 8.59359C11.2368 8.80192 10.9634 9.06234 10.7811 9.37484V8.43734H8.43734V15.4295H10.7811V11.2889C10.7811 10.9764 10.8853 10.716 11.0936 10.5077C11.328 10.2733 11.6014 10.1561 11.9139 10.1561C12.2524 10.1561 12.5259 10.2733 12.7342 10.5077C12.9686 10.716 13.0858 10.9764 13.0858 11.2889V15.4295H15.4295ZM5.74202 7.14827C6.13265 7.14827 6.45817 7.01807 6.71859 6.75765C7.00505 6.47119 7.14827 6.13265 7.14827 5.74202C7.14827 5.3514 7.00505 5.02588 6.71859 4.76546C6.45817 4.479 6.13265 4.33577 5.74202 4.33577C5.3514 4.33577 5.01286 4.479 4.7264 4.76546C4.46598 5.02588 4.33577 5.3514 4.33577 5.74202C4.33577 6.13265 4.46598 6.47119 4.7264 6.75765C5.01286 7.01807 5.3514 7.14827 5.74202 7.14827ZM6.87484 15.4295V8.43734H4.57015V15.4295H6.87484Z" fill="" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer bottom */}
      <div className="py-5 xl:py-7.5 bg-gray-1">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-5 flex-wrap items-center justify-between">
            <p className="text-dark font-medium">
              &copy; {year}. Developed by{" "}
              <a
                href="https://techxplo.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue hover:underline"
              >
                TechXplo
              </a>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <p className="font-medium">We Accept:</p>
              <div className="flex flex-wrap items-center gap-6">
                <a href="#" aria-label="payment system with visa card">
                  <Image src="/images/payment/payment-01.svg" alt="visa card" width={66} height={22} />
                </a>
                <a href="#" aria-label="payment system with paypal">
                  <Image src="/images/payment/payment-02.svg" alt="paypal" width={18} height={21} />
                </a>
                <a href="#" aria-label="payment system with master card">
                  <Image src="/images/payment/payment-03.svg" alt="master card" width={33} height={24} />
                </a>
                <a href="#" aria-label="payment system with apple pay">
                  <Image src="/images/payment/payment-04.svg" alt="apple pay" width={52} height={22} />
                </a>
                <a href="#" aria-label="payment system with google pay">
                  <Image src="/images/payment/payment-05.svg" alt="google pay" width={56} height={22} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
