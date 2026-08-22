// Exercises .claude/hooks/block-main-push.sh against the push shapes that MUST
// be denied and the ones that MUST get through.
//
// Ported from RFQ Hunter's block-db-sql.test.mjs pattern (2026-08-22): a guard
// hook without a test is a guard nobody has proven fires. The fixtures live in a
// file rather than on a Bash command line so the harness never trips the guards
// it is testing.
//
// NOTE ON THE CONTRACT: this hook always exits 0 and expresses a denial as JSON
// on stdout (`hookSpecificOutput.permissionDecision === "deny"`). Reading the
// exit code instead reports every case as allowed — which is exactly how a
// first pass at this test wrongly concluded the guard was dead.
//
//   node .claude/hooks/block-main-push.test.mjs
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOK = join(HERE, "block-main-push.sh");
const REPO = join(HERE, "..", "..");
const MAIN_CHECKOUT = "/Users/brianboyd/0/ridgeline/core"; // sits on master

const mustDeny = [
  ["explicit push to master", "git push origin master"],
  ["explicit push to main", "git push origin main"],
  ["HEAD refspec", "git push origin HEAD:master"],
  ["refspec delete", "git push origin :master"],
  ["cross-branch refspec", "git push origin feature/x:master"],
  ["-C into a checkout on master", `git -C ${MAIN_CHECKOUT} push`],
  ["cd into a checkout on master", `cd ${MAIN_CHECKOUT} && git push`],
  ["-C with explicit master", `git -C ${MAIN_CHECKOUT} push origin master`],
  ["force push to master", "git push --force origin master"],
];

const mustAllow = [
  ["feature branch, explicit", "git push -u origin feature/anything"],
  ["bare push from a feature branch", "git push"],
  ["the deliberate escape hatch", "ALLOW_MAIN_PUSH=1 git push origin master"],
  ["not a push at all", "gh pr create --fill"],
  ["fetch is not a push", "git fetch origin master"],
  ["a word containing push", "npm run push-notify"],
];

function run(command) {
  const r = spawnSync("bash", [HOOK], {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: "utf8",
    cwd: REPO,
  });
  try {
    return JSON.parse(r.stdout || "{}")?.hookSpecificOutput?.permissionDecision === "deny"
      ? "DENY"
      : "ALLOW";
  } catch {
    return "ALLOW"; // unparseable stdout is a fail-open, same as the hook itself
  }
}

let fails = 0;
console.log("--- must DENY ---");
for (const [name, cmd] of mustDeny) {
  const got = run(cmd);
  if (got !== "DENY") fails++;
  console.log(`${got === "DENY" ? "ok  " : "FAIL"} ${got.padEnd(5)} | ${name}`);
}
console.log("--- must ALLOW ---");
for (const [name, cmd] of mustAllow) {
  const got = run(cmd);
  if (got !== "ALLOW") fails++;
  console.log(`${got === "ALLOW" ? "ok  " : "FAIL"} ${got.padEnd(5)} | ${name}`);
}
console.log(fails ? `\n${fails} FAILURE(S)` : `\nall ${mustDeny.length + mustAllow.length} pass`);
process.exit(fails ? 1 : 0);
