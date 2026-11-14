"use client";

import { useState } from "react";

import { Icon, toIconName } from "@/components/icons";

/**
 * Visual replacement for the raw `icon` dropdown.
 *
 * The database stores a key (`sprout`, `hand-heart`, …); a text select made
 * staff pick a name without ever seeing the glyph. This renders the actual
 * icons from the shared set and submits the chosen key as a normal radio in
 * the surrounding form, so `AdminForm`'s `useActionState` wiring is unchanged.
 */
export function IconPicker({
  name,
  label,
  defaultValue,
  options,
  error,
  hint,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: readonly string[];
  error?: string;
  hint?: string;
  className?: string;
}) {
  const initial =
    defaultValue && options.includes(defaultValue) ? defaultValue : options[0];
  const [selected, setSelected] = useState(initial);

  return (
    <fieldset className={`flex flex-col gap-1.5 ${className}`}>
      <legend className="field-label">{label}</legend>
      <div className="grid grid-cols-6 gap-2 rounded-2xl border border-hairline bg-white p-3 sm:grid-cols-9">
        {options.map((key) => {
          const active = key === selected;
          return (
            <label
              key={key}
              title={key}
              className={`flex aspect-square cursor-pointer items-center justify-center rounded-xl transition-colors focus-within:ring-2 focus-within:ring-teal/40 ${
                active
                  ? "border-2 border-accent bg-accent/10 text-accent"
                  : "border border-hairline bg-white text-slate hover:border-teal hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={active}
                onChange={() => setSelected(key)}
                className="sr-only"
              />
              <Icon name={toIconName(key)} size={20} />
              <span className="sr-only">{key}</span>
            </label>
          );
        })}
      </div>
      {hint ? <span className="text-xs text-slate">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </fieldset>
  );
}
