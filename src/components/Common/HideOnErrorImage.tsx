"use client";

import { useState, type ComponentProps } from "react";
import Image from "next/image";

/** `next/image` that renders nothing when its source fails to load — for
 *  dashboard-managed decoration where a missing file should just disappear
 *  rather than leave a broken-image box behind. Re-tries if `src` changes. */
export default function HideOnErrorImage(props: ComponentProps<typeof Image>) {
  const [failedSrc, setFailedSrc] = useState<typeof props.src | null>(null);

  if (failedSrc === props.src) return null;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is forwarded via props
    <Image
      {...props}
      onError={(e) => {
        setFailedSrc(props.src);
        props.onError?.(e);
      }}
    />
  );
}
