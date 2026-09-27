import { COURSES, type Course } from "./courses";
import type { Experience, Profile } from "./profile";

export type Match = {
  course: Course;
  /** Was vorher fehlt. Kurs wird trotzdem gezeigt. */
  missing?: string;
};

export type MatchResult = {
  courses: Match[];
  notes: string[];
};

/** Fehlende Voraussetzung, so formuliert, dass sie in einen Satz passt. */
export const NEEDS: Record<Experience, string> = {
  pc: "sicheren Umgang mit dem PC",
  excel: "Grundlagen in Excel",
  html: "erste HTML-Kenntnisse",
  team: "erste Berufserfahrung im Team",
  it: "IT-Grundkenntnisse",
};

const meets = (p: Profile, c: Course) => !c.requires || p.experience.includes(c.requires);

const toMatch = (p: Profile, c: Course): Match => ({
  course: c,
  missing: meets(p, c) ? undefined : NEEDS[c.requires!],
});

export function match(p: Profile): MatchResult {
  const notes: string[] = [];
  let picked: Course[];

  if (p.interest === "unklar") {
    picked = COURSES.filter((c) => c.id === "KI-01" || c.id === "OM-03");
    if (p.experience.includes("team")) picked.push(COURSES.find((c) => c.id === "PM-04")!);
    notes.push("Wenn du noch unsicher bist, finden wir es im Beratungsgespräch gemeinsam heraus.");
  } else {
    const main = COURSES.find((c) => c.interest === p.interest)!;
    // Alternativen: zuerst Kurse, deren Voraussetzung die Person ausdrücklich mitbringt.
    // Nur wenn es keine gibt, Kurse ohne feste Voraussetzung.
    const others = COURSES.filter((c) => c !== main);
    const builtOn = others.filter((c) => c.requires && p.experience.includes(c.requires));
    const open = others.filter((c) => !c.requires);
    picked = [main, ...(builtOn.length ? builtOn : open).slice(0, 2)];
  }

  if (p.fullTime === "eher-nicht") {
    notes.push(
      "Alle Kurse laufen in Vollzeit, montags bis freitags. In der Beratung klären wir, welche Wege es für dich gibt.",
    );
  }

  return { courses: picked.map((c) => toMatch(p, c)), notes };
}

const INTEREST_SENTENCE: Record<Course["interest"], string> = {
  daten: "Du interessierst dich für Daten und Zahlen.",
  marketing: "Du interessierst dich für Online-Marketing.",
  programmieren: "Du möchtest programmieren lernen.",
  ki: "Du möchtest KI im Arbeitsalltag einsetzen.",
  projekte: "Du möchtest Projekte organisieren.",
  "it-sicherheit": "Du interessierst dich für IT-Sicherheit.",
};

const HAS_SENTENCE: Record<string, string> = {
  pc: "Du bist sicher am PC, mehr brauchst du für den Einstieg nicht.",
  excel: "Du bringst Excel-Grundlagen mit. Genau darauf baut dieser Kurs auf.",
  team: "Du hast schon im Team gearbeitet. Genau darauf baut dieser Kurs auf.",
  it: "Du bringst IT-Grundkenntnisse mit. Genau darauf baut dieser Kurs auf.",
};

/** Simulierte KI-Begründung. Bezieht sich sichtbar auf die Angaben der Person. */
export function explain(p: Profile, c: Course): string {
  const first =
    p.interest === c.interest
      ? INTEREST_SENTENCE[c.interest]
      : p.interest === "unklar"
        ? "Du weißt noch nicht genau, wohin es gehen soll. Dieser Kurs ist ein guter Einstieg."
        : `Eine weitere Richtung: ${c.short}`;

  let second: string;
  if (c.requires && !p.experience.includes(c.requires)) {
    second = `Dafür brauchst du ${NEEDS[c.requires]}. Das hast du noch nicht angegeben.`;
  } else if (c.requires) {
    second = HAS_SENTENCE[c.requires];
  } else if (c.helps) {
    // WE-05: logisches Denken zählt, HTML hilft, ist aber kein Muss.
    second = p.experience.includes(c.helps)
      ? "Deine ersten HTML-Kenntnisse helfen dir beim Einstieg. Wichtig ist außerdem logisches Denken."
      : "Wichtig ist logisches Denken. Erste HTML-Kenntnisse helfen, sind aber kein Muss.";
  } else {
    second = "Vorkenntnisse brauchst du dafür keine.";
  }

  return `${first} ${second}`;
}
