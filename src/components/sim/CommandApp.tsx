import { useEffect, useMemo } from "react";
import { Crosshair, Layers, Pause, Play, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG, UNIT_TYPES } from "@/lib/sim/catalog";
import { PROMPT_TEMPLATES, composeClause } from "@/lib/sim/parser";
import { useSim } from "@/lib/sim/store";
import type { Roe, UnitType } from "@/lib/sim/types";
import { unitIconSvg } from "./unit-icon";
import { MapView } from "./MapView";
import { cn } from "@/lib/utils";

function useSimLoop() {
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const step = 1 / 20;
    const loop = (now: number) => {
      const raw = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += raw;
      const tick = useSim.getState().tick;
      while (acc >= step) {
        tick(step);
        acc -= step;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

export function CommandApp() {
  useSimLoop();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) useSim.getState().redo();
        else useSim.getState().undo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        useSim.getState().deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-b border-border p-3 lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
          <PromptPanel />
          <ToolsPanel />
          <ForceList />
        </aside>
        <main className="relative min-h-72 min-w-0 flex-1">
          <MapView />
          <Legend />
          <Minimap />
        </main>
        <aside className="flex max-h-[38vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-border p-3 lg:max-h-none lg:w-72 lg:border-l lg:border-t-0">
          <Inspector />
          <LogPanel />
        </aside>
      </div>
      <PlanModal />
    </div>
  );
}

function TopBar() {
  const running = useSim((s) => s.running);
  const speed = useSim((s) => s.speed);
  const units = useSim((s) => s.units);
  const roe = useSim((s) => s.roe);
  const friendlyFire = useSim((s) => s.friendlyFire);
  const canUndo = useSim((s) => s.history.length > 0);
  const canRedo = useSim((s) => s.future.length > 0);
  const showDetection = useSim((s) => s.showDetection);
  const showRanges = useSim((s) => s.showRanges);
  const showRoutes = useSim((s) => s.showRoutes);
  const alive = units.filter((u) => u.health > 0).length;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-3 py-2">
      <div>
        <h1 className="text-sm font-semibold tracking-tight">Aegis Command</h1>
        <p className="text-micro uppercase tracking-wider text-muted-foreground">Parser-first deployment</p>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button size="icon" variant="outline" aria-label="Undo" disabled={!canUndo} onClick={() => useSim.getState().undo()}>
          <Undo2 />
        </Button>
        <Button size="icon" variant="outline" aria-label="Redo" disabled={!canRedo} onClick={() => useSim.getState().redo()}>
          <Redo2 />
        </Button>
        <Button size="icon" variant={running ? "secondary" : "default"} aria-label="Play" onClick={() => useSim.getState().play()} disabled={running}>
          <Play />
        </Button>
        <Button size="icon" variant="outline" aria-label="Pause" onClick={() => useSim.getState().pause()} disabled={!running}>
          <Pause />
        </Button>
        <Button size="sm" variant="outline" onClick={() => useSim.getState().toggleSpeed()}>
          {speed}×
        </Button>
        <ToggleChip on={showDetection} onClick={() => useSim.getState().toggleDetection()} label="Detect" />
        <ToggleChip on={showRanges} onClick={() => useSim.getState().toggleRanges()} label="Engage" />
        <ToggleChip on={showRoutes} onClick={() => useSim.getState().toggleRoutes()} label="Routes" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-micro text-muted-foreground">
          ROE
          <select
            className="h-10 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            value={roe}
            onChange={(e) => useSim.getState().setRoe(e.target.value as Roe)}
          >
            <option value="hold">Hold</option>
            <option value="tight">Tight</option>
            <option value="free">Free</option>
          </select>
        </label>
        <label className="flex h-10 items-center gap-2 rounded-md border border-border px-2 text-micro">
          <input
            type="checkbox"
            checked={friendlyFire}
            onChange={(e) => useSim.getState().setFriendlyFire(e.target.checked)}
          />
          Friendly fire
        </label>
        <span className="rounded-full border border-border px-2 py-1 font-mono text-2xs tabular-nums text-muted-foreground">
          {alive}/{units.length} UNITS
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-1 font-mono text-2xs",
            running ? "border-success/40 text-success" : "border-border text-muted-foreground",
          )}
        >
          {running ? "PLAYING" : "PAUSED"}
        </span>
      </div>
    </header>
  );
}

