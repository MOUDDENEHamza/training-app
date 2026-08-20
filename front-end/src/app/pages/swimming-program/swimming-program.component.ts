import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SWIMMING_PROGRAM } from '../../data/swimming-program.data';
import { TrackingService } from '../../services/tracking.service';
import { guessCurrentSwimPhaseId } from '../../utils/date-guess';
import { swimPhaseProgress } from '../../utils/program-progress';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-swimming-program',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './swimming-program.component.html',
  styleUrl: './swimming-program.component.scss',
})
export class SwimmingProgramComponent {
  private readonly route = inject(ActivatedRoute);
  readonly tracking = inject(TrackingService);
  readonly program = SWIMMING_PROGRAM;

  readonly currentPhaseId = guessCurrentSwimPhaseId(this.program);
  readonly currentPhase = this.program.phases.find((p) => p.id === this.currentPhaseId)!;
  readonly progress = swimPhaseProgress(this.program, this.currentPhaseId);
  readonly highlightCurrentPhase = signal(false);

  constructor() {
    if (this.route.snapshot.fragment === 'phases') {
      this.highlightCurrentPhase.set(true);
      setTimeout(() => this.highlightCurrentPhase.set(false), 2200);
    }
  }

  trackingKey(phaseId: string, seance: 'A' | 'B'): string {
    return `swimming:${phaseId}:${seance}`;
  }
}
