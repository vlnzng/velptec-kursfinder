import Link from "next/link";

const LOGO =
  "https://cdn.prod.website-files.com/68975397b55e5d47f8c8fbd1/69026dfcd40e72ca7ddf68ec_velpTEC_logo_primaer_dunkel.svg";

export function Header({ onRestart }: { onRestart?: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5">
        <Link href="/" className="flex min-h-11 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="velpTEC, zur Startseite" className="h-[17px] w-auto" />
        </Link>
        {onRestart && (
          <button onClick={onRestart} className="h-12 px-1 font-bold">
            Neu starten
          </button>
        )}
      </div>
    </header>
  );
}
