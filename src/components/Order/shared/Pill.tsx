export function Pill({
  label,
  active,
  unavailable,
  onClick,
  subtitle,
  image,
}: {
  label: string;
  active: boolean;
  unavailable?: boolean;
  onClick: () => void;
  subtitle?: string;
  /** Optional thumbnail (e.g. a container's photo) shown above the label. */
  image?: string;
}) {
  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full border text-[14px] font-medium transition-all cursor-pointer flex items-center gap-2 ${
        unavailable
          ? "opacity-40 bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
          : active
            ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] font-bold"
            : "bg-white/10 border-white/20 text-white hover:bg-white/18"
      }`}
    >
      {image && (
        <img
          src={image}
          alt=""
          className={`w-8 h-8 object-contain shrink-0 ${unavailable ? "opacity-50" : ""}`}
        />
      )}
      <span>{label}</span>
      {subtitle && (
        <span
          className={`text-[11px] ${
            active ? "text-[#1e6a7f]/70" : "text-white/60"
          }`}
        >
          {subtitle}
        </span>
      )}
      {unavailable && <span className="text-[11px]">(غير متوفر)</span>}
    </button>
  );
}

export default Pill;
