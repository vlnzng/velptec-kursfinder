import type { Experience, Interest } from "./profile";

export type Course = {
  id: string;
  title: string;
  weeks: number;
  azav: boolean;
  interest: Interest;
  /** Harte Voraussetzung. null heißt: keine Vorkenntnisse nötig. */
  requires: Experience | null;
  /** Hilft, ist aber kein Muss. */
  helps?: Experience;
  prereq: string;
  short: string;
};

export const COURSES: Course[] = [
  {
    id: "KI-01",
    title: "KI-Management und Prompt Engineering",
    weeks: 12,
    azav: true,
    interest: "ki",
    requires: "pc",
    prereq: "Keine Vorkenntnisse. Du solltest sicher mit dem PC umgehen können.",
    short: "KI-Werkzeuge wie Chatbots im Beruf gezielt einsetzen.",
  },
  {
    id: "DA-02",
    title: "Data Analytics mit Python",
    weeks: 16,
    azav: true,
    interest: "daten",
    requires: "excel",
    prereq: "Grundlagen in Excel und Interesse an Zahlen.",
    short: "Daten auswerten und Muster darin finden.",
  },
  {
    id: "OM-03",
    title: "Online Marketing Management",
    weeks: 12,
    azav: true,
    interest: "marketing",
    requires: null,
    prereq: "Keine Vorkenntnisse nötig.",
    short: "Online Kundschaft gewinnen, mit Anzeigen und Social Media.",
  },
  {
    id: "PM-04",
    title: "Agiles Projektmanagement mit Scrum",
    weeks: 8,
    azav: true,
    interest: "projekte",
    requires: "team",
    prereq: "Erste Berufserfahrung in einem Team.",
    short: "Projekte und Teams organisieren.",
  },
  {
    id: "WE-05",
    title: "Webentwicklung mit React",
    weeks: 20,
    azav: true,
    interest: "programmieren",
    requires: null,
    helps: "html",
    prereq: "Logisches Denken. Erste HTML-Kenntnisse helfen, sind aber kein Muss.",
    short: "Eigene Websites und Web-Apps bauen.",
  },
  {
    id: "IT-06",
    title: "IT-Security Grundlagen",
    weeks: 10,
    azav: false,
    interest: "it-sicherheit",
    requires: "it",
    prereq: "IT-Grundkenntnisse.",
    short: "Computer und Netzwerke vor Angriffen schützen.",
  },
];

export const courseById = (id: string) => COURSES.find((c) => c.id === id)!;

export const FORMAT =
  "Vollzeit online, montags bis freitags. Jeden Tag Live-Sessions mit der Gruppe, dazwischen lernst du selbst.";
export const FUNDING_YES =
  "Grundsätzlich über den Bildungsgutschein förderbar. Ob du ihn bekommst, entscheidet die Arbeitsagentur oder das Jobcenter.";
export const FUNDING_NO = "Nicht über den Bildungsgutschein förderbar.";
