"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const sets = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/"
};
const words = ["orbit","river","matrix","green","cyan","tool","bright","ember","vector","quiet","nova","field","cloud","pixel","secure"];

function randomInt(max: number) { const array = new Uint32Array(1); crypto.getRandomValues(array); return array[0] % max; }
function strength(password: string) { let score = Math.min(40, password.length * 2); if(/[A-Z]/.test(password)) score+=15; if(/[a-z]/.test(password)) score+=15; if(/\d/.test(password)) score+=15; if(/[^A-Za-z0-9]/.test(password)) score+=15; return Math.min(100, score); }

export function PasswordGenerator() {
  const [length, setLength] = useState(18);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [passphrase, setPassphrase] = useState(false);
  const [password, setPassword] = useState("");

  function generate() {
    if (passphrase) {
      const phrase = Array.from({ length: 5 }, () => words[randomInt(words.length)]).join("-") + `-${randomInt(99)}`;
      setPassword(phrase); return;
    }
    let alphabet = ""; if(upper) alphabet += sets.upper; if(lower) alphabet += sets.lower; if(numbers) alphabet += sets.numbers; if(symbols) alphabet += sets.symbols;
    if (!alphabet) return toast.error("Choose at least one character set.");
    setPassword(Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join(""));
  }
  async function copy() { await navigator.clipboard.writeText(password); toast.success("Password copied."); }
  const score = strength(password);

  return (
    <div className="space-y-5">
      <p className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">Privacy note: passwords are generated client-side with the Web Crypto API, never sent to the server, and never stored.</p>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Length<Input type="number" min="8" max="128" value={length} onChange={(e)=>setLength(Number(e.target.value))} /></label><label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={passphrase} onChange={(e)=>setPassphrase(e.target.checked)} /> Passphrase mode</label></div>
      <div className="grid gap-2 sm:grid-cols-2">{[["Uppercase",upper,setUpper],["Lowercase",lower,setLower],["Numbers",numbers,setNumbers],["Symbols",symbols,setSymbols]].map(([label,checked,setter]) => <label key={String(label)} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked as boolean} onChange={(e)=>(setter as any)(e.target.checked)} disabled={passphrase} /> {label}</label>)}</div>
      <Button onClick={generate}>Generate</Button>
      {password && <div className="rounded-xl border bg-muted/40 p-4"><div className="break-all font-mono text-lg">{password}</div><div className="mt-4"><Progress value={score} /></div><div className="mt-2 text-sm text-muted-foreground">Strength: {score < 50 ? "Weak" : score < 75 ? "Good" : "Strong"}</div><Button className="mt-4" variant="outline" onClick={copy}>Copy to clipboard</Button></div>}
    </div>
  );
}
