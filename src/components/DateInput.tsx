"use client";

import { CalendarDays } from "lucide-react";
import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type Ref } from "react";
import { checkDate, parsePastedDate, type DateParts } from "@/lib/date";

interface Props {
  /** Called with a valid ISO date (YYYY-MM-DD), or "" whenever the fields don't form a valid date. */
  onChange: (iso: string) => void;
  /** Earliest allowed ISO date. */
  min: string;
  /** Latest allowed ISO date; "" until the client knows today's date. */
  max: string;
  /** Accessible name for the whole date group. */
  label: string;
  /** Id for the first (day) field, so callers can focus it. */
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  /** Show the calendar glyph inside the box. */
  icon?: boolean;
  /** Let the browser autofill the person's own birthday. */
  autofillBirthday?: boolean;
  /** An error from the parent form (e.g. "Pick a date"); the date's own error wins when both exist. */
  error?: string;
}

type Field = "d" | "m" | "y";
const ORDER: Field[] = ["d", "m", "y"];
const MAX_LEN: Record<Field, number> = { d: 2, m: 2, y: 4 };
const PLACEHOLDER: Record<Field, string> = { d: "DD", m: "MM", y: "YYYY" };
const FIELD_LABEL: Record<Field, string> = { d: "Day", m: "Month", y: "Year" };
const BDAY: Record<Field, string> = { d: "bday-day", m: "bday-month", y: "bday-year" };

const INPUT = "bg-transparent text-center text-base text-foreground outline-none placeholder:text-muted/60";

export function DateInput({ onChange, min, max, label, id, inputRef, icon = false, autofillBirthday = false, error }: Props) {
  const [parts, setParts] = useState<DateParts>({ d: "", m: "", y: "" });
  const [yearTouched, setYearTouched] = useState(false);
  const refs = useRef<Record<Field, HTMLInputElement | null>>({ d: null, m: null, y: null });
  const errorId = useId();

  function commit(next: DateParts) {
    setParts(next);
    const complete = next.d && next.m && next.y.length === 4;
    const res = complete ? checkDate(next, min, max) : null;
    onChange(res?.ok ? res.iso : "");
  }

  function focusField(field: Field, atEnd = true) {
    const el = refs.current[field];
    if (!el) return;
    el.focus();
    if (atEnd) el.setSelectionRange(el.value.length, el.value.length);
  }

  const neighbour = (field: Field, step: 1 | -1): Field | null => ORDER[ORDER.indexOf(field) + step] ?? null;

  function handleChange(field: Field, raw: string) {
    let value = raw.replace(/\D/g, "").slice(0, MAX_LEN[field]);
    // A first digit that can't start a valid day (4-9) or month (2-9) pads itself, so "5" becomes "05".
    if (value.length === 1 && ((field === "d" && Number(value) >= 4) || (field === "m" && Number(value) >= 2))) {
      value = `0${value}`;
    }
    commit({ ...parts, [field]: value });
    const next = neighbour(field, 1);
    if (next && value.length === MAX_LEN[field]) focusField(next, false);
  }

  function handleKeyDown(field: Field, e: KeyboardEvent<HTMLInputElement>) {
    const el = e.currentTarget;
    const prev = neighbour(field, -1);
    const next = neighbour(field, 1);

    if (e.key === "Backspace" && el.value === "" && prev) {
      e.preventDefault();
      focusField(prev);
    } else if (e.key === "ArrowLeft" && prev && el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault();
      focusField(prev);
    } else if (e.key === "ArrowRight" && next && el.selectionStart === el.value.length) {
      e.preventDefault();
      focusField(next, false);
    } else if (["/", ".", "-", " "].includes(e.key) && next) {
      // Typing a separator moves on, padding a lone digit ("5/" -> "05").
      e.preventDefault();
      if (el.value.length === 1) commit({ ...parts, [field]: `0${el.value}` });
      if (el.value.length > 0) focusField(next, false);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const parsed = parsePastedDate(e.clipboardData.getData("text"));
    if (!parsed) return; // let a plain digit paste behave normally
    e.preventDefault();
    commit(parsed);
    focusField("y");
  }

  const complete = parts.d !== "" && parts.m !== "" && parts.y.length === 4;
  const check = complete ? checkDate(parts, min, max) : null;
  const ownError = check && !check.ok ? check.error : parts.y.length > 0 && parts.y.length < 4 && yearTouched ? "Enter the year as 4 digits, like 1995." : "";
  const shown = ownError || error || "";

  return (
    <div>
      <div
        role="group"
        aria-label={label}
        className={`flex items-center gap-1 rounded-2xl border bg-black/30 px-4 py-3.5 transition focus-within:ring-2 ${
          shown ? "border-red-400/60 focus-within:border-red-400/70 focus-within:ring-red-400/20" : "border-white/10 focus-within:border-amber/50 focus-within:ring-amber/20"
        }`}
      >
        {icon && <CalendarDays aria-hidden className="mr-2 h-4 w-4 shrink-0 text-amber/80" strokeWidth={1.5} />}
        {ORDER.map((field, i) => (
          <span key={field} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden className="select-none px-0.5 text-muted/70">
                /
              </span>
            )}
            <input
              id={field === "d" ? id : undefined}
              ref={(el) => {
                refs.current[field] = el;
                if (field === "d" && inputRef) {
                  if (typeof inputRef === "function") inputRef(el);
                  else (inputRef as { current: HTMLInputElement | null }).current = el;
                }
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={MAX_LEN[field]}
              autoComplete={autofillBirthday ? BDAY[field] : "off"}
              enterKeyHint={field === "y" ? "go" : "next"}
              placeholder={PLACEHOLDER[field]}
              aria-label={FIELD_LABEL[field]}
              aria-invalid={!!shown}
              aria-describedby={shown ? errorId : undefined}
              value={parts[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              onKeyDown={(e) => handleKeyDown(field, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              onBlur={field === "y" ? () => setYearTouched(true) : undefined}
              className={`${INPUT} ${field === "y" ? "w-16" : "w-10"}`}
            />
          </span>
        ))}
      </div>
      {shown && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-300/90">
          {shown}
        </p>
      )}
    </div>
  );
}
