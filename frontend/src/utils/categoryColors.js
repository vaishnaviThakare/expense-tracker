export const CATEGORY_COLORS = {
  Food: '#D14D72',
  Transport: '#1F7A5C',
  Shopping: '#C99A3B',
  Bills: '#3A6EA5',
  Entertainment: '#8A5FB0',
  Health: '#4FA8A0',
  Other: '#8C9A93',
  Uncategorized: '#A6B0AB',
};

export const CATEGORY_ICONS = {
  Food: '🍽️',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '🧾',
  Entertainment: '🎬',
  Health: '❤️',
  Other: '📦',
  Uncategorized: '❔',
};

export function getCategoryColor(name) {
  return CATEGORY_COLORS[name] || CATEGORY_COLORS.Uncategorized;
}

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || CATEGORY_ICONS.Uncategorized;
}