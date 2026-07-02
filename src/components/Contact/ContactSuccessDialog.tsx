import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ContactSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactSuccessDialog({
  open,
  onOpenChange,
}: ContactSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-[radial-gradient(circle,#41a2c5_0%,#388dab_100%)] p-6 sm:p-8 border-0 rounded-[30px] text-center text-white ring-0"
      >
        <DialogHeader className="items-center gap-3">
          <div className="flex justify-center items-center bg-glace-yellow rounded-full size-16">
            <CheckCircle2 className="size-9 text-[#388dab]" strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-2xl text-white">
            تم إرسال رسالتك بنجاح
          </DialogTitle>
          <DialogDescription className="text-base text-white/90">
            شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت ممكن.
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-[#4397ae] hover:bg-[#4397ae]/90 mt-4 px-6 py-2.5 rounded-[30px] w-full text-white text-lg transition-colors cursor-pointer"
        >
          حسناً
        </button>
      </DialogContent>
    </Dialog>
  );
}
