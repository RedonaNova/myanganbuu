"use client";

import { useState, useTransition } from "react";
import { deleteRateItem, reorderRateItems, saveRateItem } from "../actions";
import { parseMoney } from "@/lib/quote-math";
import { money } from "@/lib/format";
import { cardClass, fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconChevronDown, IconChevronUp, IconPlus } from "@/components/icons";
import { admin, common, quotes } from "@/messages/mn";

const t = quotes.rates;

export type Rate = { id: number; label: string; unit: string; unitPrice: number; category: string };

export function RateCard({ initial }: { initial: Rate[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [, start] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);
    start(() => reorderRateItems(next.map((i) => i.id)));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && editing !== "new" && <p className="text-lg text-ink-2">{t.empty}</p>}

      <ul className="space-y-3">
        {items.map((item, i) =>
          editing === item.id ? (
            <li key={item.id}>
              <RateForm
                initial={item}
                onCancel={() => setEditing(null)}
                onSaved={(saved) => {
                  setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)));
                  setEditing(null);
                }}
                onDelete={() => {
                  if (!confirm(t.confirmDelete)) return;
                  setItems((list) => list.filter((x) => x.id !== item.id));
                  setEditing(null);
                  start(() => deleteRateItem(item.id));
                }}
              />
            </li>
          ) : (
            <li key={item.id} className={`${cardClass} flex items-stretch overflow-hidden`}>
              <button type="button" onClick={() => setEditing(item.id)} className="min-w-0 flex-1 p-4 text-left hover:bg-surface-2/60">
                {item.category && <span className="text-sm font-semibold text-ink-2">{item.category}</span>}
                <span className="block text-lg leading-snug font-semibold">{item.label}</span>
                <span className="mt-1 block font-display text-xl font-bold text-accent tabular">
                  {money(item.unitPrice)}
                  <span className="ml-1 text-base font-semibold text-ink-2">
                    {t.per}
                    {item.unit}
                  </span>
                </span>
              </button>
              <div className="flex flex-col border-l border-line">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={admin.photos.moveUp} className="grid flex-1 place-items-center px-3 text-ink-2 disabled:opacity-30">
                  <IconChevronUp />
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={admin.photos.moveDown} className="grid flex-1 place-items-center border-t border-line px-3 text-ink-2 disabled:opacity-30">
                  <IconChevronDown />
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <RateForm
          initial={{ id: 0, label: "", unit: "м²", unitPrice: 0, category: "" }}
          onCancel={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((list) => [...list, saved]);
            setEditing(null);
          }}
        />
      ) : (
        <button type="button" onClick={() => setEditing("new")} className={`${secondaryButtonClass} w-full`}>
          <IconPlus />
          {t.add}
        </button>
      )}
    </div>
  );
}


function RateForm({
  initial,
  onCancel,
  onSaved,
  onDelete,
}: {
  initial: Rate;
  onCancel: () => void;
  onSaved: (r: Rate) => void;
  onDelete?: () => void;
}) {
  const [label, setLabel] = useState(initial.label);
  const [unit, setUnit] = useState(initial.unit);
  const [price, setPrice] = useState(initial.unitPrice ? String(initial.unitPrice) : "");
  const [category, setCategory] = useState(initial.category);
  const [pending, start] = useTransition();
  const valid = label.trim() && unit.trim();

  return (
    <form
      className={`${cardClass} space-y-4 border-accent p-4`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        start(async () => {
          const saved = await saveRateItem({
            id: initial.id || undefined,
            label,
            unit,
            unitPrice: parseMoney(price),
            category,
          });
          onSaved({ id: saved.id, label: saved.label, unit: saved.unit, unitPrice: saved.unitPrice, category: saved.category });
        });
      }}
    >
      <div>
        <label htmlFor={`label-${initial.id}`} className={labelClass}>
          {t.label}
        </label>
        <input id={`label-${initial.id}`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={190} required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <div>
          <label htmlFor={`price-${initial.id}`} className={labelClass}>
            {t.price}
          </label>
          <input
            id={`price-${initial.id}`}
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d\s]/g, ""))}
            inputMode="numeric"
            className={`${fieldClass} tabular`}
          />
        </div>
        <div>
          <label htmlFor={`unit-${initial.id}`} className={labelClass}>
            {t.unit}
          </label>
          <input id={`unit-${initial.id}`} value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={32} required className={fieldClass} />
        </div>
      </div>
      <p className="-mt-2 text-sm text-ink-2">{t.unitHint}</p>
      <div>
        <label htmlFor={`cat-${initial.id}`} className={labelClass}>
          {t.category}
        </label>
        <input id={`cat-${initial.id}`} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={64} className={fieldClass} />
        <p className="mt-1 text-sm text-ink-2">{t.categoryHint}</p>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending || !valid} className={`${primaryButtonClass} flex-1`}>
          {pending ? common.saving : common.save}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          {common.cancel}
        </button>
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} className="min-h-12 text-base font-semibold text-danger">
          {common.delete}
        </button>
      )}
    </form>
  );
}
