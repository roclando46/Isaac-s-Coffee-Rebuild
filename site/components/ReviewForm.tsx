"use client";
import { useState } from "react";
import { useSubmit } from "./useSubmit";

export default function ReviewForm({ token }: { token: string }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const { submit, result, setResult, pending } = useSubmit("/api/reviews");
  if (result?.ok) return <p className="msg ok" role="status" style={{ marginTop: "1.5rem" }}>{result.message}</p>;
  return (
    <form className="stack" style={{ marginTop: "1.5rem", maxWidth: 520 }} noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!rating) return setResult({ ok: false, message: "Choose a star rating." });
      submit({ token, rating, name, body });
    }}>
      <fieldset><legend>Rating</legend>
        <div className="stars-input">{[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n} onClick={() => setRating(n)}>{n <= rating ? "★" : "☆"}</button>
        ))}</div>
      </fieldset>
      <div className="field"><label htmlFor="rName">Name shown with your review</label><input id="rName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></div>
      <div className="field"><label htmlFor="rBody">Your review</label><textarea id="rBody" rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
      <div><button className="btn" disabled={pending}>{pending ? "Sending…" : "Send review"}</button></div>
      {result && <p className={`msg ${result.ok ? "ok" : "err"}`} role="status">{result.message}</p>}
    </form>
  );
}
