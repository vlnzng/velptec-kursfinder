# Kursfinder-Prototypen (velpTEC Case)

## Worum es geht

Fiktiver Case im Bewerbungsverfahren. Zwei Varianten eines KI-Kursfinders für die Website eines Weiterbildungsinstituts. Ziel ist eine Entscheidung, in welcher Form es weitergeht, kein fertiges Produkt. Entscheiden werden Sales, Marketing und Geschäftsleitung.

Zeitrahmen rund eine Stunde. Lauffähig und deployt schlägt vollständig. Nur bauen, was für die Entscheidung gebraucht wird.

Die KI ist in beiden Varianten simuliert, wie im Brief ausdrücklich erlaubt. Keine API, kein Key. Die Simulation liegt hinter derselben Schnittstelle, die später ein echtes LLM bedient, damit der Austausch ein kleiner Schritt bleibt.

## Die zwei Varianten

- `/klick` Klickfinder: vier Fragen mit Kacheln, danach eine simulierte KI-Begründung pro Kurs.
- `/chat` Vorab-Chat: kurzes Gespräch mit Antwortvorschlägen, simulierte Antworten über feste Pfade, freie Eingaben per Stichworterkennung.
- `/` Startseite: Links zu beiden, je ein Satz, was sie testet, und der Hinweis „Die KI-Antworten sind in diesem Prototyp simuliert."

Beide Varianten füllen dasselbe Profil. Matching, Ergebnis und Sales-Ansicht sind identisch und liegen im gemeinsamen Code. Der Test vergleicht nur, wie die Informationen gesammelt werden.

## Stack

- Next.js mit App Router, React, TypeScript, Tailwind. Sonst Abhängigkeiten minimal halten, keine UI-Bibliothek.
- Seiten: `app/page.tsx` (Start), `app/klick/page.tsx`, `app/chat/page.tsx`. Interaktive Teile als Client-Komponenten.
- Keine Server-Logik, keine Umgebungsvariablen. Alles läuft im Browser.
- Deploy auf Vercel über GitHub, jeder Push auf `main` geht live.

## Design

Vorlage aus Claude Design liegt unter `/design`, maßgeblich ist `Kursfinder Case v2.dc.html`. Daran halten. Wo sie fehlt oder unklar ist: schlicht und ruhig, nichts erfinden.

Entschieden: Optik, Bausteine und Texte kommen aus dem Design. Wo die Abläufe abweichen (Fragen im Klickfinder, Gesprächsablauf im Chat), gilt diese Datei. Kein Mensch im Chat: Übergabe heißt Hinweis plus Weg zu „Beratung anfragen". Die Sales-Ansicht nutzt die Optik des Designs, zeigt aber nur echte Angaben aus dem Profil, keine erfundenen Namen oder Termine.

- Mobil zuerst (390 px), Touch-Ziele mindestens 44 px, gut lesbare Schriftgröße, sichtbarer Fokus.
- Beide Varianten haben jederzeit sichtbar „Neu starten", das alles zurücksetzt.
- Texte auf Deutsch, du-Form, einfache Sprache, keine Werbesprache, keine Gedankenstriche.

## Kurskatalog (`lib/courses.ts`)

Nur diese sechs Kurse. Keine Kurse, Starttermine, Preise oder Quoten erfinden.

| ID | Weiterbildung | Dauer | Voraussetzungen | AZAV | Interesse | Voraussetzungs-Schlüssel |
|---|---|---|---|---|---|---|
| KI-01 | KI-Management und Prompt Engineering | 12 Wochen | keine Vorkenntnisse, sicherer Umgang mit PC | ja | ki | pc |
| DA-02 | Data Analytics mit Python | 16 Wochen | Grundlagen Excel, Interesse an Zahlen | ja | daten | excel |
| OM-03 | Online Marketing Management | 12 Wochen | keine Vorkenntnisse | ja | marketing | keine |
| PM-04 | Agiles Projektmanagement mit Scrum | 8 Wochen | erste Berufserfahrung im Team | ja | projekte | team |
| WE-05 | Webentwicklung mit React | 20 Wochen | logisches Denken, erste HTML-Kenntnisse hilfreich | ja | programmieren | html (hilfreich, kein Muss) |
| IT-06 | IT-Security Grundlagen | 10 Wochen | IT-Grundkenntnisse | nein | it-sicherheit | it |

Alle Kurse: Vollzeit online, Montag bis Freitag, tägliche Live-Sessions plus Selbstlernphasen.

