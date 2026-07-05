"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

interface ImageZoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  src: any;
  alt: string;
}

export default function ImageZoomDialog({
  isOpen,
  onClose,
  src,
  alt,
}: ImageZoomDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="z-9999 bg-black/40" />
      <DialogContent
        className="z-9999 w-full max-w-sm p-0 border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <div className="flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            width={320}
            height={320}
            className="h-80 w-80 object-contain drop-shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
