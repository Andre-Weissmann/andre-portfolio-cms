// Expose CSS custom property values to Chart.js
// Called before charts are initialized so colors match the active theme
window.getThemeColors = function () {
  const s = getComputedStyle(document.documentElement);
  return {
    primary: s.getPropertyValue('--color-primary').trim(),
    blue: s.getPropertyValue('--color-blue').trim(),
    success: s.getPropertyValue('--color-success').trim(),
    warning: s.getPropertyValue('--color-warning').trim(),
    gold: s.getPropertyValue('--color-gold').trim(),
    error: s.getPropertyValue('--color-error').trim(),
    text: s.getPropertyValue('--color-text').trim(),
    textMuted: s.getPropertyValue('--color-text-muted').trim(),
    textFaint: s.getPropertyValue('--color-text-faint').trim(),
    border: s.getPropertyValue('--color-border').trim(),
    surface: s.getPropertyValue('--color-surface').trim(),
  };
};
