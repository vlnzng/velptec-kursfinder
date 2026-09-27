export type Interest = "daten" | "marketing" | "programmieren" | "ki" | "projekte" | "it-sicherheit";
export type Experience = "pc" | "excel" | "html" | "team" | "it";

export type Profile = {
  interest: Interest | "unklar";
  experience: Experience[];
  situation: "arbeitsuchend" | "beschaeftigt" | "anderes" | "unklar";
  agencyContact: "ja" | "nein" | "unklar";
  startWish: "sofort" | "in-1-bis-3-monaten" | "spaeter" | "unklar";
  fullTime: "ja" | "eher-nicht" | "unklar";
};

/** Woher eine Angabe stammt. Wird in der Sales-Ansicht gezeigt. */
export type Source = "angeklickt" | "vom Chat erkannt";
export type Sources = Partial<Record<keyof Profile, Source>>;

export const EMPTY_PROFILE: Profile = {
  interest: "unklar",
  experience: [],
  situation: "unklar",
  agencyContact: "unklar",
  startWish: "unklar",
  fullTime: "unklar",
};

// Beschriftungen, die Klickfinder, Ergebnis und Sales-Ansicht gemeinsam nutzen.
export const INTEREST_LABELS: Record<Profile["interest"], string> = {
  daten: "Daten und Zahlen",
  marketing: "Online-Marketing",
  programmieren: "Programmieren",
  ki: "KI im Arbeitsalltag",
  projekte: "Projekte organisieren",
  "it-sicherheit": "IT-Sicherheit",
  unklar: "Weiß ich noch nicht",
};

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  pc: "Sicher am PC",
  excel: "Excel-Grundlagen",
  html: "Erste HTML-Kenntnisse",
  team: "Erfahrung im Team",
  it: "IT-Grundkenntnisse",
};

export const SITUATION_LABELS: Record<Profile["situation"], string> = {
  arbeitsuchend: "Arbeitslos oder arbeitsuchend gemeldet",
  beschaeftigt: "Noch beschäftigt",
  anderes: "Etwas anderes",
  unklar: "Noch offen",
};

export const AGENCY_LABELS: Record<Profile["agencyContact"], string> = {
  ja: "Ja",
  nein: "Nein",
  unklar: "Weiß nicht",
};

export const START_LABELS: Record<Profile["startWish"], string> = {
  sofort: "So bald wie möglich",
  "in-1-bis-3-monaten": "In 1 bis 3 Monaten",
  spaeter: "Später oder weiß noch nicht",
  unklar: "Noch offen",
};

export const FULLTIME_LABELS: Record<Profile["fullTime"], string> = {
  ja: "Ja",
  "eher-nicht": "Eher nicht",
  unklar: "Weiß ich noch nicht",
};
