"use client";

import clsx from "clsx";
import { useId, useMemo, useState } from "react";
import { FOODS, type Food, type FoodCategory } from "@/lib/data/foods";

const CATEGORY_ORDER: FoodCategory[] = ["grains", "dal & curry", "breakfast", "snacks", "drinks", "fruit", "sweets"];

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type FoodPickerProps = {
  selected: Food | null;
  onSelect: (food: Food | null) => void;
  compact?: boolean;
};

/** Searchable list of foods, grouped by category. Choosing one collapses it to a summary. */
export function FoodPicker({ selected, onSelect, compact }: FoodPickerProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = FOODS.filter(
      (food) => !needle || food.name.toLowerCase().includes(needle) || food.category.includes(needle),
    );
    return CATEGORY_ORDER.map((category) => ({
      category,
      foods: matches.filter((food) => food.category === category),
    })).filter((group) => group.foods.length > 0);
  }, [query]);

  if (selected) {
    return (
      <div>
        <span className="block text-xs font-medium">Food</span>
        <div className="mt-1.5 flex items-start justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2">
          <div className="min-w-0 text-sm">
            <div className="font-medium">{selected.name}</div>
            <div className="mt-0.5 text-xs text-muted">
              {selected.portionLabel} · <span className="font-mono">{selected.carbsPerPortionG}</span> g carbs · GI{" "}
              <span className="font-mono">{selected.gi}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 rounded-sm text-xs text-muted underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-text"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium">
        Food
      </label>
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search, e.g. roti or dal"
        className="mt-1.5 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm transition-colors duration-150 ease-out placeholder:text-muted focus-visible:border-accent"
      />
      <div className={clsx("mt-2 overflow-y-auto", compact ? "max-h-40" : "max-h-44", "rounded-md border border-border bg-surface")} tabIndex={-1}>
        {groups.length === 0 && <p className="px-3 py-3 text-sm text-muted">No food matches “{query}”.</p>}
        {groups.map((group) => (
          <section key={group.category} aria-label={capitalise(group.category)}>
            <h3 className="sticky top-0 border-b border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
              {group.category}
            </h3>
            <ul>
              {group.foods.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(food)}
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-1.5 text-left text-sm transition-colors duration-150 ease-out hover:bg-background"
                  >
                    <span>{food.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted">{food.carbsPerPortionG} g</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