## Gemeinsamer Kern (`lib/`)

Profil, das beide Varianten füllen:

```ts
type Profile = {
  interest: "daten" | "marketing" | "programmieren" | "ki" | "projekte" | "it-sicherheit" | "unklar";
  experience: ("pc" | "excel" | "html" | "team" | "it")[];
  situation: "arbeitsuchend" | "beschaeftigt" | "anderes" | "unklar";
  agencyContact: "ja" | "nein" | "unklar";
  startWish: "sofort" | "in-1-bis-3-monaten" | "spaeter" | "unklar";
  fullTime: "ja" | "eher-nicht" | "unklar";
};
```

Matching `match(profile)`, deterministisch:
1. Hauptempfehlung ist der Kurs zum gewählten Interesse.
2. Interesse „unklar": die Kurse ohne Vorkenntnisse (KI-01, OM-03), PM-04 zusätzlich bei Teamerfahrung, dazu der Hinweis „Wenn du noch unsicher bist, finden wir es im Beratungsgespräch gemeinsam heraus." Keine weitere Logik erfinden.
3. Dazu bis zu zwei Alternativen, deren Voraussetzungen erfüllt sind. Höchstens drei Kurse.
4. Voraussetzung nicht erfüllt: Kurs trotzdem zeigen, mit ehrlichem Hinweis, was vorher fehlt. Nicht ausblenden.
5. IT-06 immer mit Hinweis „Nicht über den Bildungsgutschein förderbar".
6. Vollzeit „eher nicht": Hinweis, dass alle Kurse in Vollzeit laufen, und Beratung anbieten.

Simulierte KI-Begründung `explain(profile, course)`: ein bis zwei Sätze, die sich sichtbar auf die Angaben beziehen, zum Beispiel „Du bringst Excel-Grundlagen mit und interessierst dich für Zahlen. Genau darauf baut dieser Kurs auf." Vor der Anzeige ein kurzer Moment von etwa einer Sekunde mit „Ich schaue, was zu dir passt", damit sich der Ablauf wie mit echter KI anfühlt.

## Variante 1: Klickfinder

Vier Screens, je eine Frage, große Kacheln, Fortschritt „Frage X von 4", Zurück möglich. Kein Freitext. Füllt das Profil direkt.

1. Was interessiert dich? Daten, Marketing, Programmieren, KI, Projekte, IT-Sicherheit, Weiß ich noch nicht
2. Was bringst du mit? (Mehrfachauswahl) Sicher am PC, Excel-Grundlagen, Erste HTML-Kenntnisse, Erfahrung im Team, IT-Grundkenntnisse, Nichts davon
3. Wie ist deine Situation? Arbeitslos oder arbeitsuchend gemeldet, Noch beschäftigt, Etwas anderes. Dazu: Hast du schon Kontakt zur Arbeitsagentur oder zum Jobcenter? Ja, Nein, Weiß nicht
4. Wann möchtest du starten? So bald wie möglich, In 1 bis 3 Monaten, Später oder weiß noch nicht. Dazu: Passt Vollzeit von Montag bis Freitag? Ja, Eher nicht, Weiß ich noch nicht

## Variante 2: Vorab-Chat

Die Simulation läuft über eine Funktion `getChatReply(history, profile)`, die genau das Format zurückgibt, das später ein echtes LLM liefern soll:

```ts
type ChatReply = {
  message: string;
  suggestions: string[];
  profile: Partial<Profile>;
  ready: boolean;
  handover?: { reason: string };
  openQuestions?: string[];
};
```

Ablauf über feste Pfade:
1. Eröffnung: „Was möchtest du beruflich als Nächstes machen?" mit Vorschlägen zu den Interessen plus „Weiß ich noch nicht"
2. Nachfragen zu Vorerfahrung, Situation mit Agentur-Kontakt und Starttermin mit Vollzeit, jeweils mit Vorschlägen zum Antippen
3. Wenn das Profil vollständig ist: `ready: true`, die App zeigt das gemeinsame Ergebnis mit `match(profile)`

