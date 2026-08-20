import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RunningPhase, RunningProgram, RunningWeekSession } from '../../../data/models';
import { TrackingService } from '../../../services/tracking.service';
import { parseRepCount } from '../../../utils/rep-count';
import { PaceCheck, paceCheckFor } from '../../../utils/pace-check';
import { formatRaceTime } from '../../../utils/race-time';
import { runningTrackingKey } from '../running-tracking-key';

export interface SessionRef {
  phaseId: string;
  weekId: string;
  session: RunningWeekSession;
}

/**
 * The phase tabs and the weeks table beneath them. Which tab is open is local UI
 * state, so it lives here rather than on the page.
 */
@Component({
  selector: 'app-phase-weeks-table',
  standalone: true,
  templateUrl: './phase-weeks-table.component.html',
  styleUrl: './phase-weeks-table.component.scss',
})
export class PhaseWeeksTableComponent {
  @Input({ required: true }) program!: RunningProgram;
  @Input({ required: true }) currentWeekId!: string;
  @Input({ required: true }) initialPhaseId!: string;
  @Input() highlightCurrentWeek = false;

  @Output() count = new EventEmitter<SessionRef>();

  readonly tracking = inject(TrackingService);
  private readonly selectedPhaseId = signal<string | null>(null);

  get phases(): RunningPhase[] {
    return this.program.phases;
  }

  activePhaseId(): string {
    return this.selectedPhaseId() ?? this.initialPhaseId;
  }

  activePhase(): RunningPhase {
    return this.phases.find((p) => p.id === this.activePhaseId()) ?? this.phases[0];
  }

  selectPhase(id: string): void {
    this.selectedPhaseId.set(id);
  }

  trackingKey(phaseId: string, weekId: string, label: string): string {
    return runningTrackingKey(phaseId, weekId, label);
  }

  repCount(content: string): number | null {
    return parseRepCount(content);
  }

  doneReps(phaseId: string, weekId: string, label: string): number {
    return this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).reps ?? 0;
  }

  actualFor(phaseId: string, weekId: string, label: string): string {
    return this.tracking.entry(runningTrackingKey(phaseId, weekId, label)).actual ?? '';
  }

  onActualInput(phaseId: string, weekId: string, label: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tracking.setActual(runningTrackingKey(phaseId, weekId, label), value);
  }

  paceCheck(content: string, phaseId: string, weekId: string, label: string): PaceCheck | null {
    return paceCheckFor(content, this.actualFor(phaseId, weekId, label), this.program);
  }

  /** "+55 s sur la cible" / "-35 s sur la cible" / "pile sur la cible". */
  deltaLabel(check: PaceCheck): string {
    if (check.deltaSeconds === 0) {
      return 'pile sur la cible';
    }
    const sign = check.deltaSeconds > 0 ? '+' : '-';
    return `${sign}${Math.abs(check.deltaSeconds)} s sur la cible`;
  }

  formatTime(seconds: number): string {
    return formatRaceTime(seconds);
  }
}
