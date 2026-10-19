"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteQuote, saveQuote } from "./actions";
import { lineTotal, parseMoney, parseQty } from "@/lib/quote-math";
import { money } from "@/lib/format";
import type { Rate } from "./rates/rate-card";
import { cardClass, fieldClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/ui";
import { IconCheck, IconExternal, IconPlus, IconX } from "@/components/icons";
import { common, quotes } from "@/messages/mn";

const t = quotes.builder;

type Line = { key: string; label: string; unit: string; price: string; qty: string };

export type QuoteInitial = {
  id: number | null;
  token: string | null;
  inquiryId: number | null;
  clientName: string;
  address: string;
  note: string;
  includesMaterials: boolean;
  validUntil: string;
  lines: { label: string; unit: string; unitPrice: number; quantity: number }[];
};

const smallAction =
  "inline-flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border border-line bg-surface px-2 text-center text-sm leading-tight font-semibold transition-colors duration-150 hover:border-ink-2";

let keySeq = 0;
const newKey = () => `l${++keySeq}`;

export function QuoteBuilder({ initial, rates, siteUrl }: { initial: QuoteInitial; rates: Rate[]; siteUrl: string }) {
  const router = useRouter();
  const [id, setId] = useState(initial.id);
  const [token, setToken] = useState(initial.token);
  const [clientName, setClientName] = useState(initial.clientName);
  const [address, setAddress] = useState(initial.address);
  const [note, setNote] = useState(initial.note);
  const [materials, setMaterials] = useState(initial.includesMaterials);
  const [validUntil, setValidUntil] = useState(initial.validUntil);
  const [lines, setLines] = useState<Line[]>(() =>
    initial.lines.map((l) => ({ key: newKey(), label: l.label, unit: l.unit, price: String(l.unitPrice), qty: String(l.quantity) })),
  );
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const pickerRef = useRef<HTMLDialogElement>(null);

  const totals = useMemo(() => lines.map((l) => lineTotal(parseMoney(l.price), parseQty(l.qty))), [lines]);
  const total = totals.reduce((a, b) => a + b, 0);
  const publicUrl = token ? `${siteUrl}/une/${token}` : "";

  function touch() {
    setDirty(true);
    setJustSaved(false);
  }

  function patch(key: string, p: Partial<Line>) {
    setLines((list) => list.map((l) => (l.key === key ? { ...l, ...p } : l)));
    touch();
  }

  function step(key: string, dir: 1 | -1) {
    const line = lines.find((l) => l.key === key)!;
    const next = Math.max(0, Math.round((parseQty(line.qty) + dir) * 100) / 100);
    patch(key, { qty: String(next) });
  }

  function addRates(selected: Rate[]) {
    setLines((list) => [
      ...list,
      ...selected.map((r) => ({ key: newKey(), label: r.label, unit: r.unit, price: String(r.unitPrice), qty: "1" })),
    ]);
    touch();
  }

  function save() {
    start(async () => {
      const result = await saveQuote(id, {
        clientName,
        address,
        note,
        includesMaterials: materials,
        validUntil,
        inquiryId: initial.inquiryId,
        lines: lines
          .filter((l) => l.label.trim())
          .map((l) => ({ label: l.label, unit: l.unit, unitPrice: parseMoney(l.price), quantity: parseQty(l.qty) })),
      });
      setDirty(false);
      setJustSaved(true);
      if (!id) {
        setId(result.id);
        setToken(result.token);
        router.replace(`/admin/quotes/${result.id}`);
      }
    });
  }

  async function share() {
    if (!publicUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: quotes.public.heading, url: publicUrl });
      } catch {}
    } else {
      copy();
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="container-page max-w-2xl space-y-4 pb-44">
      {token && (
        <section className={`${cardClass} border-accent/40 bg-accent-soft/50 p-4`}>
          <p className="truncate text-sm text-ink-2 tabular">{publicUrl}</p>
          <button type="button" onClick={share} disabled={dirty} className={`${primaryButtonClass} mt-3 w-full`}>
            {t.share}
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" onClick={copy} className={smallAction}>
              {copied ? <IconCheck size={20} /> : null}
              {copied ? t.copied : t.copyLink}
            </button>
            <a href={`/une/${token}/pdf`} className={smallAction}>
              {t.pdf}
            </a>
            <a href={`/une/${token}`} target="_blank" className={smallAction}>
              <IconExternal size={18} />
              {t.open}
            </a>
          </div>
          {dirty && <p className="mt-2 text-sm font-semibold text-accent">{t.unsaved}</p>}
        </section>
      )}

      <section className={`${cardClass} space-y-4 p-4`}>
        <h2 className="text-xl font-bold">{t.client}</h2>
        <div>
          <label htmlFor="clientName" className={labelClass}>
            {t.clientName}
          </label>
          <input id="clientName" value={clientName} onChange={(e) => (setClientName(e.target.value), touch())} maxLength={190} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>
            {t.address}
          </label>
          <input id="address" value={address} onChange={(e) => (setAddress(e.target.value), touch())} maxLength={255} placeholder={t.addressPlaceholder} className={fieldClass} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="pt-4 text-xl font-bold">{t.items}</h2>
        {lines.length === 0 && <p className="text-base text-ink-2">{t.noLines}</p>}
        <ul className="space-y-3">
          {lines.map((l, i) => (
            <li key={l.key} className={`${cardClass} p-4`}>
              <div className="flex items-start gap-2">
                <label className="sr-only" htmlFor={`label-${l.key}`}>
                  {t.customLabel}
                </label>
                <textarea
                  id={`label-${l.key}`}
                  value={l.label}
                  onChange={(e) => patch(l.key, { label: e.target.value })}
                  rows={1}
                  maxLength={190}
                  placeholder={t.customLabel}
                  className="field-sizing-content min-h-11 flex-1 resize-none rounded-lg bg-transparent px-1 py-2 text-lg leading-snug font-semibold focus:bg-surface-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => (setLines((list) => list.filter((x) => x.key !== l.key)), touch())}
                  aria-label={t.removeLine}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2 hover:text-danger"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-[auto_1fr] items-end gap-3">
                <div>
                  <span className="mb-1 block text-sm text-ink-2" id={`qty-label-${l.key}`}>
                    {t.quantity}
                  </span>
                  <div className="flex h-14 items-center rounded-control border border-line bg-bg">
                    <button type="button" onClick={() => step(l.key, -1)} aria-label={t.decrease} className="grid h-full w-12 place-items-center text-2xl font-semibold">
                      {"−"}
                    </button>
                    <input
                      value={l.qty}
                      onChange={(e) => patch(l.key, { qty: e.target.value.replace(/[^\d.,]/g, "") })}
                      inputMode="decimal"
                      aria-labelledby={`qty-label-${l.key}`}
                      className="h-full w-16 bg-transparent text-center text-lg font-bold tabular focus:outline-none"
                    />
                    <button type="button" onClick={() => step(l.key, 1)} aria-label={t.increase} className="grid h-full w-12 place-items-center text-2xl font-semibold">
                      {"+"}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor={`price-${l.key}`} className="mb-1 block text-sm text-ink-2">
                    {t.unitPrice}
                    {l.unit ? ` / ${l.unit}` : ""}
                  </label>
                  <input
                    id={`price-${l.key}`}
                    value={l.price}
                    onChange={(e) => patch(l.key, { price: e.target.value.replace(/[^\d]/g, "") })}
                    inputMode="numeric"
                    className={`${fieldClass} tabular`}
                  />
                </div>
              </div>
              <p className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-base text-ink-2">{t.lineTotal}</span>
                <span className="font-display text-xl font-bold tabular">{money(totals[i])}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => pickerRef.current?.showModal()} className={primaryButtonClass}>
            <IconPlus />
            {t.addFromList}
          </button>
          <button
            type="button"
            onClick={() => (setLines((list) => [...list, { key: newKey(), label: "", unit: "", price: "", qty: "1" }]), touch())}
            className={secondaryButtonClass}
          >
            {t.addCustom}
          </button>
        </div>
      </section>

      <section className={`${cardClass} mt-6 space-y-4 p-4`}>
        <div onChange={() => touch()}>
          <MaterialsToggle checked={materials} onChange={setMaterials} />
        </div>
        <div>
          <label htmlFor="validUntil" className={labelClass}>
            {t.validUntil}
          </label>
          <input id="validUntil" type="date" value={validUntil} onChange={(e) => (setValidUntil(e.target.value), touch())} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="note" className={labelClass}>
            {t.note}
          </label>
          <textarea id="note" value={note} onChange={(e) => (setNote(e.target.value), touch())} rows={3} maxLength={4000} placeholder={t.notePlaceholder} className={`${fieldClass} py-3`} />
        </div>
      </section>

      {id && (
        <button
          type="button"
          className="mx-auto block min-h-12 px-4 text-base font-semibold text-danger"
          onClick={() => {
            if (confirm(t.confirmDelete)) start(() => deleteQuote(id));
          }}
        >
          {t.deleteQuote}
        </button>
      )}

      {/* Sticky total + save, above the phone tab bar. */}
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-[17rem]">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-2">{quotes.total}</p>
            <p className="truncate font-display text-2xl font-bold tabular" aria-live="polite">
              {money(total)}
            </p>
          </div>
          <button type="button" onClick={save} disabled={pending || (!dirty && !!id)} className={`${primaryButtonClass} min-w-36`}>
            {pending ? (
              common.saving
            ) : justSaved && !dirty ? (
              <>
                <IconCheck />
                {t.saved}
              </>
            ) : (
              t.save
            )}
          </button>
        </div>
      </div>

      <RatePicker ref={pickerRef} rates={rates} onAdd={addRates} />
    </div>
  );
}

function MaterialsToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-4 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold">{t.materials}</span>
        <span className="mt-0.5 block text-base text-ink-2">{t.materialsHint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-8 w-14 shrink-0 rounded-full bg-line transition-colors duration-200 peer-checked:bg-accent after:absolute after:top-1 after:left-1 after:size-6 after:rounded-full after:bg-surface after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-6"
      />
    </label>
  );
}

