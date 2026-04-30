"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbPromotion } from "@/types/database";
import Link from "next/link";
import Image from "next/image";

import "swiper/css/pagination";
import "swiper/css";

const FALLBACK_SLIDES = [
  {
    id: 1,
    title: "True Wireless Noise Cancelling Headphone",
    subtitle: "Sale\nOff",
    discount_label: "30%",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at ipsum at risus euismod lobortis in",
    image_url: "/images/hero/hero-01.png",
    button_text: "Shop Now",
    button_link: "/shop-with-sidebar",
    is_active: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    title: "True Wireless Noise Cancelling Headphone",
    subtitle: "Sale\nOff",
    discount_label: "30%",
    description: "Lorem ipsum dolor sit, consectetur elit nunc suscipit non ipsum nec suscipit.",
    image_url: "/images/hero/hero-01.png",
    button_text: "Shop Now",
    button_link: "/shop-with-sidebar",
    is_active: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
];

const HeroCarousal = () => {
  const [slides, setSlides] = useState<DbPromotion[]>(FALLBACK_SLIDES as DbPromotion[]);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (data && data.length > 0) {
          setSlides(data as DbPromotion[]);
        }
      } catch {
        // keep fallback slides
      }
    };
    load();
  }, []);

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              {(slide.discount_label || slide.subtitle) && (
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  {slide.discount_label && (
                    <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                      {slide.discount_label}
                    </span>
                  )}
                  {slide.subtitle && (
                    <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                      {slide.subtitle.split("\n").map((line, i) => (
                        <span key={i}>{line}{i < slide.subtitle.split("\n").length - 1 && <br />}</span>
                      ))}
                    </span>
                  )}
                </div>
              )}

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                <Link href={slide.button_link || "/shop-with-sidebar"}>
                  {slide.title}
                </Link>
              </h1>

              {slide.description && <p>{slide.description}</p>}

              <Link
                href={slide.button_link || "/shop-with-sidebar"}
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
              >
                {slide.button_text || "Shop Now"}
              </Link>
            </div>

            <div>
              <Image
                src={slide.image_url || "/images/hero/hero-01.png"}
                alt={slide.title}
                width={351}
                height={358}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
