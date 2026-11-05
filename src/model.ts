import {
  str,
  num,
  clamp,
  App,
  type Settings,
  type Shape,
  type View,
} from "./lib.ts";

export class AppModel extends App {
  density = 18;
  phase = 0;
  paused = false;
  last = 0;
  pattern = 0;
  patterns = ["sine", "ripple", "steps"];
  constructor(s: Settings, saved: Settings, now: number) {
    super(s, saved, now);
    this.density = num(s, "density", 18);
    this.pattern = Math.max(0, this.patterns.indexOf(str(s, "pattern")));
    this.last = now;
  }
  key(key: string, delta: number, _now: number): boolean {
    if (key === "wheel") this.density = clamp(this.density + delta, 6, 24);
    if (key === "ok") this.paused = !this.paused;
    return false;
  }
  tick(now: number): void {
    if (!this.paused)
      this.phase =
        (this.phase +
          (Math.max(0, Math.min(1000, now - this.last)) *
            num(this.settings, "speed", 2)) /
            1000) %
        1000;
    this.last = now;
  }
  view(_now: number): View {
    const shapes: Shape[] = [];
    const width = 72 / this.density;
    for (let i = 0; i < this.density; i++) {
      const p = i * 0.45 + this.phase;
      const wave =
        this.pattern === 1
          ? Math.sin(Math.abs(i - this.density / 2) * 0.8 - this.phase)
          : this.pattern === 2
            ? Math.round(Math.sin(p))
            : Math.sin(p);
      const y = clamp(Math.round(7 + wave * 6), 0, 15);
      shapes.push({
        x: Math.floor(i * width),
        y,
        width: Math.max(1, Math.floor(width) - 1),
        height: 1,
        color: str(this.settings, "color"),
      });
    }
    return {
      title: "Generative Waves",
      value: this.patterns[this.pattern].toUpperCase(),
      shapes,
      rows: ["Density " + this.density, this.paused ? "PAUSED" : "FLOWING"],
      hint: "Wheel density / OK pause",
    };
  }
}
