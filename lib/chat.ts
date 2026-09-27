// Simulierte KI für den Vorab-Chat. Liefert dasselbe Format, das später ein echtes LLM
// über app/api/chat/route.ts liefern soll. Feste Pfade für angetippte Vorschläge,
// einfache Stichworterkennung für frei getippte Nachrichten.

import { COURSES } from "./courses";
import { NEEDS } from "./match";
import {
  AGENCY_LABELS,
  EXPERIENCE_LABELS,
  FULLTIME_LABELS,
  INTEREST_LABELS,
  SITUATION_LABELS,
  START_LABELS,
  type Experience,
  type Profile,
} from "./profile";

export type ChatMessage = { role: "assistant" | "user"; text: string };

export type ChatReply = {
  message: string;
  suggestions: string[];
  profile: Partial<Profile>;
  ready: boolean;
  handover?: { reason: string };
  openQuestions?: string[];
};

type Field = keyof Profile;
const ORDER: Field[] = ["interest", "experience", "situation", "agencyContact", "startWish", "fullTime"];

export const SHOW_RESULTS = "Zeig mir meine Ergebnisse";
const QUESTIONS = ["Wird das gefördert?", "Schaffe ich das?", "Wie sieht ein Kurstag aus?"];

const ASK: Record<Field, string> = {
  interest: "Was möchtest du beruflich als Nächstes machen?",
  experience: "Was bringst du schon mit? Tipp an, was passt.",
  situation: "Wie ist deine Situation gerade?",
  agencyContact: "Hast du schon Kontakt zur Arbeitsagentur oder zum Jobcenter?",
  startWish: "Wann möchtest du starten?",
  fullTime: "Alle Kurse laufen in Vollzeit online, montags bis freitags. Passt das für dich?",
};
const ASK_MORE = "Noch etwas davon?";
const NOTHING = "Nichts davon";
const THATS_ALL = "Das war's";

const ACKS = ["Danke.", "Alles klar.", "Gut."];
const DONT_KNOW = /weiß (ich )?(es )?(noch )?nicht|keine ahnung|unsicher/;

const pairs = <T extends string>(labels: Record<T, string>, skip?: T) =>
  (Object.entries(labels) as [T, string][]).filter(([v]) => v !== skip);

const OPTIONS: Record<Field, [string, string][]> = {
  interest: pairs(INTEREST_LABELS),
  experience: pairs(EXPERIENCE_LABELS),
  situation: pairs(SITUATION_LABELS, "unklar"),
  agencyContact: pairs(AGENCY_LABELS),
  startWish: pairs(START_LABELS, "unklar"),
  fullTime: pairs(FULLTIME_LABELS),
};

const KEYWORDS: Record<Field, [string, RegExp][]> = {
  interest: [
    ["daten", /zahl|daten|excel|analy|statist|auswert/],
    ["marketing", /marketing|werbung|social|instagram|kundschaft|verkauf/],
    ["programmieren", /programm|website|webseite|\bweb|code|coden|entwickl|\bapps?\b/],
    ["ki", /\bki\b|künstlich|chatgpt|prompt/],
    ["projekte", /projekt|organis|planen|scrum|team/],
    ["it-sicherheit", /sicherheit|security|hack|netzwerk/],
  ],
  experience: [
    ["pc", /\bpc\b|computer|rechner|office/],
    ["excel", /excel|tabelle/],
    ["html", /html|website|webseite/],
    ["team", /team|kolleg/],
    ["it", /\bit\b|netzwerk|server|admin/],
  ],
  situation: [
    ["arbeitsuchend", /arbeitslos|arbeitsuchend|arbeit ?suche|suche arbeit|ohne (job|arbeit)|gekündigt/],
    ["beschaeftigt", /beschäftigt|angestellt|arbeite|\bjob\b/],
    ["anderes", /elternzeit|studi|schule|rente|krank|ausbildung|selbstständig|selbständig/],
  ],
  agencyContact: [
    ["nein", /nein|nicht|kein/],
    ["ja", /\bja\b|termin|schon|kontakt/],
  ],
  startWish: [
    ["sofort", /sofort|bald|gleich|schnell|jetzt|möglichst/],
    ["in-1-bis-3-monaten", /monat|wochen/],
    ["spaeter", /später|nächstes jahr|irgendwann/],
  ],
  fullTime: [
    ["eher-nicht", /nein|nicht|schwierig|teilzeit|kinder/],
    ["ja", /\bja\b|passt|geht|klar|problem/],
  ],
};