function RatePicker({ ref, rates, onAdd }: { ref: React.Ref<HTMLDialogElement>; rates: Rate[]; onAdd: (r: Rate[]) => void }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const groups = useMemo(() => {
    const map = new Map<string, Rate[]>();
    for (const r of rates) {
      const k = r.category || quotes.rates.noCategory;
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map];
  }, [rates]);

  function close(dialog: HTMLDialogElement | null) {
    setSelected(new Set());
    dialog?.close();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="picker-title"
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-card bg-bg p-0 text-ink backdrop:bg-black/50 md:m-auto md:max-w-xl md:rounded-card"
      onClose={() => setSelected(new Set())}
    >
      <div className="flex max-h-[88dvh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 id="picker-title" className="text-xl font-bold">
              {t.pickTitle}
            </h2>
            <p className="text-sm text-ink-2">{t.pickHint}</p>
          </div>
          <button type="button" onClick={(e) => close(e.currentTarget.closest("dialog"))} aria-label={common.close} className="grid size-12 place-items-center rounded-full hover:bg-surface-2">
            <IconX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {rates.length === 0 && <p className="text-base text-ink-2">{quotes.rates.empty}</p>}
          {groups.map(([category, items]) => (
            <fieldset key={category} className="mb-5">
              <legend className="mb-2 text-sm font-bold tracking-wide text-ink-2 uppercase">{category}</legend>
              <div className="space-y-2">
                {items.map((r) => (
                  <label
                    key={r.id}
                    className="flex min-h-16 cursor-pointer items-center gap-3 rounded-control border border-line bg-surface p-3 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-3 has-focus-visible:outline-focus"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.id);
                        else next.delete(r.id);
                        setSelected(next);
                      }}
                      className="size-6 shrink-0 accent-[var(--accent)]"
                    />
                    <span className="min-w-0 flex-1 text-base leading-snug font-semibold">{r.label}</span>
                    <span className="shrink-0 text-sm font-semibold text-ink-2 tabular">
                      {money(r.unitPrice)}
                      {quotes.rates.per}
                      {r.unit}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={(e) => {
              onAdd(rates.filter((r) => selected.has(r.id)));
              close(e.currentTarget.closest("dialog"));
            }}
            className={`${primaryButtonClass} w-full`}
          >
            <IconPlus />
            {selected.size > 0 ? `${common.add} (${selected.size})` : common.add}
          </button>
        </div>
      </div>
    </dialog>
  );
}
