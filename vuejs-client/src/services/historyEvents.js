// historyEvents.js
// Référentiel des grandes périodes et événements historiques (France / Monde) de 1600 à nos jours

export const historicalPeriods = [
  {
    id: 'grand-siecle',
    nameFr: 'Règne de Louis XIV (Grand Siècle)',
    shortNameFr: 'Louis XIV',
    nameEn: 'Reign of Louis XIV',
    shortNameEn: 'Louis XIV',
    startYear: 1643,
    endYear: 1715,
    color: 'rgba(245, 158, 11, 0.08)', // Doré doux lumineux
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  {
    id: 'lumieres',
    nameFr: 'Siècle des Lumières',
    shortNameFr: 'Lumières',
    nameEn: 'Age of Enlightenment',
    shortNameEn: 'Enlightenment',
    startYear: 1715,
    endYear: 1789,
    color: 'rgba(250, 204, 21, 0.09)', // Jaune soleil aéré
    borderColor: 'rgba(202, 138, 4, 0.3)',
  },
  {
    id: 'revolution-empire',
    nameFr: 'Révolution & 1er Empire',
    shortNameFr: 'Révolution & Empire',
    nameEn: 'French Revolution & Empire',
    shortNameEn: 'Revolution',
    startYear: 1789,
    endYear: 1815,
    color: 'rgba(244, 63, 94, 0.08)', // Corail doux
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  {
    id: 'restauration-1848',
    nameFr: 'Restauration & Mon. de Juillet',
    shortNameFr: 'Restauration',
    nameEn: 'Restoration & July Monarchy',
    shortNameEn: 'Restoration',
    startYear: 1815,
    endYear: 1848,
    color: 'rgba(56, 189, 248, 0.08)', // Bleu azur léger
    borderColor: 'rgba(2, 132, 199, 0.3)',
  },
  {
    id: 'second-empire',
    nameFr: '2nd Empire & Rév. industrielle',
    shortNameFr: '2nd Empire',
    nameEn: 'Second Empire & Industrial Era',
    shortNameEn: '2nd Empire',
    startYear: 1852,
    endYear: 1870,
    color: 'rgba(52, 211, 153, 0.08)', // Vert émeraude léger
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  {
    id: 'belle-epoque',
    nameFr: 'La Belle Époque',
    shortNameFr: 'Belle Époque',
    nameEn: 'Belle Époque',
    shortNameEn: 'Belle Époque',
    startYear: 1871,
    endYear: 1914,
    color: 'rgba(251, 146, 60, 0.08)', // Ambre miel léger
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  {
    id: 'ww1',
    nameFr: 'Première Guerre mondiale',
    shortNameFr: '1ère Guerre',
    nameEn: 'World War I',
    shortNameEn: 'WW1',
    startYear: 1914,
    endYear: 1918,
    color: 'rgba(239, 68, 68, 0.12)', // Voile rouge alerte
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  {
    id: 'annees-folles',
    nameFr: 'Années folles & Entre-deux-guerres',
    shortNameFr: 'Années folles',
    nameEn: 'Roaring Twenties & Interwar',
    shortNameEn: 'Roaring Twenties',
    startYear: 1919,
    endYear: 1939,
    color: 'rgba(192, 132, 252, 0.08)', // Lilas violet doux
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  {
    id: 'ww2',
    nameFr: 'Seconde Guerre mondiale',
    shortNameFr: '2nde Guerre',
    nameEn: 'World War II',
    shortNameEn: 'WW2',
    startYear: 1939,
    endYear: 1945,
    color: 'rgba(220, 38, 38, 0.13)', // Voile rouge alerte
    borderColor: 'rgba(185, 28, 28, 0.4)',
  },
  {
    id: 'trente-glorieuses',
    nameFr: 'Les Trente Glorieuses',
    shortNameFr: 'Trente Glorieuses',
    nameEn: 'The Post-War Boom',
    shortNameEn: 'Post-War Boom',
    startYear: 1945,
    endYear: 1975,
    color: 'rgba(74, 222, 128, 0.08)', // Vert prairie doux
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  {
    id: 'fin-xxe',
    nameFr: 'Fin du XXe siècle & Mondialisation',
    shortNameFr: 'Fin XXe s.',
    nameEn: 'Late 20th Century',
    shortNameEn: 'Late 20th c.',
    startYear: 1975,
    endYear: 1990,
    color: 'rgba(99, 102, 241, 0.07)', // Indigo doux
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  {
    id: 'ere-numerique',
    nameFr: 'Ère numérique & Contemporaine',
    shortNameFr: 'Ère numérique',
    nameEn: 'Digital & Contemporary Era',
    shortNameEn: 'Digital Era',
    startYear: 1990,
    endYear: 2026,
    color: 'rgba(45, 212, 191, 0.08)', // Cyan turquoise doux
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
];

/**
 * Loads historical periods from an external JSON file (e.g. /history_periods.json)
 * with fallback to the default periods if unavailable or invalid.
 */
export async function loadHistoricalPeriods(url = '/history_periods.json') {
  try {
    const fetchFn = typeof window !== 'undefined' && window.fetch ? window.fetch : (typeof fetch === 'function' ? fetch : null);
    if (fetchFn) {
      let resolvedUrl = url;
      if (typeof window !== 'undefined' && window.location && window.location.origin && url.startsWith('/')) {
        resolvedUrl = `${window.location.origin}${url}`;
      }
      const response = await fetchFn(resolvedUrl);
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch {
    // Gracefully fall back to defaults without breaking the UI
  }
  return historicalPeriods;
}