// Sonderfälle. Stichworte für Förderung, Alltag, Zweifel und den Wunsch nach einem Menschen.
const HUMAN = /mensch|beratung|berater|anruf|rückruf|telefon|persönlich/;
const FUNDING = /förder|gutschein|bezahl|kostet|kosten|geld/;
const AGENCY = /jobcenter|arbeitsagentur|agentur/;
const TIME = /kinder|\bkind\b|kurstag|alltag|\bzeit\b|teilzeit/;
const DOUBT = /schaff|schwer|zu alt|angst/;

const FUNDING_ANSWER =
  "Ob ein Kurs grundsätzlich über den Bildungsgutschein förderbar ist, kann ich dir zeigen. Ob du ihn bekommst, entscheidet die Arbeitsagentur oder das Jobcenter. Das klärt am besten jemand aus unserer Beratung.";
const TIME_ANSWER =
  "Ehrlich gesagt: Alle Kurse laufen in Vollzeit online, montags bis freitags, mit täglichen Live-Sessions und Zeit zum Selbstlernen. Teilzeit gibt es nicht. Wie das zu deinem Alltag passt, klärst du am besten in der Beratung.";
const HUMAN_ANSWER =
  "Gern. Unter „Beratung anfragen“ meldet sich jemand aus unserer Beratung bei dir. Wenn du magst, mache ich vorher hier weiter.";

function doubtAnswer(p: Partial<Profile>) {
  const c = COURSES.find((c) => c.interest === p.interest);
  if (!c) {
    return "Das hängt vom Kurs ab. Für KI-Management und für Online Marketing brauchst du keine Fachkenntnisse. Alle Kurse laufen in Vollzeit und sind fordernd. Ob es für dich passt, klärst du am besten in der Beratung.";
  }
  const status =
    !c.requires || p.experience?.includes(c.requires)
      ? "Das bringst du laut deinen Angaben mit."
      : p.experience === undefined
        ? "Was du mitbringst, frage ich dich gleich noch."
        : `Laut deinen Angaben fehlt dir noch ${NEEDS[c.requires]}. Das solltest du in der Beratung ansprechen.`;
  return `Das hängt von den Voraussetzungen ab. Für ${c.title} gilt: ${c.prereq} ${status} Der Kurs läuft in Vollzeit und ist fordernd.`;
}

/** Welche Frage gerade offen ist. null heißt: Profil vollständig. */
function asking(p: Partial<Profile>, lastBot: string): Field | "more" | null {
  if (lastBot.endsWith(ASK_MORE)) return "more";
  return ORDER.find((f) => p[f] === undefined) ?? null;
}

function questionFor(p: Partial<Profile>, field: Field | "more" | null, askedTexts: string[]) {
  if (field === null) {
    return {
      message: "Das reicht mir. Ich habe passende Weiterbildungen für dich herausgesucht. Du kannst mir vorher noch Fragen stellen.",
      suggestions: [SHOW_RESULTS, ...QUESTIONS.filter((q) => !askedTexts.includes(q))],
    };
  }
  if (field === "more") {
    const rest = OPTIONS.experience.filter(([v]) => !p.experience?.includes(v as Experience)).map(([, l]) => l);
    return { message: ASK_MORE, suggestions: [THATS_ALL, ...rest] };
  }
  const suggestions = OPTIONS[field].map(([, l]) => l);
  return { message: ASK[field], suggestions: field === "experience" ? [...suggestions, NOTHING] : suggestions };
}

