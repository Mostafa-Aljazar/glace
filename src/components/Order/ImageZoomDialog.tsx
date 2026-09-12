"use client";

import Image, { type StaticImageData } from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageZoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  src: StaticImageData | string;
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
      <DialogContent
        onClick={onClose}
        overlayClassName="bg-black/80"
        className="w-[calc(100%-2rem)] max-w-lg p-0 border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-3 start-3 flex items-center justify-center size-9 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer z-10"
          >
            <X size={18} />
          </button>
          <Image
            src={src}
            alt={alt}
            width={800}
            height={800}
            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
