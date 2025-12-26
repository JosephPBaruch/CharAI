// MapLibre GL paint expression for fill-color.
// Primary: derive color by numeric ROI metric `paybackPeriod` (e.g., months).
//   - Quickest payback -> red (urgent)
//   - Slowest payback -> green (fine)
// Fallback: if `paybackPeriod` missing, use categorical priority/priorityRange mapping.
export const priorityFillColorExpression = [
  'case',
  ['has', 'paybackPeriod'],
  // step(paybackPeriod, baseColor, stop1, color1, stop2, color2, ...)
  ['step', ['get', 'paybackPeriod'],
    '#d7191c',
    6,  '#f58634',
    12, '#f9d423',
    18, '#a6d96a',
    24, '#1a9641'
  ],
  // Fallback to categorical priority mapping
  ['match',
    ['downcase', ['coalesce', ['to-string', ['get', 'priority']], ['to-string', ['get', 'priorityRange']], '' ]],
    'high', '#d7191c',
    'medium-high', '#f58634',
    'medium', '#f9d423',
    'medium-low', '#a6d96a',
    'low', '#1a9641',
    '#90caf9'
  ]
];
