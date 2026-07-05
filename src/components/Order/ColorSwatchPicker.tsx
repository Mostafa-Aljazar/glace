"use client";

interface ColorSwatchOption {
  id: string;
  label: string;
  color: string;
}

interface ColorSwatchPickerProps {
  options: ColorSwatchOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ColorSwatchPicker({
  options,
  selectedId,
  onSelect,
}: ColorSwatchPickerProps) {
  return (
    <div className="flex items-center gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`relative h-10 w-10 rounded-full transition-all ${
            selectedId === option.id
              ? "ring-2 ring-white ring-offset-2 ring-offset-transparent"
              : "hover:scale-110"
          }`}
          style={{ backgroundColor: option.color }}
          title={option.label}
        >
          {selectedId === option.id && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full">
              <div className="h-3 w-3 rounded-full bg-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
