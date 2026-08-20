import { RunningProgram } from './models';

/** Semi de Boulogne-Billancourt — dimanche 15 novembre 2026. */
export const RACE_DATE = new Date(2026, 10, 15);

export const RUNNING_PROGRAM: RunningProgram = {
  objective:
    "Objectif : tenir 4:07/km pendant 21,1 km. Le programme se découpe en 3 phases + affûtage. 3 séances de course par semaine intégrées au planning muscu/natation.",
  targetTime: '1h26',
  paces: [
    {
      allure: 'EF (Endurance Fondamentale)',
      minKm: "5'15–5'30",
      kmh: '10.9–11.4',
      usage: 'Footings récupération et sorties longues lentes',
    },
    {
      allure: 'Allure marathon',
      minKm: "4'55–5'00",
      kmh: '12.0–12.2',
      usage: 'Blocs en sortie longue',
    },
    {
      allure: 'Seuil',
      minKm: "4'05–4'15",
      kmh: '14.1–14.6',
      usage: 'Séances seuil et tempo',
    },
    {
      allure: 'Allure semi (cible)',
      minKm: "4'05–4'10",
      kmh: '14.4–14.6',
      usage: 'Séances spécifiques et course',
    },
    {
      allure: 'Fractionné 10 km',
      minKm: "3'55–4'00",
      kmh: '15.0–15.3',
      usage: 'Fractionné court et moyen',
    },
    {
      allure: 'VMA',
      minKm: "3'25–3'35",
      kmh: '16.8–17.5',
      usage: '200-400m rapides',
    },
  ],
  phases: [
    {
      id: 'base-aerobie',
      title: '1 – Base aérobie',
      period: 'Mi-juin → mi-juillet',
      duration: '4 sem.',
      objective: "Consolider le volume, sortie longue jusqu'à 1h20",
      columns: ['Séance 1 – Endurance (lundi)', 'Séance 2 – Qualité (mercredi/jeudi)', 'Séance 3 – Sortie longue (vendredi/samedi)'],
      weeks: [
        {
          id: 'S1',
          dateRange: '15-21 juin',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '40 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "6×3 min allure 10 km (3'58) récup 2'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h00 EF' },
          ],
        },
        {
          id: 'S2',
          dateRange: '22-28 juin',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '45 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "4×8 min seuil (4'10) récup 3'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h10 EF' },
          ],
        },
        {
          id: 'S3',
          dateRange: '29 juin-5 juil.',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '45 min EF + 6 lignes droites' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "8×400 m à 3'55 récup 1'30" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h15 EF' },
          ],
        },
        {
          id: 'S4',
          dateRange: '6-12 juil.',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '40 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "2×15 min seuil (4'10) récup 4'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h20 EF' },
          ],
        },
      ],
    },
    {
      id: 'developpement',
      title: '2 – Développement',
      period: 'Mi-juillet → mi-août',
      duration: '4 sem.',
      objective: 'Monter le volume, intro seuil, sortie longue 1h30-1h40',
      columns: ['Séance 1 – Endurance (lundi)', 'Séance 2 – Qualité (mercredi/jeudi)', 'Séance 3 – Sortie longue (vendredi/samedi)'],
      weeks: [
        {
          id: 'S5',
          dateRange: '13-19 juil.',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '50 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "5×1000 m à 4'00 récup 1'30" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h25 EF' },
          ],
        },
        {
          id: 'S6',
          dateRange: '20-26 juil.',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '50 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "3×20 min seuil (4'10) récup 4'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h30 [1h10 EF + 20 min AM + fin EF]' },
          ],
        },
        {
          id: 'S7',
          dateRange: '27 juil.-2 août',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '55 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "3×2000 m à 4'00 récup 2'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h35 EF' },
          ],
        },
        {
          id: 'S8',
          dateRange: '3-9 août',
          sessions: [
            { label: 'Séance 1 – Endurance (lundi)', content: '50 min EF' },
            { label: 'Séance 2 – Qualité (mercredi/jeudi)', content: "2×25 min seuil (4'10) récup 4'" },
            { label: 'Séance 3 – Sortie longue (vendredi/samedi)', content: '1h40 [1h10 EF + 30 min AM + fin EF]' },
          ],
        },
      ],
    },
    {
      id: 'prepa-specifique',
      title: '3 – Prépa spécifique',
      period: 'Mi-août → fin octobre',
      duration: '10 sem.',
      objective: "Fractionné long, blocs à allure semi, sortie longue jusqu'à 2h. Passer à 4 séances/semaine si possible (réduire muscu à 3 séances).",
      columns: ['S1 – Endurance', 'S2 – Qualité', 'S3 – Spécifique semi', 'Sortie longue'],
      weeks: [
        {
          id: 'S9',
          dateRange: '10-16 août',
          sessions: [
            { label: 'S1 – Endurance', content: '50 min EF' },
            { label: 'S2 – Qualité', content: "6×1000 m à 3'58 récup 1'30" },
            { label: 'S3 – Spécifique semi', content: "5 km allure semi (4'07) – test" },
            { label: 'Sortie longue', content: '1h45 EF' },
          ],
        },
        {
          id: 'S10',
          dateRange: '17-23 août',
          sessions: [
            { label: 'S1 – Endurance', content: '55 min EF' },
            { label: 'S2 – Qualité', content: "4×2000 m à 4'00 récup 2'" },
            { label: 'S3 – Spécifique semi', content: "2×4 km à 4'07 récup 4'" },
            { label: 'Sortie longue', content: '1h50 [1h20 EF + 30 min AM]' },
          ],
        },
        {
          id: 'S11',
          dateRange: '24-30 août',
          sessions: [
            { label: 'S1 – Endurance', content: '55 min EF' },
            { label: 'S2 – Qualité', content: "10×400 m à 3'50 récup 1'" },
            { label: 'S3 – Spécifique semi', content: "3×3 km à 4'07 récup 3'" },
            { label: 'Sortie longue', content: '1h55 EF' },
          ],
        },
        {
          id: 'S12',
          dateRange: '31 août-6 sept.',
          sessions: [
            { label: 'S1 – Endurance', content: '50 min EF' },
            { label: 'S2 – Qualité', content: "5×2000 m à 4'00 récup 2'" },
            { label: 'S3 – Spécifique semi', content: "2×5 km à 4'07 récup 5'" },
            { label: 'Sortie longue', content: '2h00 [1h30 EF + 30 min AM]' },
          ],
        },
        {
          id: 'S13',
          dateRange: '7-13 sept.',
          sessions: [
            { label: 'S1 – Endurance', content: '55 min EF' },
            { label: 'S2 – Qualité', content: "4×3000 m à 4'00 récup 3'" },
            { label: 'S3 – Spécifique semi', content: "10 km allure semi (4'07) – test" },
            { label: 'Sortie longue', content: '1h45 EF' },
          ],
        },
        {
          id: 'S14',
          dateRange: '14-20 sept.',
          sessions: [
            { label: 'S1 – Endurance', content: '50 min EF' },
            { label: 'S2 – Qualité', content: "12×400 m à 3'50 récup 1'" },
            { label: 'S3 – Spécifique semi', content: "3×4 km à 4'07 récup 4'" },
            { label: 'Sortie longue', content: '2h00 [1h30 EF + 30 min AM]' },
          ],
        },
        {
          id: 'S15',
          dateRange: '21-27 sept.',
          sessions: [
            { label: 'S1 – Endurance', content: '55 min EF' },
            { label: 'S2 – Qualité', content: "3×3000 m à 3'58 récup 3'" },
            { label: 'S3 – Spécifique semi', content: "15 km allure semi (4'07–4'10)" },
            { label: 'Sortie longue', content: '1h50 EF' },
          ],
        },
        {
          id: 'S16',
          dateRange: '28 sept.-4 oct.',
          sessions: [
            { label: 'S1 – Endurance', content: '50 min EF' },
            { label: 'S2 – Qualité', content: "6×1000 m à 3'55 récup 1'30" },
            { label: 'S3 – Spécifique semi', content: "2×6 km à 4'05 récup 5'" },
            { label: 'Sortie longue', content: '2h00 [1h20 EF + 40 min AM]' },
          ],
        },
        {
          id: 'S17',
          dateRange: '5-11 oct.',
          sessions: [
            { label: 'S1 – Endurance', content: '55 min EF' },
            { label: 'S2 – Qualité', content: "4×2000 m à 3'58 récup 2'" },
            { label: 'S3 – Spécifique semi', content: "18 km allure semi (4'07–4'10)" },
            { label: 'Sortie longue', content: '1h45 EF' },
          ],
        },
        {
          id: 'S18',
          dateRange: '12-18 oct.',
          sessions: [
            { label: 'S1 – Endurance', content: '50 min EF' },
            { label: 'S2 – Qualité', content: "8×400 m à 3'45 récup 1'30" },
            { label: 'S3 – Spécifique semi', content: "2×7 km à 4'05 récup 5'" },
            { label: 'Sortie longue', content: '1h50 [1h20 EF + 30 min AM]' },
          ],
        },
      ],
    },
    {
      id: 'affutage',
      title: '4 – Affûtage',
      period: '3 semaines avant le semi',
      duration: '3 sem.',
      objective: 'Réduire le volume de 30-40%, maintenir l\'intensité. Arriver frais le jour J.',
      columns: ['Séance 1', 'Séance 2', 'Séance 3'],
      weeks: [
        {
          id: 'S19',
          dateRange: '19-25 oct. (J-3 sem.)',
          sessions: [
            { label: 'Séance 1', content: '45 min EF' },
            { label: 'Séance 2', content: "3×2000 m à 4'00 récup 2'" },
            { label: 'Séance 3', content: '1h30 [1h EF + 20 min AM]' },
          ],
        },
        {
          id: 'S20',
          dateRange: '26 oct.-1 nov. (J-2 sem.)',
          sessions: [
            { label: 'Séance 1', content: '40 min EF' },
            { label: 'Séance 2', content: "6×400 m à 3'50 récup 1'30" },
            { label: 'Séance 3', content: '1h15 EF' },
          ],
        },
        {
          id: 'S21',
          dateRange: '2-8 nov. (J-1 sem.)',
          sessions: [
            { label: 'Séance 1', content: '30 min EF souple' },
            { label: 'Séance 2', content: "20 min footing + 4×400 m à 4'07 récup 1'30" },
            { label: 'Séance 3', content: 'Dernière sortie facile — SEMI dimanche 15 nov.' },
          ],
        },
      ],
    },
  ],
  raceStrategy:
    "km 1-3 à 4'10 (retiens-toi), km 4-15 à 4'07, km 16-19 maintiens, km 20-21 tout donner.",
  splitTargets: [
    { distance: '5 km', time: "20'35" },
    { distance: '10 km', time: "41'10" },
    { distance: '15 km', time: "1h01'45" },
    { distance: '18 km', time: "1h14'06" },
  ],
};
