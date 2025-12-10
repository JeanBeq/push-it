// Types de séances et leurs couleurs
export const SESSION_TYPES = ['AMRAP', 'HIIT', 'EMOM'] as const;

export const TYPE_COLORS = {
  AMRAP: '#3b82f6',
  HIIT: '#ef4444',
  EMOM: '#8b5cf6',
} as const;

export const TYPE_DESCRIPTIONS = {
  AMRAP: 'As Many Rounds As Possible - Réalisez le maximum de tours dans le temps imparti',
  HIIT: 'High Intensity Interval Training - Alternance entre effort intense et récupération',
  EMOM: 'Every Minute On the Minute - Effectuez les répétitions au début de chaque minute',
} as const;