function ToggleChip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-md border px-2 font-mono text-2xs uppercase tracking-wide",
        on ? "border-primary/40 text-primary" : "border-border text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

function PromptPanel() {
  const prompt = useSim((s) => s.prompt);
  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <h2 className="mb-2 text-micro font-medium uppercase tracking-wider text-muted-foreground">Prompt</h2>
      <div className="mb-2 flex flex-wrap gap-1">
        {PROMPT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="h-8 rounded-full border border-border px-2 text-micro text-muted-foreground hover:text-foreground"
            onClick={() => useSim.getState().setPrompt(t.prompt)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-24 w-full resize-y rounded-lg border border-border bg-background p-2 text-sm leading-snug"
        value={prompt}
        onChange={(e) => useSim.getState().setPrompt(e.target.value)}
        placeholder="2 blue tanks stationed west of Kyiv; …"
      />
      <PromptBuilder />
      <div className="mt-2 flex gap-2">
        <Button className="flex-1" onClick={() => useSim.getState().parseForReview()}>
          Review plan
        </Button>
        <Button variant="outline" onClick={() => useSim.getState().clearAll()}>
          Clear
        </Button>
      </div>
    </section>
  );
}

function PromptBuilder() {
  return (
    <details className="mt-2 rounded-lg border border-border p-2">
      <summary className="cursor-pointer text-micro font-medium uppercase tracking-wider text-muted-foreground">
        Structured helper
      </summary>
      <HelperForm />
    </details>
  );
}

function HelperForm() {
  return (
    <form
      className="mt-2 grid grid-cols-2 gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const clause = composeClause({
          count: Number(fd.get("count") || 1),
          side: (fd.get("side") as "blue" | "red") || "blue",
          type: (fd.get("type") as UnitType) || "tank",
          stationed: fd.get("posture") === "stationed",
          place: String(fd.get("place") || "Kyiv"),
        });
        useSim.getState().appendPromptClause(clause);
      }}
    >
      <label className="text-micro text-muted-foreground">
        Count
        <input
          name="count"
          type="number"
          min={1}
          max={16}
          defaultValue={1}
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
        />
      </label>
      <label className="text-micro text-muted-foreground">
        Side
        <select name="side" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm" defaultValue="blue">
          <option value="blue">Blue</option>
          <option value="red">Red</option>
        </select>
      </label>
      <label className="col-span-2 text-micro text-muted-foreground">
        Type
        <select name="type" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm" defaultValue="tank">
          {UNIT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CATALOG[t].label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-micro text-muted-foreground">
        Posture
        <select name="posture" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm" defaultValue="stationed">
          <option value="stationed">Stationed</option>
          <option value="moving">Moving</option>
        </select>
      </label>
      <label className="text-micro text-muted-foreground">
        Place
        <input name="place" defaultValue="west of Kyiv" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm" />
      </label>
      <Button type="submit" variant="secondary" className="col-span-2" size="sm">
        <Plus /> Append clause
      </Button>
    </form>
  );
}

