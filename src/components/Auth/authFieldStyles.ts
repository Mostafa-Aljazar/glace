/** Shared field styling so auth forms match the checkout form's visual
 *  language (icon-prefixed dark-glass inputs) instead of the older plain
 *  transparent/white-border style. */
export const inputClass =
  "bg-white/8 border border-white/20 text-white placeholder:text-white/40 rounded-[16px] h-12 ps-11 focus-visible:border-glace-yellow/60 focus-visible:ring-glace-yellow/20 transition-colors";
export const labelClass = "text-white/70 text-[13px] font-semibold mb-1.5";
export const fieldIconClass =
  "absolute top-1/2 start-3.5 -translate-y-1/2 text-white/40 pointer-events-none z-10 peer-focus:text-glace-yellow";
