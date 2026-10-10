"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TimeSelect } from "@/components/ui/time-select";
import { Tag } from "@/components/ui/tag";
import { ICON } from "@/lib/icon";
import { MAX_READINGS, MIN_READINGS, type ReadingDraft, type ReadingsCheck } from "@/lib/readings";

type ReadingsTableProps = {
  rows: ReadingDraft[];
  onChange: (rows: ReadingDraft[]) => void;
  onUseSample: () => void;
  /** Validation result to show; null until the user has tried to calibrate. */
  check: ReadingsCheck | null;
};

/** Small editable table: time and glucometer value per row. */
export function ReadingsTable({ rows, onChange, onUseSample, check }: ReadingsTableProps) {
  function update(id: string, patch: Partial<ReadingDraft>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const lastMinute = rows.length ? Math.max(...rows.map((r) => r.minute)) : 7 * 60;
    onChange([...rows, { id: `r-${Date.now().toString(36)}-${rows.length}`, minute: Math.min(lastMinute + 60, 1435), glucose: "" }]);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Enter <span className="font-mono">{MIN_READINGS}</span> to <span className="font-mono">{MAX_READINGS}</span>{" "}
          readings from your glucometer, with the time you took each.
        </p>
        <div className="flex items-center gap-2">
          <Tag label="Demo" />
          <Button type="button" variant="secondary" className="h-8 px-3" onClick={onUseSample}>
            Use sample readings
          </Button>
        </div>
      </div>

      <ul className="mt-4 max-w-md space-y-3">
        {rows.map((row, index) => (
          <li key={row.id} className="flex items-start gap-3">
            <TimeSelect
              label={`Time of reading ${index + 1}`}
              hideLabel
              stepMin={5}
              value={row.minute}
              onChange={(minute) => update(row.id, { minute })}
              className="w-28 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <TextField
                label={`Glucose of reading ${index + 1}`}
                hideLabel
                unit="mg/dL"
                inputMode="numeric"
                value={row.glucose}
                onChange={(glucose) => update(row.id, { glucose })}
                error={check?.rowErrors[row.id]}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove reading ${index + 1}`}
              onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
              className="flex h-10 items-center px-1 text-muted transition-colors duration-150 ease-out hover:text-low"
            >
              <Trash2 {...ICON} />
            </button>
          </li>
        ))}
      </ul>

      {check?.tableError && <p className="mt-3 text-xs text-low">{check.tableError}</p>}

      <Button
        type="button"
        variant="secondary"
        className="mt-4 h-8 px-3"
        onClick={addRow}
        disabled={rows.length >= MAX_READINGS}
      >
        <Plus {...ICON} className="mr-1.5" />
        Add reading
      </Button>
    </div>
  );
}