function ToolsPanel() {
  const mode = useSim((s) => s.mode);
  const addType = useSim((s) => s.addType);
  const addSide = useSim((s) => s.addSide);
  const n = useSim((s) => s.selectedIds.length);

  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <h2 className="mb-2 text-micro font-medium uppercase tracking-wider text-muted-foreground">Map tools</h2>
      <select
        className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
        value={mode}
        onChange={(e) => useSim.getState().setMode(e.target.value as typeof mode)}
      >
        <option value="select">Select / drag (Shift = multi)</option>
        <option value="add">Add unit (click map)</option>
        <option value="waypoint">Add waypoint to selection</option>
      </select>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={addType}
          onChange={(e) => useSim.getState().setAddType(e.target.value as UnitType)}
        >
          {UNIT_TYPES.map((t) => (
            <option key={t} value={t}>
              {CATALOG[t].label}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={addSide}
          onChange={(e) => useSim.getState().setAddSide(e.target.value as "blue" | "red")}
        >
          <option value="blue">Blue</option>
          <option value="red">Red</option>
        </select>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="destructive" className="flex-1" size="sm" onClick={() => useSim.getState().deleteSelected()}>
          <Trash2 /> Delete {n || ""}
        </Button>
        <Button variant="outline" className="flex-1" size="sm" onClick={() => useSim.getState().clearWaypointsSelected()}>
          Clear WPs
        </Button>
      </div>
    </section>
  );
}

function ForceList() {
  const units = useSim((s) => s.units);
  const selectedIds = useSim((s) => s.selectedIds);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    units
      .filter((u) => u.health > 0)
      .forEach((u) => {
        m[u.type] = (m[u.type] || 0) + 1;
      });
    return m;
  }, [units]);

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card p-3">
      <h2 className="mb-2 text-micro font-medium uppercase tracking-wider text-muted-foreground">Force</h2>
      <div className="mb-2 flex flex-wrap gap-1">
        {Object.entries(counts).map(([t, n]) => (
          <span key={t} className="rounded-md border border-border px-1.5 py-0.5 font-mono text-2xs">
            {n} {t}
          </span>
        ))}
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {units.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              onClick={(e) => useSim.getState().select(u.id, e.shiftKey || e.metaKey)}
              className={cn(
                "flex min-h-10 w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs",
                selectedIds.includes(u.id) ? "border-ring bg-muted" : "border-transparent hover:bg-muted/60",
                u.health <= 0 && "opacity-40 line-through",
              )}
            >
              <span className="size-5 shrink-0" dangerouslySetInnerHTML={{ __html: unitIconSvg(u.type) }} />
              <span className="min-w-0 flex-1 truncate">{u.name}</span>
              <span className="font-mono text-2xs tabular-nums text-muted-foreground">{Math.ceil(u.health)}hp</span>
              <span className={cn("rounded px-1 font-mono text-2xs uppercase", u.side === "red" ? "text-danger" : "text-info")}>
                {u.side}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Inspector() {
  const units = useSim((s) => s.units);
  const ids = useSim((s) => s.selectedIds);
  const selected = units.filter((u) => ids.includes(u.id));
  const spotted = useSim((s) => s.spotted);

  if (selected.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-3">
        <h2 className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Inspector</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a unit. Shift-click for multi-select, then waypoint mode for group move.
        </p>
      </section>
    );
  }

  if (selected.length > 1) {
    return (
      <section className="rounded-xl border border-border bg-card p-3">
        <h2 className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Inspector</h2>
        <p className="mt-2 text-sm">{selected.length} units selected</p>
        <p className="mt-1 text-xs text-muted-foreground">Waypoint mode applies to all selected mobile units.</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => useSim.getState().clearWaypointsSelected()}>
            Clear WPs
          </Button>
          <Button size="sm" variant="destructive" onClick={() => useSim.getState().deleteSelected()}>
            Delete
          </Button>
        </div>
      </section>
    );
  }

  const u = selected[0];
  const seenBy = (["blue", "red"] as const).filter((s) => spotted[s].includes(u.id));

  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <h2 className="text-micro font-medium uppercase tracking-wider text-muted-foreground">Inspector</h2>
      <p className="mt-1 text-sm font-medium">{u.name}</p>
      <p className="font-mono text-micro text-muted-foreground">
        {u.type} · {u.domain} · {u.status}
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-micro">
        <dt className="text-muted-foreground">HP</dt>
        <dd>
          <input
            type="range"
            min={0}
            max={u.maxHealth}
            value={u.health}
            onChange={(e) =>
              useSim.getState().patchUnit(u.id, {
                health: Number(e.target.value),
                status: Number(e.target.value) <= 0 ? "destroyed" : u.status,
              })
            }
            className="w-full"
          />
          <span className="font-mono tabular-nums">
            {Math.ceil(u.health)}/{u.maxHealth}
          </span>
        </dd>
        <dt className="text-muted-foreground">Ammo</dt>
        <dd className="font-mono tabular-nums">
          {u.magazine === 0 ? "—" : `${u.ammo}/${u.magazine}${u.reloadLeft > 0 ? ` reload ${u.reloadLeft.toFixed(1)}s` : ""}`}
        </dd>
        <dt className="text-muted-foreground">Can target</dt>
        <dd>{u.canTarget.join(", ") || "none"}</dd>
        <dt className="text-muted-foreground">Detect / engage</dt>
        <dd className="font-mono tabular-nums">
          {u.detectionRangeKm} / {u.engagementRangeKm} km
        </dd>
        <dt className="text-muted-foreground">Spotted by</dt>
        <dd>{seenBy.length ? seenBy.join(", ") : "nobody"}</dd>
        <dt className="text-muted-foreground">Waypoints</dt>
        <dd>
          {u.waypoints.length}{" "}
          <button type="button" className="underline" onClick={() => useSim.getState().clearWaypointsSelected()}>
            clear
          </button>
        </dd>
      </dl>
    </section>
  );
}