export function getChatReply(history: ChatMessage[], profile: Partial<Profile>): ChatReply {
  const users = history.filter((m) => m.role === "user").map((m) => m.text);
  const text = users.at(-1);
  const bots = history.filter((m) => m.role === "assistant");
  const lastBot = bots.at(-1)?.text ?? "";

  if (text === undefined) {
    const q = questionFor(profile, "interest", users);
    return {
      ...q,
      message: `Hallo! Ich bin eine KI und helfe dir, eine Weiterbildung zu finden, die zu dir passt. Du kannst die Vorschläge antippen oder selbst schreiben. ${q.message}`,
      profile: {},
      ready: false,
    };
  }

  const field = asking(profile, lastBot);
  const t = text.toLowerCase();

  // Antwort bauen: Profil ergänzen, dann nächste offene Frage stellen.
  const reply = (update: Partial<Profile>, prefix: string, extra: Partial<ChatReply> = {}, more = false): ChatReply => {
    const merged = { ...profile, ...update };
    const next = more ? "more" : asking(merged, "");
    const q = questionFor(merged, next, users);
    if (field === null) q.message = "Noch eine Frage, oder soll ich dir die Ergebnisse zeigen?";
    return { message: `${prefix} ${q.message}`, suggestions: q.suggestions, profile: update, ready: next === null, ...extra };
  };

  // 1. Angetippter Vorschlag: fester Pfad.
  if (field === "more") {
    if (text === THATS_ALL) return reply({}, "Gut.");
    const hit = OPTIONS.experience.find(([, l]) => l === text);
    if (hit) {
      const experience = [...(profile.experience ?? []), hit[0] as Experience];
      return reply({ experience }, "Notiert.", {}, experience.length < OPTIONS.experience.length);
    }
  } else if (field === "experience" && text === NOTHING) {
    return reply({ experience: [] }, "Kein Problem.");
  } else if (field) {
    const hit = OPTIONS[field].find(([, l]) => l === text);
    if (hit) {
      if (field === "experience") return reply({ experience: [hit[0] as Experience] }, "Notiert.", {}, true);
      return reply({ [field]: hit[0] } as Partial<Profile>, ACKS[users.length % ACKS.length]);
    }
  }

  // 2. Sonderfälle. Fragen landen in openQuestions.
  const asked = { openQuestions: [text] };
  if (HUMAN.test(t)) {
    return reply({}, HUMAN_ANSWER, { handover: { reason: "Möchte mit einem Menschen sprechen" } });
  }
  if (FUNDING.test(t) || (AGENCY.test(t) && field !== "agencyContact")) {
    return reply({}, FUNDING_ANSWER, { ...asked, handover: { reason: "Frage zur Förderung" } });
  }
  if (TIME.test(t)) {
    const update: Partial<Profile> = field === "fullTime" ? { fullTime: "eher-nicht" } : {};
    return reply(update, TIME_ANSWER, { ...asked, handover: { reason: "Frage zu Zeit und Alltag" } });
  }
  if (DOUBT.test(t)) return reply({}, doubtAnswer(profile), asked);

  // 3. Freie Antwort auf die offene Frage per Stichworten.
  const questionMark = text.includes("?") ? asked : {};
  if (field === null) {
    return reply({}, "Das kann ich dir nicht sicher beantworten. Das klärt am besten die Beratung.", questionMark);
  }
  const key: Field = field === "more" ? "experience" : field;
  const found = KEYWORDS[key].filter(([, re]) => re.test(t)).map(([v]) => v);
  const unclear = "Das habe ich nicht sicher erkannt. Ich notiere es als offen, das klären wir in der Beratung.";

  if (key === "experience") {
    if (!found.length && field === "more") return reply({}, "Gut.");
    if (!found.length && /nichts|kein/.test(t)) return reply({ experience: [] }, "Kein Problem.");
    const experience = [...new Set([...(profile.experience ?? []), ...(found as Experience[])])];
    const labels = (found as Experience[]).map((e) => EXPERIENCE_LABELS[e]).join(", ");
    return reply({ experience }, found.length ? `Verstanden: ${labels}.` : unclear, questionMark);
  }
  if (!found.length && DONT_KNOW.test(t)) {
    return reply({ [key]: "unklar" } as Partial<Profile>, "Kein Problem, das notiere ich als offen.", questionMark);
  }
  if (found.length) {
    const label = Object.fromEntries(OPTIONS[key])[found[0]];
    return reply({ [key]: found[0] } as Partial<Profile>, `Verstanden: ${label}.`, questionMark);
  }
  return reply({ [key]: "unklar" } as Partial<Profile>, unclear, questionMark);
}
