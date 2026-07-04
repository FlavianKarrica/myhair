"use client";

import { labelClass, textMutedClass } from "@/lib/admin/ui-classes";

export function SwitchField({
  label,
  hint,
  checked,
  onCheckedChange,
  name,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  name: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        {hint ? <p className={`mt-0.5 text-xs ${textMutedClass}`}>{hint}</p> : null}
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          value="true"
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-zinc-700 transition peer-checked:bg-emerald-600" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

export function HiddenSwitchValue({ name, checked }: { name: string; checked: boolean }) {
  return <input type="hidden" name={name} value={checked ? "true" : "false"} />;
}
