/* Goa wallpapers — original abstract gradients.
   These can be swapped at runtime by setting `--goa-wallpaper` on :root,
   or replaced with a user-uploaded image (url(...)) in Settings → Appearance.
*/

const GoaWallpapers = {
  coast: {
    name: 'Coast',
    light: `radial-gradient(ellipse at 18% 8%, oklch(82% 0.13 215 / 0.85) 0%, transparent 55%),
      radial-gradient(ellipse at 88% 22%, oklch(78% 0.14 250 / 0.78) 0%, transparent 50%),
      radial-gradient(ellipse at 65% 95%, oklch(86% 0.10 290 / 0.55) 0%, transparent 60%),
      radial-gradient(ellipse at 8% 92%, oklch(88% 0.09 195 / 0.6) 0%, transparent 55%),
      linear-gradient(170deg, oklch(95% 0.045 220) 0%, oklch(92% 0.06 245) 100%)`,
    dark: `radial-gradient(ellipse at 18% 8%, oklch(40% 0.16 215 / 0.65) 0%, transparent 55%),
      radial-gradient(ellipse at 88% 22%, oklch(36% 0.17 250 / 0.58) 0%, transparent 50%),
      radial-gradient(ellipse at 65% 95%, oklch(38% 0.13 290 / 0.45) 0%, transparent 60%),
      radial-gradient(ellipse at 8% 92%, oklch(34% 0.12 195 / 0.55) 0%, transparent 55%),
      linear-gradient(170deg, oklch(14% 0.030 230) 0%, oklch(11% 0.020 250) 100%)`,
  },
  dune: {
    name: 'Dune',
    light: `radial-gradient(ellipse at 80% 10%, oklch(90% 0.10 65 / 0.82) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 85%, oklch(86% 0.09 35 / 0.65) 0%, transparent 60%),
      radial-gradient(ellipse at 95% 90%, oklch(82% 0.10 320 / 0.45) 0%, transparent 55%),
      linear-gradient(155deg, oklch(96% 0.04 75) 0%, oklch(93% 0.055 50) 100%)`,
    dark: `radial-gradient(ellipse at 80% 10%, oklch(42% 0.13 65 / 0.65) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 85%, oklch(36% 0.12 35 / 0.55) 0%, transparent 60%),
      radial-gradient(ellipse at 95% 90%, oklch(34% 0.11 320 / 0.40) 0%, transparent 55%),
      linear-gradient(155deg, oklch(14% 0.030 60) 0%, oklch(11% 0.020 40) 100%)`,
  },
  forest: {
    name: 'Forest',
    light: `radial-gradient(ellipse at 20% 12%, oklch(86% 0.13 165 / 0.85) 0%, transparent 55%),
      radial-gradient(ellipse at 90% 30%, oklch(82% 0.11 195 / 0.7) 0%, transparent 55%),
      radial-gradient(ellipse at 60% 92%, oklch(88% 0.09 130 / 0.5) 0%, transparent 60%),
      linear-gradient(170deg, oklch(96% 0.04 165) 0%, oklch(92% 0.06 180) 100%)`,
    dark: `radial-gradient(ellipse at 20% 12%, oklch(38% 0.14 165 / 0.65) 0%, transparent 55%),
      radial-gradient(ellipse at 90% 30%, oklch(34% 0.13 195 / 0.55) 0%, transparent 55%),
      radial-gradient(ellipse at 60% 92%, oklch(36% 0.11 130 / 0.45) 0%, transparent 60%),
      linear-gradient(170deg, oklch(14% 0.025 165) 0%, oklch(11% 0.020 180) 100%)`,
  },
  rose: {
    name: 'Rose',
    light: `radial-gradient(ellipse at 12% 18%, oklch(88% 0.12 350 / 0.85) 0%, transparent 55%),
      radial-gradient(ellipse at 92% 8%, oklch(86% 0.11 25 / 0.7) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 95%, oklch(86% 0.10 305 / 0.55) 0%, transparent 60%),
      linear-gradient(170deg, oklch(96% 0.045 355) 0%, oklch(93% 0.055 25) 100%)`,
    dark: `radial-gradient(ellipse at 12% 18%, oklch(40% 0.15 350 / 0.65) 0%, transparent 55%),
      radial-gradient(ellipse at 92% 8%, oklch(38% 0.14 25 / 0.55) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 95%, oklch(36% 0.13 305 / 0.45) 0%, transparent 60%),
      linear-gradient(170deg, oklch(14% 0.030 355) 0%, oklch(11% 0.025 25) 100%)`,
  },
  graphite: {
    name: 'Graphite',
    light: `radial-gradient(ellipse at 25% 15%, oklch(94% 0.012 250 / 0.85) 0%, transparent 60%),
      radial-gradient(ellipse at 85% 80%, oklch(90% 0.018 230 / 0.65) 0%, transparent 60%),
      linear-gradient(170deg, oklch(97% 0.005 250) 0%, oklch(94% 0.008 240) 100%)`,
    dark: `radial-gradient(ellipse at 25% 15%, oklch(28% 0.013 250 / 0.7) 0%, transparent 60%),
      radial-gradient(ellipse at 85% 80%, oklch(24% 0.015 230 / 0.55) 0%, transparent 60%),
      linear-gradient(170deg, oklch(14% 0.010 250) 0%, oklch(10% 0.008 240) 100%)`,
  },
  aurora: {
    name: 'Aurora',
    light: `radial-gradient(ellipse at 10% 5%, oklch(86% 0.13 175 / 0.8) 0%, transparent 50%),
      radial-gradient(ellipse at 95% 30%, oklch(82% 0.15 290 / 0.75) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 92%, oklch(86% 0.12 220 / 0.6) 0%, transparent 60%),
      linear-gradient(165deg, oklch(96% 0.035 200) 0%, oklch(93% 0.06 270) 100%)`,
    dark: `radial-gradient(ellipse at 10% 5%, oklch(38% 0.18 175 / 0.65) 0%, transparent 50%),
      radial-gradient(ellipse at 95% 30%, oklch(36% 0.20 290 / 0.55) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 92%, oklch(38% 0.15 220 / 0.50) 0%, transparent 60%),
      linear-gradient(165deg, oklch(13% 0.025 200) 0%, oklch(10% 0.030 270) 100%)`,
  },
};

// Apply a wallpaper to the document
function applyGoaWallpaper(key, isDark) {
  const wp = GoaWallpapers[key];
  if (!wp) return;
  const value = isDark ? wp.dark : wp.light;
  document.documentElement.style.setProperty('--goa-wallpaper', value);
}

// Apply a custom image URL as wallpaper
function applyGoaWallpaperImage(url) {
  document.documentElement.style.setProperty('--goa-wallpaper', `url("${url}") center/cover no-repeat`);
}

Object.assign(window, { GoaWallpapers, applyGoaWallpaper, applyGoaWallpaperImage });
