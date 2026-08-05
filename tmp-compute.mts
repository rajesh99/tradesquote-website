const line = (s: string) => console.log(s);

line("=== 220.87 SWEEP: peak demand x 1.25, plus a continuous new load ===");
const SERVICES = [100, 125, 150, 200];
line("peak | existing (x1.25) | + 32A EVSE (x1.25=40) | + 48A EVSE (x1.25=60) | fits 100A?");
for (const peak of [30, 35, 40, 44, 50, 55, 60, 70, 80]) {
  const existing = peak * 1.25;
  const with32 = existing + 40;
  const with48 = existing + 60;
  line(
    `${String(peak).padStart(4)} A | ${existing.toFixed(1).padStart(6)} A | ${with32.toFixed(1).padStart(6)} A ${with32 <= 100 ? "fits" : "OVER"} | ${with48.toFixed(1).padStart(6)} A ${with48 <= 100 ? "fits" : "OVER"} |`,
  );
}

line("\n=== THE ANCHOR CASE ===");
const peak = 44, existing = peak * 1.25;
line(`peak ${peak} A x 1.25 = ${existing} A established existing load`);
for (const [charger, label] of [[32, "32 A"], [40, "40 A"], [48, "48 A"], [16, "16 A"]] as const) {
  const added = charger * 1.25;
  const total = existing + added;
  line(`  + ${label} EVSE: ${charger} x 1.25 = ${added} A -> total ${total.toFixed(1)} A on 100 A -> ${total <= 100 ? `FITS, ${(100 - total).toFixed(1)} A spare` : `OVER by ${(total - 100).toFixed(1)} A`}`);
}

line("\n=== MAX ADDABLE CONTINUOUS LOAD BY SERVICE AND PEAK ===");
line("peak\\service  " + SERVICES.map((s) => String(s).padStart(8)).join(""));
for (const p of [30, 40, 44, 50, 60, 80, 100]) {
  const ex = p * 1.25;
  line(
    String(p).padStart(4) + " A       " +
      SERVICES.map((s) => {
        const room = s - ex;
        return (room > 0 ? `${(room / 1.25).toFixed(0)}A` : "none").padStart(8);
      }).join(""),
  );
}

line("\n=== 220.87 vs 220.82 ON THE SAME HOUSE ===");
line("220.82 optional method (verified anchor): 24,280 VA / 240 = 101.2 A -> 125 A service");
line(`220.87 with a 44 A measured peak:        ${existing} A -> fits a 100 A service`);
line(`  difference: ${(101.2 - existing).toFixed(1)} A — the measured method is ${((1 - existing / 101.2) * 100).toFixed(0)}% lower`);

line("\n=== CONDUIT BENDING: THE MULTIPLIER IS THE COSECANT ===");
const rad = (d: number) => (d * Math.PI) / 180;
const csc = (d: number) => 1 / Math.sin(rad(d));
const cot = (d: number) => 1 / Math.tan(rad(d));
const nearestFraction = (v: number) => {
  const sixteenths = Math.round(v * 16);
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(sixteenths, 16);
  return `${sixteenths / d}/${16 / d}`;
};

line("angle | csc (exact multiplier) | table value | shrink csc-cot (in/in) | table shrink");
const TABLE_MULT: Record<number, string> = { 10: "6", 22.5: "2.6", 30: "2", 45: "1.4", 60: "1.2" };
const TABLE_SHRINK: Record<number, string> = { 10: "1/16", 22.5: "3/16", 30: "1/4", 45: "3/8", 60: "1/2" };
for (const a of [10, 22.5, 30, 45, 60]) {
  const m = csc(a);
  const s = csc(a) - cot(a);
  line(`${String(a).padStart(5)} | ${m.toFixed(3).padStart(6)} | ${TABLE_MULT[a].padStart(4)} | ${s.toFixed(3)} (${nearestFraction(s)}) | ${TABLE_SHRINK[a]}`);
}

line("\n=== WORKED OFFSET: 6 in offset at each angle ===");
const H = 6;
for (const a of [10, 22.5, 30, 45, 60]) {
  const between = H * csc(a);
  const shrink = H * (csc(a) - cot(a));
  line(`${String(a).padStart(5)}°: marks ${between.toFixed(2)} in apart, shrink ${shrink.toFixed(2)} in`);
}

line("\n=== SADDLE (3-BEND, 45 CENTRE / 22.5 OUTER): 2 in obstruction ===");
const obstruction = 2;
line(`centre bend at the obstruction centre; outer marks ${(obstruction * 2.5).toFixed(1)} in each side (2.5 x height)`);
line(`shrink ${(obstruction * 3 / 16).toFixed(3)} in (3/16 per inch of obstruction)`);

line("\n=== 360 DEGREES BETWEEN PULL POINTS ===");
for (const [n, deg] of [[4, 90], [8, 45], [16, 22.5]] as const) {
  line(`${n} x ${deg}° = ${n * deg}° — ${n * deg <= 360 ? "at the limit or under" : "OVER the 360° limit"}`);
}
line("Two 90s + one offset pair at 30 deg = 180 + 60 = 240 deg — fine.");
line("Four 90s = 360 deg — at the limit, no offsets left.");
