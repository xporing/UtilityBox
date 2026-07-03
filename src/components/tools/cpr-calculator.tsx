"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const currencies = ["USD", "IDR", "JPY", "EUR", "GBP"];
const symbols: Record<string, string> = { USD: "$", IDR: "Rp", JPY: "¥", EUR: "€", GBP: "£" };

export function CprCalculator() {
  const [spend, setSpend] = useState("100");
  const [results, setResults] = useState("10");
  const [target, setTarget] = useState("12");
  const [currency, setCurrency] = useState("USD");
  const [campaign, setCampaign] = useState("Campaign A");
  const [reverseMode, setReverseMode] = useState<"budget" | "results">("budget");
  const [expectedResults, setExpectedResults] = useState("50");
  const [budget, setBudget] = useState("500");

  const cpr = useMemo(() => Number(spend) / Number(results), [spend, results]);
  const targetValue = Number(target);
  const status = !Number.isFinite(cpr) || cpr <= 0 ? "Invalid" : cpr <= targetValue * 0.9 ? "Good" : cpr <= targetValue * 1.05 ? "Warning" : "Bad";
  const badgeVariant = status === "Good" ? "success" : status === "Warning" ? "warning" : status === "Bad" ? "danger" : "muted";
  const reverse = reverseMode === "budget" ? targetValue * Number(expectedResults) : Number(budget) / targetValue;
  const symbol = symbols[currency] ?? "";

  const resultText = `${campaign || "Campaign"}: CPR is ${symbol}${cpr.toFixed(2)} ${currency}. Status: ${status}. Target CPR: ${symbol}${targetValue.toFixed(2)}.`;

  async function copyResult() {
    await navigator.clipboard.writeText(resultText);
    toast.success("Result copied.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Campaign name" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input type="number" min="0" step="0.01" value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="Total ad spend" />
          <Input type="number" min="1" value={results} onChange={(e) => setResults(e.target.value)} placeholder="Results" />
          <Input type="number" min="0" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target CPR" />
        </div>
        <select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Cost Per Result</p><Badge variant={badgeVariant}>{status}</Badge></div>
          <div className="mt-3 text-4xl font-bold">{Number.isFinite(cpr) ? `${symbol}${cpr.toFixed(2)}` : "—"}</div>
          <p className="mt-3 text-sm text-muted-foreground">{status === "Good" && "Your CPR is comfortably below target."}{status === "Warning" && "Your CPR is close to target. Watch performance carefully."}{status === "Bad" && "Your CPR is above target. Consider adjusting creative, audience, or bid strategy."}{status === "Invalid" && "Enter spend and at least one result."}</p>
          <Button className="mt-5" onClick={copyResult}>Copy result</Button>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2"><Button type="button" variant={reverseMode === "budget" ? "default" : "outline"} onClick={() => setReverseMode("budget")}>Budget needed</Button><Button type="button" variant={reverseMode === "results" ? "default" : "outline"} onClick={() => setReverseMode("results")}>Expected results</Button></div>
          {reverseMode === "budget" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><Input type="number" value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="Target CPR" /><Input type="number" value={expectedResults} onChange={(e)=>setExpectedResults(e.target.value)} placeholder="Expected results" /></div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><Input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)} placeholder="Budget" /><Input type="number" value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="Target CPR" /></div>
          )}
          <p className="mt-4 text-lg font-semibold">{reverseMode === "budget" ? `Required budget: ${symbol}${Number.isFinite(reverse) ? reverse.toFixed(2) : "—"}` : `Expected results: ${Number.isFinite(reverse) ? Math.floor(reverse) : "—"}`}</p>
        </CardContent>
      </Card>
    </div>
  );
}
