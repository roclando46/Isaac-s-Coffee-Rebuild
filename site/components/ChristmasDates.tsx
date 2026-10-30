import { CHRISTMAS_DATES } from "@/content/settings";

export default function ChristmasDates() {
  return (
    <div className="table-wrap"><table className="rates">
      <thead><tr><th>Christmas 2026</th><th>Order by</th></tr></thead>
      <tbody>{CHRISTMAS_DATES.map(([s, d]) => <tr key={s}><td>{s}</td><td>{d}</td></tr>)}</tbody>
    </table></div>
  );
}
