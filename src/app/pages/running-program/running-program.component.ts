import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RUNNING_PROGRAM, RACE_DATE } from '../../data/running-program.data';
import { TrackingService } from '../../services/tracking.service';
import { guessCurrentRunningWeekId } from '../../utils/date-guess';
import { daysUntil, runningWeekProgress } from '../../utils/program-progress';
import { IconComponent } from '../../shared/icon/icon.component';

function phaseIdForWeek(program: typeof RUNNING_PROGRAM, weekId: string): string {
  const phase = program.phases.find((p) => p.weeks.some((w) => w.id === weekId));
  return phase?.id ?? program.phases[0].id;
}

@Component({
  selector: 'app-running-program',
  standalone: true,
  imports: [RouterLink, IconComponent],
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

  selectPhase(id: string): void {
    this.activePhaseId.set(id);
  }

  activePhase() {
    return this.program.phases.find((p) => p.id === this.activePhaseId())!;
  }

  trackingKey(phaseId: string, weekId: string, label: string): string {
    return `running:${phaseId}:${weekId}:${label}`;
  }
}
