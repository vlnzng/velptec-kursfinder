"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Result } from "@/components/Result";
import { getChatReply, SHOW_RESULTS, type ChatMessage } from "@/lib/chat";
import { EMPTY_PROFILE, type Profile, type Sources } from "@/lib/profile";

const first = getChatReply([], {});

export default function Chat() {
  const [msgs, setMsgs] = useState<ChatMessage[]>([{ role: "assistant", text: first.message }]);
  const [suggestions, setSuggestions] = useState(first.suggestions);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [sources, setSources] = useState<Sources>({});
  const [ownWords, setOwnWords] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [handover, setHandover] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"chat" | "result" | "request">("chat");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs, pending]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const restart = () => {
    clearTimeout(timer.current);
    setMsgs([{ role: "assistant", text: first.message }]);
    setSuggestions(first.suggestions);
    setProfile({});
    setSources({});
    setOwnWords([]);
    setOpenQuestions([]);
    setHandover([]);
    setPending(false);
    setDraft("");
    setView("chat");
  };

  const send = (text: string, typed: boolean) => {
    if (pending || !text.trim()) return;
    if (!typed && text === SHOW_RESULTS) return setView("result");

    const history: ChatMessage[] = [...msgs, { role: "user", text }];
    const reply = getChatReply(history, profile);
    setMsgs(history);
    setDraft("");
    if (typed) setOwnWords((w) => [...w, text]);

    // Die App merkt sich, woher jede Angabe stammt. Das Modell muss das nicht wissen.
    setProfile((p) => ({ ...p, ...reply.profile }));
    const source = typed ? "vom Chat erkannt" : "angeklickt";
    setSources((s) => ({ ...s, ...Object.fromEntries(Object.keys(reply.profile).map((k) => [k, source])) }));
    if (reply.openQuestions) setOpenQuestions((q) => [...q, ...reply.openQuestions!]);
    if (reply.handover) {
      const reason = reply.handover.reason;
      setHandover((h) => (h.includes(reason) ? h : [...h, reason]));
    }

    // Kurzer Moment, damit es sich wie eine echte Antwort anfühlt.
    setPending(true);
    timer.current = setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: reply.message }]);
      setSuggestions(reply.suggestions);
      setPending(false);
    }, 900);
  };

  if (view !== "chat") {
    return (
      <>
        <Header onRestart={restart} />
        <Result
          profile={{ ...EMPTY_PROFILE, ...profile }}
          sources={sources}
          chat={{ ownWords, openQuestions, handover }}
          onEdit={() => setView("chat")}
          jumpToRequest={view === "request"}
        />
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <Header onRestart={restart} />
      <div className="mx-auto flex w-full max-w-xl min-h-0 flex-1 flex-col">
        <div className="flex flex-none items-center gap-3 border-b border-line px-5 py-3">
          <div className="flex size-10 flex-none items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
            KI
          </div>
          <div>
            <div className="font-bold leading-[22px]">Kursfinder</div>
            <div className="text-sm leading-5 text-slate">KI-Assistent · im Prototyp simuliert</div>
          </div>
        </div>

        <div ref={scroller} aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pt-4 pb-2">
          {msgs.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex flex-col items-start gap-1.5">
                {msgs[i - 1]?.role !== "assistant" && <span className="mt-1 text-sm text-slate">Kursfinder (KI)</span>}
                <p className="max-w-[88%] rounded-[6px_20px_20px_20px] bg-mist px-4 py-3 text-pretty">{m.text}</p>
              </div>
            ) : (
              <p key={i} className="max-w-[80%] self-end rounded-[20px_6px_20px_20px] bg-navy px-4 py-3 text-white">
                {m.text}
              </p>
            ),
          )}
          {pending && (
            <p className="self-start rounded-[6px_20px_20px_20px] bg-mist px-4 py-3 text-slate">schreibt …</p>
          )}
        </div>

        {!pending && (
          <div className="flex flex-none flex-wrap justify-end gap-2 px-5 pt-3">
            {handover.length > 0 && (
              <button
                onClick={() => setView("request")}
                className="min-h-12 rounded-full border-[1.5px] border-petrol bg-petrol-tint px-4 py-2.5 text-left font-bold text-petrol"
              >
                Beratung anfragen
              </button>
            )}
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s, false)}
                className={`min-h-12 rounded-full border-[1.5px] border-navy px-4 py-2.5 text-left font-bold leading-[22px] ${
                  s === SHOW_RESULTS ? "bg-navy text-white" : "bg-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft, true);
          }}
          className="flex flex-none gap-2 px-5 pt-3 pb-7"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Oder schreib selbst …"
            aria-label="Nachricht"
            className="h-13 min-w-0 flex-1 rounded-xl border border-slate px-4"
          />
          <button disabled={pending} className="h-13 rounded-xl bg-navy px-4 font-bold text-white disabled:opacity-60">
            Senden
          </button>
        </form>
      </div>
    </div>
  );
}
