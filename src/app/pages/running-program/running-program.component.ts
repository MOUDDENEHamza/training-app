import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUNNING_PROGRAM, RACE_DATE } from '../../data/running-program.data';
import { RunningWeekSession } from '../../data/models';
import { TrackingService } from '../../services/tracking.service';
import { guessCurrentRunningWeekId } from '../../utils/date-guess';
import { daysUntil, runningWeekProgress } from '../../utils/program-progress';
import { parseRepCount } from '../../utils/rep-count';
import { resolveTodaysSession } from '../../utils/todays-session';
import { IconComponent } from '../../shared/icon/icon.component';
import { RepCounterSheetComponent } from '../../shared/rep-counter-sheet/rep-counter-sheet.component';

function phaseIdForWeek(program: typeof RUNNING_PROGRAM, weekId: string): string {
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  return phase?.id ?? program.phases[0].id;
}

function weekById(program: typeof RUNNING_PROGRAM, weekId: string) {
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  const week = phase?.weeks.find((w) => w.id === weekId);
  return phase && week ? { phaseId: phase.id, week } : null;
}

interface OpenSession {
  phaseId: string;
  weekId: string;
  label: string;
  content: string;
  total: number;
}

@Component({
  selector: 'app-running-program',
  standalone: true,
  imports: [RouterLink, IconComponent, RepCounterSheetComponent],
  templateUrl: './running-program.component.html',
  styleUrl: './running-program.component.scss',
})
export class RunningProgramComponent {
  private readonly route = inject(ActivatedRoute);
  readonly tracking = inject(TrackingService);
  readonly program = RUNNING_PROGRAM;

  readonly currentWeekId = guessCurrentRunningWeekId(this.program);
  readonly activePhaseId = signal(phaseIdForWeek(this.program, this.currentWeekId));
  readonly highlightCurrentWeek = signal(false);
  readonly openSession = signal<OpenSession | null>(null);
  readonly currentWeek = weekById(this.program, this.currentWeekId);
  readonly todaysSessionLabel = resolveTodaysSession(this.program)?.label ?? null;

  readonly progress = runningWeekProgress(this.program, this.currentWeekId);
  readonly daysToRace = daysUntil(RACE_DATE);
  readonly currentPhaseTitle =
    this.program.phases.find((p) => p.id === phaseIdForWeek(this.program, this.currentWeekId))
      ?.title ?? '';

  constructor() {
    if (this.route.snapshot.fragment === 'phases') {
      this.highlightCurrentWeek.set(true);
      setTimeout(() => this.highlightCurrentWeek.set(false), 2200);
    }
    if (this.route.snapshot.queryParamMap.get('session') === 'today') {
      this.openTodaysSession();
    }
  }

  selectPhase(id: string): void {
    this.activePhaseId.set(id);
  }

  activePhase() {
    return this.program.phases.find((p) => p.id === this.activePhaseId())!;
  }

  trackingKey(phaseId: string, weekId: string, label: string): string {
    return `running:${phaseId}:${weekId}:${label}`;
  }

  repCount(content: string): number | null {
    return parseRepCount(content);
  }

  doneReps(phaseId: string, weekId: string, label: string): number {
    return this.tracking.entry(this.trackingKey(phaseId, weekId, label)).reps ?? 0;
  }

  openCounter(phaseId: string, weekId: string, session: RunningWeekSession): void {
    const total = parseRepCount(session.content);
    if (total === null) {
      return;
    }
    this.openSession.set({
      phaseId,
      weekId,
      label: session.label,
      content: session.content,
      total,
    });
  }

  /** Opens the counter for today's session, when it can be resolved and has repetitions. */
  openTodaysSession(todayInput: Date = new Date()): void {
    const today = resolveTodaysSession(this.program, todayInput);
    if (!today) {
      return;
    }
    const total = parseRepCount(today.content);
    if (total === null) {
      return;
    }
    this.openSession.set({
      phaseId: today.phaseId,
      weekId: today.weekId,
      label: today.label,
      content: today.content,
      total,
    });
  }

  closeCounter(): void {
    this.openSession.set(null);
  }

  openSessionCount(): number {
    const open = this.openSession();
    return open ? this.doneReps(open.phaseId, open.weekId, open.label) : 0;
  }

  incrementRep(): void {
    this.applyRepDelta(1);
  }

  undoRep(): void {
    this.applyRepDelta(-1);
  }

  /** Moves the open session's rep count by delta, clamped to 0..total, keeping `done` in step. */
  private applyRepDelta(delta: number): void {
    const open = this.openSession();
    if (!open) {
      return;
    }
    const key = this.trackingKey(open.phaseId, open.weekId, open.label);
    const next = Math.min(Math.max(this.openSessionCount() + delta, 0), open.total);
    this.tracking.setReps(key, next);
    this.tracking.setDone(key, next >= open.total);
  }
}
