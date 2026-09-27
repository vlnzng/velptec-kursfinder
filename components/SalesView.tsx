import { explain, type Match } from "@/lib/match";
import {
  AGENCY_LABELS,
  EXPERIENCE_LABELS,
  FULLTIME_LABELS,
  INTEREST_LABELS,
  SITUATION_LABELS,
  START_LABELS,
  type Profile,
  type Source,
  type Sources,
} from "@/lib/profile";
import type { ChatExtras, Request } from "./Result";

/** Demo-Ansicht: Was die Beratung vor dem Erstgespräch bekommt. */
export function SalesView({
  profile,
  sources,
  courses,
  chat,
  req,
}: {
  profile: Profile;
  sources: Sources;
  courses: Match[];
  chat?: ChatExtras;
  req: Request;
}) {
  const pref = courses.find((m) => m.course.id === req.pref)?.course;

  return (
    <div className="flex flex-col gap-6 px-5 pt-5 pb-10">
      <p className="rounded-xl bg-amber-tint px-4 py-3 text-sm">
        <b className="text-amber">Demo-Ansicht.</b> So käme die Anfrage bei der Beratung an. Weg:{" "}
        {chat ? "Vorab-Chat" : "Klickfinder"}.
      </p>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">{req.sent ? req.name : "Noch keine Anfrage gesendet"}</h1>
        {req.sent && (
          <p className="text-sm text-slate">
            {req.contact} · Einwilligung {req.consent ? "erteilt" : "nicht erteilt"} · Wunschkurs{" "}
            {pref ? pref.title : "noch offen"}
          </p>
        )}
      </div>

      <div className="grid gap-3">
        <Fact label="Situation" value={SITUATION_LABELS[profile.situation]} source={sources.situation} big />
        <Fact label="Wunschstart" value={START_LABELS[profile.startWish]} source={sources.startWish} big />
        <Fact
          label="Kontakt zur Agentur"
          value={AGENCY_LABELS[profile.agencyContact]}
          source={sources.agencyContact}
          big
        />
      </div>

      <section className="flex flex-col gap-2.5">
        <h2 className="font-bold">Empfehlung</h2>
        <div className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {courses.map((m) => (
            <div key={m.course.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
              <span className="font-bold">
                {m.course.id} · {m.course.title}
                {m.course.id === req.pref && " · Wunschkurs"}
              </span>
              <span className="text-slate">
                {m.course.weeks} Wochen ·{" "}
                {m.missing ? (
                  <b className="text-amber">Voraussetzung fehlt: {m.missing}</b>
                ) : (
                  "Voraussetzung erfüllt"
                )}
                {!m.course.azav && " · nicht über Bildungsgutschein förderbar"}
              </span>
              <span>{explain(profile, m.course)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <Fact label="Interesse" value={INTEREST_LABELS[profile.interest]} source={sources.interest} />
        <Fact
          label="Vorerfahrung"
          value={profile.experience.map((e) => EXPERIENCE_LABELS[e]).join(", ") || "Nichts davon"}
          source={sources.experience}
        />
        <Fact label="Vollzeit passt" value={FULLTIME_LABELS[profile.fullTime]} source={sources.fullTime} />
      </section>

      {chat && (
        <>
          <List title="Offene Fragen" items={chat.openQuestions} empty="Keine" source="eigene Worte" quote />
          <List title="Grund der Übergabe" items={chat.handover} empty="Keine Übergabe im Chat" />
          <List title="Eigene Worte" items={chat.ownWords} empty="Nur angetippt, nichts selbst geschrieben" source="eigene Worte" quote />
        </>
      )}

      <p className="rounded-xl bg-mist px-4 py-3 text-sm">
        <b>Vom Kursfinder nicht bewertet:</b> ob ein Bildungsgutschein bewilligt wird. Das entscheidet die
        Arbeitsagentur oder das Jobcenter. Der Kursfinder hat nichts zugesagt.
      </p>
    </div>
  );
}

function Fact({ label, value, source, big }: { label: string; value: string; source?: Source; big?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${big ? "rounded-xl border border-line px-4 py-3.5" : ""}`}>
      <span className="text-sm text-slate">{label}</span>
      <span className={big ? "text-xl font-bold" : "font-bold"}>{value}</span>
      <SourceTag source={source ?? "nicht erfasst"} />
    </div>
  );
}

function List({
  title,
  items,
  empty,
  source,
  quote,
}: {
  title: string;
  items: string[];
  empty: string;
  source?: string;
  quote?: boolean;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {items.map((t, i) => (
            <li key={i} className="flex flex-col py-2.5 text-sm">
              <span>{quote ? `„${t}“` : t}</span>
              {source && <SourceTag source={source} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SourceTag({ source }: { source: string }) {
  return <span className="text-sm text-slate italic">{source}</span>;
}
