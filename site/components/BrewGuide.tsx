"use client";
import { useState } from "react";
import type { BREW_GUIDE } from "@/content/products";

export default function BrewGuide({ guide }: { guide: typeof BREW_GUIDE }) {
  const [i, setI] = useState(0);
  const g = guide[i];
  return (
    <>
      <div className="brew-tabs" role="tablist">
        {guide.map((m, n) => <button key={m.method} type="button" role="tab" aria-selected={n === i} onClick={() => setI(n)}>{m.method}</button>)}
      </div>
      <div role="tabpanel">
        <div className="recipe">{g.recipe.map(([v, l]) => <div key={l}><b>{v}</b><small>{l}</small></div>)}</div>
        <p style={{ marginTop: ".75rem" }}>{g.tip}</p>
      </div>
    </>
  );
}
