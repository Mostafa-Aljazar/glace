"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

/** A cart line's thumbnail — falls back to a cart icon when the line has no
 *  image or the URL fails to load (e.g. a dashboard image missing from
 *  storage), instead of the browser's broken-image glyph + alt text. */
export default function LineItemImage({
  src,
  alt,
  size,
}: {
  src?: string;
  alt: string;
  size: number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <ShoppingCart size={18} strokeWidth={1.6} className="text-glace-yellow" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="p-1 size-full object-contain"
      onError={() => setFailedSrc(src)}
    />
  );
}
