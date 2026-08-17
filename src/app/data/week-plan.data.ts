import { WeekDay } from './models';

export const WEEK_PLAN: WeekDay[] = [
  {
    day: 'Lundi',
    strengthSessionId: 'pecs-triceps',
    strengthLabel: 'Pecs + Triceps',
    cardio: { label: 'Course – footing 40-50 min EF', running: true, swimming: false },
  },
  {
    day: 'Mardi',
    strengthSessionId: 'dos-biceps',
    strengthLabel: 'Dos + Biceps',
    cardio: null,
  },
  {
    day: 'Mercredi',
    strengthSessionId: null,
    strengthLabel: null,
    cardio: {
      label: 'Course – fractionné/seuil + Natation',
      running: true,
      swimming: true,
    },
  },
  {
    day: 'Jeudi',
    strengthSessionId: 'epaules',
    strengthLabel: 'Épaules',
    cardio: null,
  },
  {
    day: 'Vendredi',
    strengthSessionId: null,
    strengthLabel: null,
    cardio: {
      label: 'Course – spécifique semi + Natation',
      running: true,
      swimming: true,
    },
  },
  {
    // Phase 3 asks for four runs and three strength sessions. Legs are the one to drop:
    // running four times a week, long run included, already loads them heavily.
    day: 'Samedi',
    strengthSessionId: null,
    strengthLabel: null,
    cardio: { label: 'Repos', running: false, swimming: false },
  },
  {
    day: 'Dimanche',
    strengthSessionId: null,
    strengthLabel: null,
    cardio: { label: 'Course – sortie longue', running: true, swimming: false },
  },
];
