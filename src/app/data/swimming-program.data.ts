import { SwimmingProgram } from './models';

export const SWIMMING_PROGRAM: SwimmingProgram = {
  equipment: [
    {
      name: 'Planche de natation',
      utility: 'Travail des jambes isolément, maintien flottaison',
      priority: 'Essentiel',
    },
    {
      name: 'Pull-buoy',
      utility: 'Flottaison entre les jambes → focus bras uniquement',
      priority: 'Essentiel',
    },
    {
      name: 'Lunettes de natation',
      utility: 'Voir sous l\'eau, garder la tête alignée',
      priority: 'Essentiel',
    },
    {
      name: 'Plaquettes',
      utility: "Renforcement des bras, sentir l'appui dans l'eau",
      priority: 'Optionnel (plus tard)',
    },
    {
      name: 'Palmes courtes',
      utility: 'Travail technique jambes avec plus de propulsion',
      priority: 'Optionnel',
    },
  ],
  techniqueKeys: [
    {
      title: 'Alignement horizontal',
      description:
        'Corps à plat, pas les jambes qui coulent. Regarde le fond, nuque dans l\'axe.',
    },
    {
      title: "Expiration dans l'eau",
      description:
        "Expire en continu sous l'eau (bulles), inspire vite sur le côté en tournant la tête (pas en la levant).",
    },
    {
      title: 'La glisse',
      description:
        'Après chaque poussée de bras, cherche à glisser. Ne bats pas les jambes comme un fou — elles stabilisent, les bras propulsent.',
    },
    {
      title: "L'entrée du bras",
      description:
        "Le bras entre dans l'eau dans l'axe de l'épaule (pas en croix), doigts en premier, coude haut.",
    },
  ],
  drills: [
    {
      name: 'Battements de jambes avec planche',
      description:
        "Tiens la planche devant toi, bats les jambes en crawl. Tête dans l'eau, expire par le nez.",
      goal: 'Aligner le corps, sentir la propulsion jambes',
    },
    {
      name: 'Rattrapé',
      description:
        "Un bras attend l'autre devant (position flèche) avant de tirer. Rythme lent.",
      goal: 'Allongement, glisse, alignement',
    },
    {
      name: 'Bras droit seul (puis gauche)',
      description:
        'Un bras travaille, l\'autre le long du corps. Tête neutre, respire à chaque cycle.',
      goal: 'Sentir l\'appui de chaque bras indépendamment',
    },
    {
      name: 'Pull-buoy',
      description:
        'Place le pull-buoy entre les cuisses, ne bats pas les jambes. Travaille uniquement les bras.',
      goal: 'Renforcer la traction des bras, sentir la glisse',
    },
    {
      name: 'Respiration 1/3',
      description:
        'Inspire tous les 3 mouvements de bras (alterne côté droit / gauche).',
      goal: 'Respiration bilatérale (équilibre de nage)',
    },
    {
      name: 'Sprint sur 1L',
      description:
        'Crawl le plus vite possible sur 1 longueur. Récup 1 min complet après.',
      goal: 'Vitesse, coordination sous fatigue',
    },
  ],
  phases: [
    {
      id: 'decouverte',
      title: '1 – Découverte',
      period: 'Juillet (4 sem.)',
      seanceA: {
        label: 'Séance A – Technique (mercredi)',
        content: [
          'Écha : 4L souple',
          'Éducatifs : 4L battements planche + 4L rattrapé + 4L respiration 1/3',
          'Corps : 8L crawl tranquille',
          'Retour : 2L souple',
        ],
      },
      seanceB: {
        label: 'Séance B – Endurance douce (vendredi/samedi)',
        content: [
          'Écha : 4L (crawl/brasse)',
          'Éducatifs : 4L battements + 4L rattrapé',
          'Corps : 10L crawl (pause 30s)',
          'Retour : 2L',
        ],
      },
      volume: '~24-28L par séance',
    },
    {
      id: 'base-technique',
      title: '2 – Base technique',
      period: 'Août (4 sem.)',
      seanceA: {
        label: 'Séance A – Technique (mercredi)',
        content: [
          'Écha : 4L souple',
          'Éducatifs : 4L rattrapé + 4L bras droit seul + 4L bras gauche seul',
          'Corps : 12L crawl',
          'Retour : 2L',
        ],
      },
      seanceB: {
        label: 'Séance B – Endurance douce (vendredi/samedi)',
        content: [
          'Écha : 4L',
          'Corps : 4×4L crawl (pause 20s entre chaque)',
          'Finale : 4L pull-buoy',
          'Retour : 2L',
        ],
      },
      volume: '~30-34L par séance',
    },
    {
      id: 'developpement',
      title: '3 – Développement',
      period: 'Sept.-oct. (8 sem.)',
      seanceA: {
        label: 'Séance A – Technique (mercredi)',
        content: [
          'Écha : 4L',
          'Éducatifs : 2L rattrapé + 4L pull-buoy (focus bras)',
          'Corps : 8×2L crawl (pause 15s)',
          'Finale : 4L sprint',
          'Retour : 2L',
        ],
      },
      seanceB: {
        label: 'Séance B – Endurance douce (vendredi/samedi)',
        content: [
          'Écha : 4L',
          'Corps : 6×4L crawl (pause 20s)',
          'Pull-buoy : 4L',
          'Retour : 2L',
        ],
      },
      volume: '~36-42L par séance',
    },
    {
      id: 'prepa-ironman',
      title: '4 – Prépa Ironman',
      period: 'Nov.-déc. (6 sem.)',
      seanceA: {
        label: 'Séance A – Technique (mercredi)',
        content: [
          'Écha : 4L',
          'Éducatifs : 4L pull-buoy',
          'Corps : 10×2L crawl (pause 10s)',
          'Finale : 4L sprint',
          'Retour : 2L',
        ],
      },
      seanceB: {
        label: 'Séance B – Endurance douce (vendredi/samedi)',
        content: [
          'Écha : 4L',
          'Corps : 8×4L crawl (pause 15s)',
          'Pull-buoy : 4L',
          'Retour : 2L',
        ],
      },
      volume: '~44-50L par séance',
    },
  ],
  tips: [
    '20 longueurs propres valent mieux que 40 longueurs en se noyant : qualité > quantité.',
    'Vidéo-toi si possible (posez le téléphone au bord) pour voir ta technique de l\'extérieur.',
    '2-3 leçons avec un MN au départ te feront gagner 2 mois de progression seul.',
    "Si tu t'épuises en 2 longueurs : c'est la technique, pas l'endurance. Reviens aux éducatifs.",
    "Pour l'Ironman : la nage c'est 3,8 km en eau libre — la technique est encore plus cruciale qu'en piscine (pas de mur pour se reposer).",
  ],
};
