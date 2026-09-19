"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  hint?: string;
  labelClassName?: string;
};

export function PasswordInput({
  label,
  hint,
  labelClassName,
  className,
  id,
  ...props
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <label
      className={labelClassName ?? "block text-sm font-medium text-[#1B4332]"}
      htmlFor={inputId}
    >
      {label}
      {hint ? <span className="font-normal text-stone-400"> {hint}</span> : null}
      <span className="relative mt-1.5 block">
        <input
          {...props}
          id={inputId}
          type={visible ? "text" : "password"}
          className={
            className ??
            "h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 pr-11 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
          }
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-[#1B4332]"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </span>
    </label>
  );
}
