"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FloatingAvatarProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
  delay?: number;
  priority?: boolean;
}

export function FloatingAvatar({
  src,
  alt,
  size,
  className,
  delay = 0,
  priority,
}: FloatingAvatarProps) {
  return (
    <motion.div
      className={cn(
        "size-full overflow-hidden rounded-full border-4 border-background shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)]",
        className,
      )}
      initial={{ opacity: 0, scale: 0.7, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay, ease: "backOut" },
        y: {
          duration: 3.5,
          delay: delay + 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="size-full object-cover"
      />
    </motion.div>
  );
}
