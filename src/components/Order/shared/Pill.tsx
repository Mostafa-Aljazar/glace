export function Pill({
  label,
  active,
  unavailable,
  onClick,
}: {
  label: string;
  active: boolean;
  unavailable?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full border text-[14px] font-medium transition-all cursor-pointer ${
        unavailable
          ? "opacity-40 bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
          : active
            ? "bg-glace-yellow border-glace-yellow text-[#1e6a7f] font-bold"
            : "bg-white/10 border-white/20 text-white hover:bg-white/18"
      }`}
    >
      {label}
      {unavailable && <span className="mr-1 text-[11px]">(غير متوفر)</span>}
    </button>
  );
}

export default Pill;
