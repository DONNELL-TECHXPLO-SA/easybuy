"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";

const PreviewSliderModal = () => {
  const { closePreviewModal, isModalPreviewOpen } = usePreviewSlider();

  const data = useAppSelector((state) => state.productDetailsReducer.value);
  const previewImages = data?.imgs?.previews ?? [];
  const thumbnailImages = data?.imgs?.thumbnails ?? [];
  const galleryImages = Array.from(
    new Set([...previewImages, ...thumbnailImages].filter(Boolean))
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [data.id, isModalPreviewOpen]);

  const handlePrev = () => {
    if (galleryImages.length <= 1) return;
    setActiveIndex(
      (current) => (current - 1 + galleryImages.length) % galleryImages.length
    );
  };

  const handleNext = () => {
    if (galleryImages.length <= 1) return;
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  };

  return (
    <div
      className={`preview-slider w-full h-screen z-999999 inset-0 flex justify-center items-center bg-[#000000F2] bg-opacity-70 ${isModalPreviewOpen ? "fixed" : "hidden"
        }`}
    >
      <button
        onClick={() => closePreviewModal()}
        aria-label="button for close modal"
        className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 text-white hover:text-meta-5 z-10"
      >
        <svg
          className="fill-current"
          width="36"
          height="36"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
            fill=""
          />
        </svg>
      </button>

      <div className="relative flex items-center justify-center w-full h-full px-6">
        <button
          type="button"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 rotate-180 p-3 sm:p-5 cursor-pointer z-20 text-white hover:text-meta-5 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={galleryImages.length <= 1}
          aria-label="Previous image"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.5918 5.92548C14.9091 5.60817 15.4236 5.60817 15.7409 5.92548L22.2409 12.4255C22.5582 12.7428 22.5582 13.2572 22.2409 13.5745L15.7409 20.0745C15.4236 20.3918 14.9091 20.3918 14.5918 20.0745C14.2745 19.7572 14.2745 19.2428 14.5918 18.9255L19.7048 13.8125H4.33301C3.88428 13.8125 3.52051 13.4487 3.52051 13C3.52051 12.5513 3.88428 12.1875 4.33301 12.1875H19.7048L14.5918 7.07452C14.2745 6.75722 14.2745 6.24278 14.5918 5.92548Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="flex justify-center items-center max-w-[90vw] max-h-[80vh]">
        {galleryImages.length > 0 ? (
          <Image
            src={galleryImages[activeIndex]}
            alt={data.title || "product image"}
            width={900}
            height={900}
            className="max-h-[80vh] w-auto object-contain"
          />
        ) : (
          <div className="text-white text-sm">No product images available.</div>
        )}
        </div>

        <button
          type="button"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-5 cursor-pointer z-20 text-white hover:text-meta-5 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={galleryImages.length <= 1}
          aria-label="Next image"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.5918 5.92548C14.9091 5.60817 15.4236 5.60817 15.7409 5.92548L22.2409 12.4255C22.5582 12.7428 22.5582 13.2572 22.2409 13.5745L15.7409 20.0745C15.4236 20.3918 14.9091 20.3918 14.5918 20.0745C14.2745 19.7572 14.2745 19.2428 14.5918 18.9255L19.7048 13.8125H4.33301C3.88428 13.8125 3.52051 13.4487 3.52051 13C3.52051 12.5513 3.88428 12.1875 4.33301 12.1875H19.7048L14.5918 7.07452C14.2745 6.75722 14.2745 6.24278 14.5918 5.92548Z"
              fill="currentColor"
            />
          </svg>
        </button>

      {galleryImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${index === activeIndex ? "bg-white" : "bg-white/40"}`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default PreviewSliderModal;
