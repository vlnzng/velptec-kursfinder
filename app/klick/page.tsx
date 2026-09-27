"use client";

import { useState } from "react";
import { Choice } from "@/components/Choice";
import { Header } from "@/components/Header";
import { Result } from "@/components/Result";
import {
  AGENCY_LABELS,
  EMPTY_PROFILE,
  EXPERIENCE_LABELS,
  FULLTIME_LABELS,
  INTEREST_LABELS,
  type Experience,
  type Profile,
  type Sources,
} from "@/lib/profile";

type Draft = Partial<Profile> & { nothing?: boolean };

const INTEREST_HINTS: Record<Profile["interest"], string> = {
  daten: "Auswerten und Muster finden",
  marketing: "Werbung, Social Media, Newsletter",
  programmieren: "Websites und Web-Apps bauen",
  ki: "Chatbots und KI-Werkzeuge nutzen",
  projekte: "Teams und Abläufe planen",
  "it-sicherheit": "Computer und Netze schützen",
  unklar: "Wir zeigen dir Kurse ohne Vorkenntnisse",
};

const SITUATIONS: [Profile["situation"], string][] = [
  ["arbeitsuchend", "Arbeitslos oder arbeitsuchend gemeldet"],
  ["beschaeftigt", "Noch beschäftigt"],
  ["anderes", "Etwas anderes"],
];

const STARTS: [Profile["startWish"], string][] = [
  ["sofort", "So bald wie möglich"],
  ["in-1-bis-3-monaten", "In 1 bis 3 Monaten"],
  ["spaeter", "Später oder weiß noch nicht"],
];

// Der Klickfinder füllt jede Angabe per Klick.
const SOURCES: Sources = {
  interest: "angeklickt",
  experience: "angeklickt",
  situation: "angeklickt",
  agencyContact: "angeklickt",
  startWish: "angeklickt",
  fullTime: "angeklickt",
};

export default function Klickfinder() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>({});
  const [done, setDone] = useState(false);
  const set = (p: Draft) => setD((x) => ({ ...x, ...p }));

  const restart = () => {
    setStep(0);
    setD({});
    setDone(false);
  };

  if (done) {
    const profile: Profile = { ...EMPTY_PROFILE, ...d };
    return (
      <>
        <Header onRestart={restart} />
        <Result profile={profile} sources={SOURCES} onEdit={() => setDone(false)} />
      </>
    );
  }

  const exp = d.experience ?? [];
  const toggleExp = (e: Experience) =>
    set({ nothing: false, experience: exp.includes(e) ? exp.filter((x) => x !== e) : [...exp, e] });

  const canNext = [
    d.interest !== undefined,
    exp.length > 0 || d.nothing,
    d.situation !== undefined && d.agencyContact !== undefined,
    d.startWish !== undefined && d.fullTime !== undefined,
  ][step];

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onRestart={restart} />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="px-5 pt-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="-ml-3 h-12 px-3 font-bold disabled:opacity-40"
            >
              Zurück
            </button>
            <span className="text-sm text-slate">Frage {step + 1} von 4</span>
          </div>
          <div className="mt-0.5 flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-navy" : "bg-line"}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 px-5 py-6">
          {step === 0 && (
            <Question title="Was interessiert dich?" sub="Wähle, was am ehesten passt.">
              <div role="radiogroup" className="grid grid-cols-2 gap-3">
                {(Object.keys(INTEREST_LABELS) as Profile["interest"][]).map((id) => (
                  <Choice
                    key={id}
                    label={INTEREST_LABELS[id]}
                    hint={INTEREST_HINTS[id]}
                    selected={d.interest === id}
                    onClick={() => set({ interest: id })}
                    className={id === "unklar" ? "col-span-2" : ""}
                  />
                ))}
              </div>
            </Question>
          )}

          {step === 1 && (
            <Question title="Was bringst du mit?" sub="Du kannst mehrere wählen.">
              <div className="flex flex-col gap-3">
                {(Object.keys(EXPERIENCE_LABELS) as Experience[]).map((e) => (
                  <Choice
                    key={e}
                    multi
                    label={EXPERIENCE_LABELS[e]}
                    selected={exp.includes(e)}
                    onClick={() => toggleExp(e)}
                  />
                ))}
                <Choice
                  multi
                  label="Nichts davon"
                  selected={!!d.nothing}
                  onClick={() => set({ nothing: !d.nothing, experience: [] })}
                />
              </div>
            </Question>
          )}

          {step === 2 && (
            <>
              <Question title="Wie ist deine Situation?">
                <Options options={SITUATIONS} value={d.situation} onPick={(situation) => set({ situation })} />
              </Question>
              <Question
                title="Hast du schon Kontakt zur Arbeitsagentur oder zum Jobcenter?"
                sub="Das ist keine Voraussetzung. Es hilft uns bei der Frage nach Förderung."
                small
              >
                <Options
                  options={Object.entries(AGENCY_LABELS) as [Profile["agencyContact"], string][]}
                  value={d.agencyContact}
                  onPick={(agencyContact) => set({ agencyContact })}
                />
              </Question>
            </>
          )}

          {step === 3 && (
            <>
              <Question title="Wann möchtest du starten?">
                <Options options={STARTS} value={d.startWish} onPick={(startWish) => set({ startWish })} />
              </Question>
              <Question
                title="Passt Vollzeit von Montag bis Freitag?"
                sub="Alle Kurse laufen online mit täglichen Live-Sessions."
                small
              >
                <Options
                  options={Object.entries(FULLTIME_LABELS) as [Profile["fullTime"], string][]}
                  value={d.fullTime}
                  onPick={(fullTime) => set({ fullTime })}
                />
              </Question>
            </>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-line bg-white px-5 pt-3 pb-7">
          <button
            disabled={!canNext}
            onClick={() => (step < 3 ? setStep(step + 1) : setDone(true))}
            className="h-14 w-full rounded-xl bg-navy font-bold text-white disabled:bg-line disabled:text-slate"
          >
            {step < 3 ? "Weiter" : "Ergebnisse zeigen"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Question({
  title,
  sub,
  small,
  children,
}: {
  title: string;
  sub?: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={small ? "mt-8" : ""}>
      {small ? (
        <h2 className="text-lg font-bold text-pretty">{title}</h2>
      ) : (
        <h1 className="text-xl font-bold text-pretty">{title}</h1>
      )}
      {sub && <p className="mt-2 text-slate">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Options<T extends string>({
  options,
  value,
  onPick,
}: {
  options: [T, string][];
  value?: T;
  onPick: (v: T) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-3">
      {options.map(([id, label]) => (
        <Choice key={id} label={label} selected={value === id} onClick={() => onPick(id)} />
      ))}
    </div>
  );
}
