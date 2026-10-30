import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Café admin", robots: { index: false } };

export default function Login() {
  return (
    <div className="wrap page-head narrow">
      <p className="eyebrow">Café admin</p>
      <h1>Sign in</h1>
      <LoginForm />
    </div>
  );
}
