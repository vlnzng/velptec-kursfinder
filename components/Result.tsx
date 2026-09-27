"use client";

import { useEffect, useState } from "react";
import { FORMAT, FUNDING_NO, FUNDING_YES } from "@/lib/courses";
import { explain, match, type Match } from "@/lib/match";
import {
  EXPERIENCE_LABELS,
  INTEREST_LABELS,
  SITUATION_LABELS,
  START_LABELS,
  type Profile,
  type Sources,
} from "@/lib/profile";
import { SalesView } from "./SalesView";

/** Was nur der Chat liefert. */
export type ChatExtras = { ownWords: string[]; openQuestions: string[]; handover: string[] };

export type Request = { pref: string; name: string; contact: string; consent: boolean; sent: boolean };

export function Result({
  profile,
  sources,
  chat,
  onEdit,
  jumpToRequest,
}: {
  profile: Profile;
  sources: Sources;
  chat?: ChatExtras;
  onEdit: () => void;
  jumpToRequest?: boolean;
}) {
  const [thinking, setThinking] = useState(true);
  const [sales, setSales] = useState(false);
  const { courses, notes } = match(profile);
  const [open, setOpen] = useState<string[]>([courses[0].course.id]);
  const [req, setReq] = useState<Request>({ pref: "", name: "", contact: "", consent: false, sent: false });

  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!thinking && jumpToRequest) document.getElementById("beratung")?.scrollIntoView();
  }, [thinking, jumpToRequest]);

  if (thinking) {
    return (
      <div role="status" className="mx-auto max-w-xl px-5 py-16 text-center text-slate">
        Ich schaue, was zu dir passt …
      </div>
    );
  }

  const chips = [
    INTEREST_LABELS[profile.interest],
    ...profile.experience.map((e) => EXPERIENCE_LABELS[e]),
    profile.situation !== "unklar" && SITUATION_LABELS[profile.situation],
    profile.startWish !== "unklar" && START_LABELS[profile.startWish],
  ].filter(Boolean) as string[];

  const consult = (id: string) => {
    setReq((r) => ({ ...r, pref: id, sent: false }));
    document.getElementById("beratung")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="px-5 pt-4">
        <div role="tablist" className="grid grid-cols-2 rounded-xl bg-mist p-1">
          {[
            [false, "Ergebnis"],
            [true, "Das bekommt Sales"],
          ].map(([value, label]) => (
            <button
              key={label as string}
              role="tab"
              aria-selected={sales === value}
              onClick={() => setSales(value as boolean)}
              className={`min-h-11 rounded-lg px-3 text-sm font-bold ${sales === value ? "bg-white" : "text-slate"}`}
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>

      {sales ? (
        <SalesView profile={profile} sources={sources} courses={courses} chat={chat} req={req} />
      ) : (
        <>
          <section className="flex flex-col gap-4 px-5 pt-7 pb-2">
            <h1 className="text-2xl font-bold text-pretty">Diese {courses.length} Weiterbildungen passen zu dir</h1>
            <p className="text-slate">
              Tippe auf einen Kurs, um mehr zu sehen. Offene Fragen klären wir gern mit dir im Gespräch.
            </p>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="rounded-full bg-mist px-3 py-1.5 text-sm leading-5">
                  {c}
                </span>
              ))}
            </div>
            <button onClick={onEdit} className="min-h-11 self-start font-bold underline">
              Antworten ändern
            </button>
            {notes.map((n) => (
              <p key={n} className="rounded-xl bg-amber-tint p-4 text-pretty">
                {n}
              </p>
            ))}
          </section>

          <section className="flex flex-col gap-3 px-5 pt-2 pb-8">
            {courses.map((m) => (
              <CourseCard
                key={m.course.id}
                m={m}
                profile={profile}
                open={open.includes(m.course.id)}
                onToggle={() =>
                  setOpen((o) => (o.includes(m.course.id) ? o.filter((x) => x !== m.course.id) : [...o, m.course.id]))
                }
                onConsult={() => consult(m.course.id)}
              />
            ))}
          </section>

          <RequestForm courses={courses} req={req} setReq={setReq} />

          <p className="bg-mist px-5 py-5 text-sm text-slate">
            Die Empfehlungen erstellt eine KI aus deinen Antworten und unserem Kurskatalog. In diesem Prototyp sind
            die KI-Antworten simuliert.
          </p>
        </>
      )}
    </div>
  );
}