function LogPanel() {
  const logs = useSim((s) => s.logs);
  return (
    <section className="flex min-h-24 flex-1 flex-col rounded-xl border border-border bg-card p-3">
      <h2 className="mb-2 text-micro font-medium uppercase tracking-wider text-muted-foreground">Log</h2>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto font-mono text-2xs leading-snug text-muted-foreground">
        {logs.map((l) => (
          <li key={l.id} className={l.level === "success" ? "text-success" : l.level === "warn" ? "text-warning" : "text-info"}>
            {l.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-hud max-w-52 rounded-xl border border-border bg-card/95 p-2 text-2xs leading-relaxed shadow-sm">
      <p className="mb-1 flex items-center gap-1 font-medium uppercase tracking-wider text-muted-foreground">
        <Layers className="size-3" /> Layers
      </p>
      <p>
        <span className="mr-1 inline-block w-6 border-t border-dashed border-info" /> Detection
      </p>
      <p>
        <span className="mr-1 inline-block w-6 border-t-2 border-info" /> Engagement
      </p>
      <p>
        <span className="mr-1 inline-block w-6 border-t border-dashed border-primary" /> Route
      </p>
      <p>
        <span className="mr-1 inline-block size-2 rounded-sm bg-info" /> Blue · <span className="inline-block size-2 rounded-sm bg-danger" /> Red
      </p>
      <p className="mt-1 text-muted-foreground">Dashed = sense, solid = shoot. Fire only after detection, if ROE allows.</p>
    </div>
  );
}

function Minimap() {
  const units = useSim((s) => s.units);
  const center = useSim((s) => s.center);
  const span = 0.25;
  return (
    <div className="absolute right-3 top-3 z-hud overflow-hidden rounded-xl border border-border bg-card/95 shadow-sm">
      <p className="flex items-center gap-1 px-2 pt-1 text-2xs uppercase tracking-wider text-muted-foreground">
        <Crosshair className="size-3" /> {center.name}
      </p>
      <svg viewBox="0 0 120 80" className="h-20 w-32" aria-hidden>
        <rect width="120" height="80" className="fill-background" />
        {units.map((u) => {
          const x = ((u.lng - center.lng) / span + 0.5) * 120;
          const y = (0.5 - (u.lat - center.lat) / span) * 80;
          if (x < 2 || x > 118 || y < 2 || y > 78) return null;
          return (
            <circle
              key={u.id}
              cx={x}
              cy={y}
              r={u.health <= 0 ? 1.5 : 2.4}
              className={u.side === "red" ? "fill-danger" : "fill-info"}
              opacity={u.health <= 0 ? 0.35 : 1}
            />
          );
        })}
      </svg>
    </div>
  );
}

function PlanModal() {
  const plan = useSim((s) => s.pendingPlan);
  if (!plan) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-background/70 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-lg">
        <h2 className="text-base font-semibold">Confirm deployment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Phrase parser is the source of truth. Units not named in the prompt are omitted.
        </p>
        <p className="mt-3 font-medium">{plan.title}</p>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>
        <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm">
          {plan.groups.map((g, i) => (
            <li key={i} className="flex justify-between gap-2 rounded-md border border-border px-2 py-1">
              <span>
                {g.count}× {g.side} {g.type}
              </span>
              <span className="text-muted-foreground">{g.stationed ? "stationed" : "moving"}</span>
            </li>
          ))}
          {plan.groups.length === 0 && <li className="text-warning">Nothing to place.</li>}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => useSim.getState().cancelPlan()}>
            Cancel
          </Button>
          <Button onClick={() => useSim.getState().confirmPlan()} disabled={plan.total === 0}>
            Deploy {plan.total}
          </Button>
        </div>
      </div>
    </div>
  );
}
