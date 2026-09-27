import Link from "next/link";
import { Header } from "@/components/Header";

const VARIANTS = [
  {
    href: "/klick",
    title: "Klickfinder",
    text: "Vier Fragen zum Antippen. Testet, ob ein schneller, klarer Weg ohne Tippen reicht.",
  },
  {
    href: "/chat",
    title: "Vorab-Chat",
    text: "Ein kurzes Gespräch mit Antwortvorschlägen. Testet, ob Menschen im Chat mehr von sich erzählen.",
  },
];

export default function Start() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Kursfinder</h1>
          <p className="text-slate">
            Zwei Wege zur passenden Weiterbildung. Beide enden auf derselben Ergebnisseite, nur das Sammeln der
            Angaben ist verschieden.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {VARIANTS.map((v) => (
            <Link key={v.href} href={v.href} className="flex flex-col gap-1 rounded-xl border border-line p-5">
              <span className="text-lg font-bold">{v.title}</span>
              <span className="text-slate">{v.text}</span>
            </Link>
          ))}
        </div>
        <p className="rounded-xl bg-mist p-4">Die KI-Antworten sind in diesem Prototyp simuliert.</p>
      </main>
    </>
  );
}