function CourseCard({
  m,
  profile,
  open,
  onToggle,
  onConsult,
}: {
  m: Match;
  profile: Profile;
  open: boolean;
  onToggle: () => void;
  onConsult: () => void;
}) {
  const c = m.course;
  const dot = c.azav ? "bg-petrol" : "bg-slate";
  return (
    <article className="overflow-hidden rounded-xl border border-line">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full flex-col gap-1.5 px-5 py-4.5 text-left">
        <span className="flex w-full items-start justify-between gap-3">
          <span className="text-lg font-bold text-pretty">{c.title}</span>
          <span
            aria-hidden
            className="flex size-8 flex-none items-center justify-center rounded-full border-[1.5px] border-line text-lg leading-none"
          >
            {open ? "−" : "+"}
          </span>
        </span>
        <span className="text-sm text-slate">{c.weeks} Wochen · Vollzeit online</span>
        <span>{c.short}</span>
        <span className="mt-1 flex items-start gap-2.5">
          <span className={`mt-1.5 size-2.5 flex-none rounded-full ${dot}`} />
          <span className="text-sm">{c.azav ? "Grundsätzlich über den Bildungsgutschein förderbar." : FUNDING_NO}</span>
        </span>
        {m.missing && (
          <span className="flex items-start gap-2.5">
            <span className="mt-1.5 size-2.5 flex-none rounded-full bg-amber" />
            <span className="text-sm font-bold text-amber">Eine Voraussetzung fehlt dir noch</span>
          </span>
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="flex flex-col gap-1 border-t border-line pt-4">
            <span className="font-bold">Warum das passt</span>
            <span className="text-pretty">{explain(profile, c)}</span>
          </div>
          <Field label="Zeitaufwand">{FORMAT}</Field>
          <Field label="Voraussetzungen">{c.prereq}</Field>
          {m.missing ? (
            <div className="flex flex-col gap-1 rounded-xl bg-amber-tint px-4 py-3.5">
              <span className="font-bold text-amber">Das fehlt dir noch: {m.missing}</span>
              <span className="text-pretty">
                Ohne das wird der Kurs schwer. In der Beratung schauen wir, wie du es vor dem Start lernen kannst oder
                ob ein anderer Kurs besser passt.
              </span>
            </div>
          ) : (
            c.requires && <span className="font-bold text-petrol">✓ Das bringst du laut deinen Angaben mit.</span>
          )}
          <Field label="Förderung">
            <span className="flex items-start gap-2.5">
              <span className={`mt-2 size-2.5 flex-none rounded-full ${dot}`} />
              <span>{c.azav ? FUNDING_YES : FUNDING_NO}</span>
            </span>
          </Field>
          <button onClick={onConsult} className="h-13 rounded-xl border-[1.5px] border-navy font-bold">
            Beratung zu diesem Kurs
          </button>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-slate">{label}</span>
      <span className="text-pretty">{children}</span>
    </div>
  );
}

function RequestForm({
  courses,
  req,
  setReq,
}: {
  courses: Match[];
  req: Request;
  setReq: React.Dispatch<React.SetStateAction<Request>>;
}) {
  const [missing, setMissing] = useState(false);
  const set = (p: Partial<Request>) => setReq((r) => ({ ...r, ...p }));
  const input = "h-13 rounded-lg border border-slate px-4";

  if (req.sent) {
    return (
      <section id="beratung" className="flex scroll-mt-16 flex-col gap-3 border-t border-line px-5 pt-8 pb-9">
        <div className="flex flex-col gap-2 rounded-xl bg-petrol-tint p-5">
          <span className="text-lg font-bold text-petrol">Danke, deine Anfrage ist da.</span>
          <span className="text-pretty">
            Im Prototyp wird nichts gesendet. Deine Angaben bleiben in diesem Browserfenster. Unter „Das bekommt
            Sales&ldquo; siehst du, was die Beratung bekommen würde.
          </span>
        </div>
        <button onClick={() => set({ sent: false })} className="min-h-12 font-bold underline">
          Anfrage ändern
        </button>
      </section>
    );
  }

  return (
    <section id="beratung" className="flex scroll-mt-16 flex-col gap-5 border-t border-line px-5 pt-8 pb-9">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-pretty">Möchtest du mit jemandem darüber sprechen?</h2>
        <p className="text-slate">
          Kostenlos und unverbindlich. Wir klären mit dir, welcher Kurs passt, wie er in deinen Alltag passt und wie
          die Förderung funktioniert.
        </p>
      </div>
      <div role="radiogroup" aria-label="Wunschkurs" className="flex flex-col gap-2">
        <span className="font-bold">Welcher Kurs interessiert dich am meisten?</span>
        {[...courses.map((m) => [m.course.id, m.course.title]), ["offen", "Weiß ich noch nicht"]].map(([id, title]) => (
          <button
            key={id}
            role="radio"
            aria-checked={req.pref === id}
            onClick={() => set({ pref: id })}
            className={`flex min-h-13 items-center gap-3 rounded-xl border px-3.5 py-3 text-left font-bold ${
              req.pref === id ? "border-navy bg-mist shadow-[inset_0_0_0_1px_var(--color-navy)]" : "border-line"
            }`}
          >
            <span
              aria-hidden
              className={`size-5.5 flex-none rounded-full bg-white ${
                req.pref === id ? "border-[7px] border-navy" : "border-[1.5px] border-slate"
              }`}
            />
            {title}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-2">
        <span className="font-bold">Dein Vorname</span>
        <input value={req.name} onChange={(e) => set({ name: e.target.value })} className={input} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-bold">Telefon oder E-Mail</span>
        <input value={req.contact} onChange={(e) => set({ contact: e.target.value })} className={input} />
      </label>
      <label className="flex min-h-12 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={req.consent}
          onChange={(e) => set({ consent: e.target.checked })}
          className="mt-0.5 size-6 flex-none accent-navy"
        />
        <span>
          Die Beratung darf meine Antworten aus dem Kursfinder sehen. Dann muss ich nichts doppelt erzählen.
          <span className="block text-sm text-slate">Platzhalter, im Prototyp gibt es keinen echten Einwilligungstext.</span>
        </span>
      </label>
      {missing && <p className="text-amber">Bitte gib deinen Vornamen und eine Telefonnummer oder E-Mail an.</p>}
      <button
        onClick={() => {
          const ok = req.name.trim() !== "" && req.contact.trim() !== "";
          setMissing(!ok);
          if (ok) set({ sent: true });
        }}
        className="h-14 rounded-xl bg-navy font-bold text-white"
      >
        Beratung anfragen
      </button>
    </section>
  );
}
