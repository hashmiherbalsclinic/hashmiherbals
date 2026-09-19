"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PAKISTAN_CITIES } from "@/lib/pakistan-cities";

type Props = {
  name?: string;
  value: string;
  onChange: (city: string) => void;
  className?: string;
};

export function PakistanCitySelect({
  name = "city",
  value,
  onChange,
  className = "",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAKISTAN_CITIES;
    return PAKISTAN_CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  const pick = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="address-level2"
          placeholder="Search city"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Commit exact match or restore last valid value
            window.setTimeout(() => {
              const match = PAKISTAN_CITIES.find(
                (c) => c.toLowerCase() === query.trim().toLowerCase()
              );
              if (match) {
                onChange(match);
                setQuery(match);
              } else {
                setQuery(value);
              }
            }, 120);
          }}
          className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 pr-10 text-sm text-[#141414] outline-none transition placeholder:text-stone-400 focus:border-[#1B4332]/40 focus:ring-2 focus:ring-[#1B4332]/15"
        />
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-stone-500">No cities match</li>
          ) : (
            filtered.map((city) => (
              <li key={city} role="option" aria-selected={city === value}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(city)}
                  className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-[#1B4332]/5 ${
                    city === value ? "font-semibold text-[#1B4332]" : "text-[#141414]"
                  }`}
                >
                  {city}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-stone-500">
        {PAKISTAN_CITIES.length - 1}+ cities across Pakistan - type to search
      </p>
    </div>
  );
}
