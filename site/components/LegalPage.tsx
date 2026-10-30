export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Policy</p><h1>{title}</h1><p className="muted">Last updated {updated}</p></div>
      <section className="block wrap"><div className="prose">{children}</div></section>
    </>
  );
}