Freie Eingaben (Tippen ist möglich, aber nie nötig) per einfacher Stichworterkennung:
- Interessen und Vorerfahrung über naheliegende Wörter (zum Beispiel Zahlen, Excel, Programmieren, Website, Marketing, Projekt, Team, Sicherheit) ins Profil übernehmen. Nichts erkannt: Feld auf „unklar", kurz bestätigen und weiter.
- Förderung, Gutschein, Jobcenter, Arbeitsagentur, bezahlt, kostet: „Ob ein Kurs grundsätzlich über den Bildungsgutschein förderbar ist, kann ich dir zeigen. Ob du ihn bekommst, entscheidet die Arbeitsagentur oder das Jobcenter. Das klärt am besten jemand aus unserer Beratung." Dazu `handover` und „Beratung anfragen" anbieten. Nie eine Zusage.
- Kinder, Kurstag, Alltag, Zeit, Teilzeit: ehrlich antworten, dass alle Kurse Vollzeit von Montag bis Freitag mit täglichen Live-Sessions laufen, und Beratung anbieten.
- Schaffen, schwer, zu alt, Angst: ehrlich mit den Voraussetzungen des passenden Kurses antworten. Keine Beruhigung ohne Grundlage.
- Mensch, Beratung, anrufen: direkt `handover`.
- Gestellte Fragen landen in `openQuestions`.

Die eigenen Worte der Person sammelt die App selbst: alle frei getippten Nachrichten wörtlich, nicht die angetippten Vorschläge.

## Gemeinsames Ende

Ergebnis für Interessierte:
- Kurse mit Dauer und Begründung
- Hinweise: Voraussetzungen, Vollzeit Montag bis Freitag mit Live-Sessions
- Förderung: „Grundsätzlich über den Bildungsgutschein förderbar. Ob du ihn bekommst, entscheidet die Arbeitsagentur oder das Jobcenter." Bei IT-06: „Nicht über den Bildungsgutschein förderbar."
- Darunter optional „Beratung anfragen": Name, Telefon oder E-Mail, Einwilligungs-Checkbox als Platzhalter. Kein Versand, Daten bleiben im Browser-State.

Ansicht „Das bekommt Sales" (per Umschalter auf der Ergebnisseite, klar als Demo-Ansicht markiert):
- Oben nur die drei Fakten: Situation, Wunschstart, Kontakt zur Agentur
- Darunter: Empfehlung mit Begründung, dann Vorerfahrung, Vollzeit, offene Fragen
- Bei jeder Angabe sichtbar, woher sie stammt: „angeklickt", „vom Chat erkannt" oder „eigene Worte"
- Nur Variante 2: eigene Worte der Person und Grund der Übergabe
- In 30 Sekunden erfassbar

## Bewusst weggelassen

Echtes LLM, Login, Anbindung an Website oder CRM, Speichern oder Versenden von Daten, echte Einwilligungs- und Datenschutztexte, Analytics, Tests, Designsystem, Mehrsprachigkeit, Starttermine, Preise.

## Reihenfolge

1. Katalog, Profil, `match()` und `explain()`
2. Gemeinsames Ergebnis mit einfacher Sales-Ansicht
3. Klickfinder komplett, damit steht ein durchgehender Weg
4. Chat mit festen Pfaden über `getChatReply()`
5. Stichworterkennung und Sonderfälle im Chat
6. Sales-Ansicht verfeinern, Startseite

Nach jedem lauffähigen Schritt committen und pushen, Vercel deployt automatisch.

## Wenn die Zeit knapp wird

Zuerst streichen: Startseite (dann kommt der Simulationshinweis auf beide Varianten), Feinschliff der Sales-Ansicht, Stichworterkennung über die Sonderfälle hinaus.

Nicht streichen: zwei lauffähige Wege, Empfehlungen aus dem Katalog, gemeinsames Ergebnis mit Sales-Ansicht, der Umgang mit der Förderfrage im Chat, mobile Bedienung, Deploy.

## Später, jetzt nicht bauen: echtes LLM

Nur zur Dokumentation des nächsten Schritts. Ein Route Handler `app/api/chat/route.ts` ersetzt `getChatReply()` und liefert dasselbe `ChatReply`-Format. Modell `claude-haiku-4-5-20251001`, Key nur serverseitig als `ANTHROPIC_API_KEY`, gedeckelte Antwortlänge, begrenzte Nachrichtenzahl, simulierte Antwort als Rückfall. Der Systemprompt übernimmt die Regeln aus dem Abschnitt zum Chat: Profil füllen, keine Kurse auswählen, keine Förderzusage, Übergabe bei Förderentscheidung, persönlicher Lage oder Wunsch.

## Arbeitsweise

Bei Unklarheit fragen statt raten.

@AGENTS.md
