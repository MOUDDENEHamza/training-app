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
      label: 'Course – sortie longue + Natation',
      running: true,
      swimming: true,
    },
  },
  {
    day: 'Samedi',
    strengthSessionId: 'jambes',
    strengthLabel: 'Jambes',
    cardio: null,
  },
  {
    day: 'Dimanche',
    strengthSessionId: null,
    strengthLabel: null,
    cardio: { label: 'Foot ou Repos', running: false, swimming: false },
  },
];
