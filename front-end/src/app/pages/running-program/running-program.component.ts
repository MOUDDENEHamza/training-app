import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUNNING_PROGRAM, RACE_DATE } from '../../data/running-program.data';
import { RunningWeekSession } from '../../data/models';
import { TrackingService } from '../../services/tracking.service';
import { guessCurrentRunningWeekId } from '../../utils/date-guess';
import { daysUntil, runningWeekProgress } from '../../utils/program-progress';
import { parseRepCount } from '../../utils/rep-count';
import { PaceCheck, paceChecks } from '../../utils/pace-check';
import { formatRaceTime } from '../../utils/race-time';
import { resolveTodaysSession } from '../../utils/todays-session';
import { IconComponent } from '../../shared/icon/icon.component';
import { RepCounterSheetComponent } from '../../shared/rep-counter-sheet/rep-counter-sheet.component';
import { WeekSessionsCardComponent } from './week-sessions-card/week-sessions-card.component';
import { PhaseWeeksTableComponent } from './phase-weeks-table/phase-weeks-table.component';
import { runningTrackingKey } from './running-tracking-key';

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
  imports: [
    RouterLink,
    IconComponent,
    RepCounterSheetComponent,
    WeekSessionsCardComponent,
    PhaseWeeksTableComponent,
  ],
  templateUrl: './running-program.component.html',
  styleUrl: './running-program.component.scss',
})
export class RunningProgramComponent {
  private readonly route = inject(ActivatedRoute);
  readonly tracking = inject(TrackingService);
  readonly program = RUNNING_PROGRAM;

  readonly currentWeekId = guessCurrentRunningWeekId(this.program);
  readonly initialPhaseId = phaseIdForWeek(this.program, this.currentWeekId);
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
  }

  private doneReps(phaseId: string, weekId: string, label: string): number {
    return this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).reps ?? 0;
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

  /** The most recent recorded benchmark, for the stats tile. */
  latestCheck(): PaceCheck | null {
    const checks = paceChecks(this.program, (phaseId, weekId, label) =>
      this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).actual ?? ''
    );
    return checks.length ? checks[checks.length - 1] : null;
  }

  formatTime(seconds: number): string {
    return formatRaceTime(seconds);
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
    const key = runningTrackingKey(open.phaseId, open.weekId, open.label);
    const next = Math.min(Math.max(this.openSessionCount() + delta, 0), open.total);
    this.tracking.setReps(key, next);
    this.tracking.setDone(key, next >= open.total);
  }
}
