// Exercises lib/field/recap.ts — the forwardable visit recap email.
//
//   npm run test:recap
//
// Imports the real .ts modules through node's type stripper so the figures
// under test are the ones the email actually sends, not a copy of the math.
import { recapHtml, recapSubject, recapDate } from "../lib/field/recap.ts";
import { visitTotals, annualCost } from "../lib/field/estimate.ts";
import { formatDollars, HAIRCUT } from "../lib/portal/value.ts";

let fails = 0;
const ok = (name, pass, detail = "") => {
  if (!pass) fails++;
  console.log(`${pass ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const TASKS = [
  { label: "Retyping vendor invoices by hand", who: "Sherri at the front desk", minutes_each: 4, times_per_week: 60, hourly_rate: 28 },
  { label: "Chasing certificates of insurance", who: null, minutes_each: 12, times_per_week: 9, hourly_rate: 34 },
];
const INPUT = {
  businessName: "Acceptance Insurance",
  contactName: "Dale Whitworth",
  visitedOn: "2026-08-14",
  tasks: TASKS,
};

const html = recapHtml(INPUT);
const totals = visitTotals(TASKS);

console.log("--- the figures are the app's figures ---");
ok("cost line matches visitTotals", html.includes(`${formatDollars(totals.cost)} a year`), formatDollars(totals.cost));
ok("fee line matches visitTotals", html.includes(`<strong>${formatDollars(totals.fee)}</strong>`), formatDollars(totals.fee));
for (const t of TASKS) {
  const c = formatDollars(annualCost(t.minutes_each, t.times_per_week, t.hourly_rate));
  ok(`task priced at ${c}`, html.includes(`${c}/yr`));
}

console.log("--- D21: only what the owner already saw on the phone ---");
ok("the recovered figure is NOT quoted", !html.includes(formatDollars(totals.recovered)), formatDollars(totals.recovered));
ok("the haircut is stated in words", html.includes(`${HAIRCUT * 100}%`));
ok('carries "rough estimate, not a quote"', /rough estimate, not a quote/i.test(html));
ok("says the fee is charged once", /charged once/.test(html));
ok("no /yr on the fee", !new RegExp(`${formatDollars(totals.fee).replace(/[$,]/g, "\\$&")}\\s*(</strong>)?\\s*/yr`).test(html));

console.log("--- forwardable: nothing internal leaks ---");
for (const word of ["prospect", "lead", "pipeline", "card drop", "status"]) {
  ok(`no internal word "${word}"`, !new RegExp(word, "i").test(html));
}

console.log("--- escaping and dates ---");
const nasty = recapHtml({ ...INPUT, businessName: 'Bob & "Sons" <script>', tasks: [{ ...TASKS[0], label: "<b>bold</b>" }] });
ok("business name is escaped", nasty.includes("Bob &amp; &quot;Sons&quot; &lt;script&gt;") && !nasty.includes("<script>"));
ok("task label is escaped", nasty.includes("&lt;b&gt;bold&lt;/b&gt;"));
ok("date does not slip a day", recapDate("2026-08-14").includes("14"), recapDate("2026-08-14"));
ok("subject names the business", recapSubject(INPUT) === "What we worked out at Acceptance Insurance");
ok("greets by first name only", html.includes("Hi Dale,"));
ok("greets safely with no contact", recapHtml({ ...INPUT, contactName: null }).includes("Hi,"));

console.log(fails ? `\n${fails} FAILURE(S)` : "\nall pass");
process.exit(fails ? 1 : 0);
