"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function LogoMarquee({ logos }: { logos: Logo[] }) {
  const items = [...logos, ...logos];

  return (
    <div className="relative w-full min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex w-max items-center gap-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        {items.map((logo, i) => (
          <Image
            key={`${logo.src}-${i}`}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            aria-hidden={i >= logos.length}
            className="h-7 w-auto max-w-[130px] shrink-0 object-contain grayscale transition-all duration-300 hover:grayscale-0 hover:scale-105 active:grayscale-0 active:scale-105 sm:h-8 sm:max-w-[150px]"
          />
        ))}
      </motion.div>
    </div>
  );
}
