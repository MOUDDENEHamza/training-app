import { StrengthSession, TractionPhase } from './models';

function w(...pairs: [string, string][]) {
  return pairs.map(([week, value]) => ({ week, value }));
}

export const STRENGTH_SESSIONS: StrengthSession[] = [
  {
    id: 'pecs-triceps',
    name: 'Pecs + Triceps',
    day: 'Lundi',
    theme: 'red',
    intro:
      'Mouvements principaux en 5×5 lourd. Accessoires en 3×8-12. Finisher abdos.',
    groups: [
      {
        title: 'PECS – FORCE',
        exercises: [
          {
            id: 'dev-couche-barre',
            name: 'Dév. couché barre',
            scheme: "5×5 | Repos 3-4 min | Tempo explosif (charge ≈ 85% max)",
            weeks: w(
              ['S1', '5×65kg'],
              ['S2', '5×70kg'],
              ['S3', '5×75kg'],
              ['S4', '5×80kg'],
              ['S5', '5×85kg']
            ),
          },
          {
            id: 'dev-incline-barre',
            name: 'Dév. incliné barre',
            scheme: '5×5 | Repos 3 min',
            weeks: w(
              ['S1', '5×50kg'],
              ['S2', '5×55kg'],
              ['S3', '5×60kg'],
              ['S4', '5×65kg'],
              ['S5', '5×70kg']
            ),
          },
        ],
      },
      {
        title: 'PECS – HYPERTROPHIE',
        exercises: [
          {
            id: 'dev-couche-halteres',
            name: 'Dév. couché haltères',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×20kg'], ['S2', '10×22kg'], ['S3', '10×24kg']),
          },
          {
            id: 'ecartes-poulie-moyenne',
            name: 'Écartés poulie moyenne',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×18kg'], ['S2', '12×20kg'], ['S3', '12×23kg']),
          },
          {
            id: 'butterfly-poulie',
            name: 'Butterfly poulie',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×80kg'], ['S2', '10×86kg'], ['S3', '10×93kg']),
          },
        ],
      },
      {
        title: 'TRICEPS – FORCE',
        exercises: [
          {
            id: 'dev-couche-serre-barre',
            name: 'Dév. couché serré barre',
            scheme: '5×5 | Repos 3 min',
            weeks: w(
              ['S1', '5×50kg'],
              ['S2', '5×55kg'],
              ['S3', '5×60kg'],
              ['S4', '5×65kg'],
              ['S5', '5×70kg']
            ),
          },
        ],
      },
      {
        title: 'TRICEPS – HYPERTROPHIE',
        exercises: [
          {
            id: 'extension-poulie-haute-corde',
            name: 'Extension poulie haute corde',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×42kg'], ['S2', '10×46kg'], ['S3', '10×50kg']),
          },
          {
            id: 'dips-poids-de-corps',
            name: 'Dips poids de corps',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10 reps'], ['S2', '10 reps'], ['S3', '10 reps']),
          },
        ],
      },
      {
        title: 'FINISHER',
        exercises: [
          {
            id: 'abdos-planche',
            name: 'Abdos – Planche',
            scheme: '4×1 min',
            weeks: w(['S1', '1 min'], ['S2', '1 min'], ['S3', '1 min'], ['S4', '1 min']),
          },
          {
            id: 'chaise-roumaine',
            name: 'Chaise roumaine',
            scheme: '4 séries dégressives',
            weeks: w(
              ['S1', '5+15+5'],
              ['S2', '5+12+5'],
              ['S3', '5+10+5'],
              ['S4', '5+8+5']
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'dos-biceps',
    name: 'Dos + Biceps',
    day: 'Mardi',
    theme: 'green',
    intro:
      'Tractions EN PREMIER (priorité muscle-up). Mouvements principaux en 5×5. Accessoires en 3×8-12.',
    groups: [
      {
        title: 'TRACTIONS – PRIORITÉ',
        exercises: [
          {
            id: 'tractions-poids-libre',
            name: 'Tractions poids libre',
            scheme:
              "6×4-5 reps | Repos 2-3 min | Phase 1 : volume. Explosif en montée.",
            weeks: w(['S1', '5 reps'], ['S2', '5 reps'], ['S3', '5 reps'], ['S4', '5 reps']),
          },
        ],
      },
      {
        title: 'DOS – FORCE',
        exercises: [
          {
            id: 'rowing-barre',
            name: 'Rowing barre',
            scheme: '5×5 | Repos 3 min | Dos plat, explosif',
            weeks: w(['S1', '5×50kg'], ['S2', '5×55kg'], ['S3', '5×60kg'], ['S4', '5×65kg']),
          },
        ],
      },
      {
        title: 'DOS – HYPERTROPHIE',
        exercises: [
          {
            id: 'lat-pulldown-machine',
            name: 'Lat pulldown machine',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×46kg'], ['S2', '10×48kg'], ['S3', '10×52kg']),
          },
          {
            id: 'seated-row-machine',
            name: 'Seated row machine',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×46kg'], ['S2', '10×48kg'], ['S3', '10×52kg']),
          },
          {
            id: 'lat-pulldown-prise-neutre',
            name: 'Lat pulldown prise neutre',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×46kg'], ['S2', '10×48kg'], ['S3', '10×52kg']),
          },
          {
            id: 'machine-lombaire',
            name: 'Machine lombaire',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×86kg'], ['S2', '10×92kg'], ['S3', '10×100kg']),
          },
        ],
      },
      {
        title: 'BICEPS – FORCE',
        exercises: [
          {
            id: 'curl-barre',
            name: 'Curl barre',
            scheme: "5×5 | Repos 2'30",
            weeks: w(
              ['S1', '5×30kg'],
              ['S2', '5×32.5kg'],
              ['S3', '5×35kg'],
              ['S4', '5×37.5kg']
            ),
          },
        ],
      },
      {
        title: 'BICEPS – HYPERTROPHIE',
        exercises: [
          {
            id: 'curl-halteres-alterne',
            name: 'Curl haltères alterné',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×16kg'], ['S2', '10×18kg'], ['S3', '10×18kg']),
          },
          {
            id: 'curl-debout-poulie',
            name: 'Curl debout poulie',
            scheme: "3×10 | Repos 1'30",
            weeks: w(['S1', '10×42kg'], ['S2', '10×46kg'], ['S3', '10×52kg']),
          },
        ],
      },
      {
        title: 'FINISHER',
        exercises: [
          {
            id: 'obliques',
            name: 'Obliques – 4 séries',
            scheme: '4 séries',
            weeks: w(['S1', '4 s.']),
          },
          {
            id: 'chaise-roumaine',
            name: 'Chaise roumaine',
            scheme: '4 séries dégressives',
            weeks: w(
              ['S1', '5+15+5'],
              ['S2', '5+12+5'],
              ['S3', '5+10+5'],
              ['S4', '5+8+5']
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'epaules',
    name: 'Épaules',
    day: 'Jeudi',
    theme: 'purple',
    intro: 'Développé militaire en force. Isolation en hypertrophie. Finisher abdos.',
    groups: [
      {
        title: 'ÉCHAUFFEMENT',
        exercises: [
          {
            id: 'rotation-externe-poulie',
            name: 'Rotation externe poulie (chaque bras)',
            scheme: '3×15',
            weeks: w(['S1', '15×4kg'], ['S2', '15×4kg'], ['S3', '15×4kg']),
          },
        ],
      },
      {
        title: 'ÉPAULES – FORCE',
        exercises: [
          {
            id: 'dev-militaire-halteres',
            name: 'Dév. militaire haltères',
            scheme: '5×5 | Repos 3 min | Explosif',
            weeks: w(['S1', '5×24kg'], ['S2', '5×26kg'], ['S3', '5×28kg'], ['S4', '5×30kg']),
          },
        ],
      },
      {
        title: 'ÉPAULES – HYPERTROPHIE',
        exercises: [
          {
            id: 'elevations-laterales-halteres',
            name: 'Élévations latérales haltères',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×10kg'], ['S2', '12×12kg'], ['S3', '12×12kg']),
          },
          {
            id: 'elevations-laterales-poulie',
            name: 'Élévations latérales poulie',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×7kg'], ['S2', '12×9kg'], ['S3', '12×9kg']),
          },
          {
            id: 'oiseau-halteres',
            name: 'Oiseau haltères',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×8kg'], ['S2', '12×10kg'], ['S3', '12×10kg']),
          },
          {
            id: 'face-pull',
            name: 'Face pull',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×42kg'], ['S2', '12×46kg'], ['S3', '12×52kg']),
          },
          {
            id: 'shrug-halteres',
            name: 'Shrug haltères',
            scheme: "3×12 | Repos 1'30",
            weeks: w(['S1', '12×28kg'], ['S2', '12×30kg'], ['S3', '12×32kg']),
          },
        ],
      },
      {
        title: 'FINISHER',
        exercises: [
          {
            id: 'abdos-planche',
            name: 'Abdos – Planche',
            scheme: '4×1 min',
            weeks: w(['S1', '1 min'], ['S2', '1 min'], ['S3', '1 min'], ['S4', '1 min']),
          },
          {
            id: 'chaise-roumaine',
            name: 'Chaise roumaine',
            scheme: '4 séries dégressives',
            weeks: w(
              ['S1', '5+15+5'],
              ['S2', '5+12+5'],
              ['S3', '5+10+5'],
              ['S4', '5+8+5']
            ),
          },
        ],
      },
    ],
  },
  {
    id: 'jambes',
    name: 'Jambes',
    day: 'Samedi',
    theme: 'orange',
    intro: 'Squat et Deadlift en force. Accessoires en hypertrophie. Finisher obliques.',
    groups: [
      {
        title: 'COMPOSÉS – FORCE',
        exercises: [
          {
            id: 'squat-barre',
            name: 'Squat barre',
            scheme:
              '5×5 | Repos 4 min | Explosif montée (progression semaine à semaine)',
            weeks: w(
              ['S1', '5×80kg'],
              ['S2', '5×82.5kg'],
              ['S3', '5×85kg'],
              ['S4', '5×87.5kg'],
              ['S5', '5×90kg']
            ),
          },
          {
            id: 'deadlift-barre',
            name: 'Deadlift barre',
            scheme: '4×4 | Repos 4 min',
            weeks: w(['S1', '4×80kg'], ['S2', '4×85kg'], ['S3', '4×87.5kg'], ['S4', '4×90kg']),
          },
        ],
      },
      {
        title: 'UNILATÉRAL / FONCTIONNEL',
        exercises: [
          {
            id: 'fentes-halteres',
            name: 'Fentes haltères (ch. jambe)',
            scheme: '3×10 | Repos 2 min',
            weeks: w(['S1', '10×16kg'], ['S2', '10×18kg'], ['S3', '10×20kg']),
          },
          {
            id: 'split-squat-bulgare',
            name: 'Split squat bulgare (ch. jambe)',
            scheme: '3×8 | Repos 2 min',
            weeks: w(['S1', '8×12kg'], ['S2', '8×14kg'], ['S3', '8×16kg']),
          },
        ],
      },
      {
        title: 'FESSIERS',
        exercises: [
          {
            id: 'hip-thrust-barre',
            name: 'Hip thrust barre',
            scheme: '4×8 | Repos 2 min',
            weeks: w(['S1', '8×60kg'], ['S2', '8×65kg'], ['S3', '8×70kg'], ['S4', '8×75kg']),
          },
        ],
      },
      {
        title: 'ISCHIO / MOLLETS',
        exercises: [
          {
            id: 'prone-leg-curl-machine',
            name: 'Prone leg curl machine',
            scheme: '3×12',
            weeks: w(['S1', '12×36kg'], ['S2', '12×42kg'], ['S3', '12×46kg']),
          },
          {
            id: 'extension-mollets-debout',
            name: 'Extension mollets debout',
            scheme: '3×15',
            weeks: w(['S1', '15×60kg'], ['S2', '15×70kg'], ['S3', '15×80kg']),
          },
          {
            id: 'extension-mollets-assis',
            name: 'Extension mollets assis',
            scheme: '3×15',
            weeks: w(['S1', '15×25kg'], ['S2', '15×30kg'], ['S3', '15×35kg']),
          },
        ],
      },
      {
        title: 'STABILITÉ',
        exercises: [
          {
            id: 'hip-abduction-machine',
            name: 'Hip abduction machine',
            scheme: '3×12',
            weeks: w(['S1', '12×32kg'], ['S2', '12×36kg'], ['S3', '12×42kg']),
          },
          {
            id: 'hip-adduction-machine',
            name: 'Hip adduction machine',
            scheme: '3×12',
            weeks: w(['S1', '12×32kg'], ['S2', '12×36kg'], ['S3', '12×42kg']),
          },
        ],
      },
      {
        title: 'FINISHER',
        exercises: [
          {
            id: 'obliques',
            name: 'Obliques – 4 séries',
            scheme: '4 séries',
            weeks: w(['S1', '4 s.']),
          },
          {
            id: 'chaise-roumaine',
            name: 'Chaise roumaine',
            scheme: '4 séries dégressives',
            weeks: w(
              ['S1', '5+15+5'],
              ['S2', '5+12+5'],
              ['S3', '5+10+5'],
              ['S4', '5+8+5']
            ),
          },
        ],
      },
    ],
  },
];

export const TRACTION_PROGRESSION: TractionPhase[] = [
  {
    phase: '1 – Volume',
    duree: '4 sem.',
    format: '6×4-5 reps (toutes séances dos)',
    objectif: 'Monter à 6 reps propres',
  },
  {
    phase: '2 – Force',
    duree: '4 sem.',
    format: '5×5 reps + 2×3 tractions lestées (+5kg)',
    objectif: 'Solidifier à 8-10 reps',
  },
  {
    phase: '3 – Muscle-up',
    duree: '4 sem.',
    format: 'Tractions explosives chest-to-bar + négatifs muscle-up',
    objectif: 'Transition muscle-up',
  },
];

export const STRENGTH_PRINCIPLES: string[] = [
  'Mouvements principaux (Force) : 5×5 ou 4×4-6 avec charges lourdes (80-90% du max). Tempo explosif en montée, descente contrôlée 2-3 sec. Repos 3-4 min.',
  "Mouvements secondaires (Hypertrophie) : 3×8-12, charges modérées, repos 1'30-2'. Chercher la tension musculaire.",
  'Tractions : progression spécifique pour atteindre 10-12 reps puis muscle-up. Priorité absolue dans la séance Dos+Biceps.',
  'Finisher identique à la prépa sub40 : chaise roumaine (tractions + relevés jambes + dips) + abdos/obliques.',
  'Surcharge progressive : dès que les 5 reps deviennent faciles sur les mouvements principaux, ajouter 2.5 kg.',
];

export const STRENGTH_NOTES: { title: string; items: string[] }[] = [
  {
    title: 'Force',
    items: [
      'Sur les 5×5 : si tu rates une rep, garde la même charge la semaine suivante. Ajoute 2.5 kg seulement quand les 5 séries passent proprement.',
      'Tempo sur les mouvements principaux : descente 2-3 sec controlée, pause 1 sec en bas, montée EXPLOSIVE.',
      'Repos long respecté : 3-4 min entre les séries de force, la récup est une partie du programme.',
    ],
  },
  {
    title: 'Tractions & Muscle-up',
    items: [
      'Phase 1 (semaines 1-4) : 6×5 reps, toujours en début de séance dos. Montée explosive, descente lente 3 sec.',
      "Phase 2 (semaines 5-8) : 5×5 + 2 séries de tractions lestées (+5 kg). Objectif : 8-10 reps propres.",
      'Phase 3 (semaines 9-12) : tractions chest-to-bar explosives + négatifs de muscle-up. Transition avec bande de résistance si besoin.',
    ],
  },
  {
    title: 'Hypertrophie',
    items: [
      'Sur les accessoires 3×8-12 : cherche la tension musculaire, phase excentrique lente (3 sec), phase concentrique contrôlée.',
      'Nutrition : surplus de 300-500 kcal/jour, 1.8-2g protéines/kg (~140-155g/jour). Sans surplus, pas de masse.',
      "Sommeil 7-8h : c'est là que le muscle se construit et que la force se consolide.",
    ],
  },
  {
    title: 'Progression semaine à semaine',
    items: [
      'Les charges indiquées sont des points de départ basés sur ton profil (77 kg, 100 kg dev. couché, 100 kg squat).',
      "Ajuste si trop facile ou trop dur. L'objectif c'est finir chaque série à 1-2 reps de l'échec.",
      'Tiens un carnet ou note sur ton téléphone les charges utilisées chaque séance pour suivre ta progression.',
    ],
  },
];
