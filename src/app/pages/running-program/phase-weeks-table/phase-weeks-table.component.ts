import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RunningPhase, RunningWeekSession } from '../../../data/models';
import { TrackingService } from '../../../services/tracking.service';
import { parseRepCount } from '../../../utils/rep-count';
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
  @Input({ required: true }) phases!: RunningPhase[];
  @Input({ required: true }) currentWeekId!: string;
  @Input({ required: true }) initialPhaseId!: string;
  @Input() highlightCurrentWeek = false;

  @Output() count = new EventEmitter<SessionRef>();

  readonly tracking = inject(TrackingService);
  private readonly selectedPhaseId = signal<string | null>(null);

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
}
