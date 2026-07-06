export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function setTheme(mode) {
  const html = document.documentElement

  let theme = mode

  if (mode === ThemeMode.AUTO) {
    theme = getSystemTheme()
  }

  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  localStorage.setItem('aams-theme', mode)
}

export function initTheme() {
  const saved = localStorage.getItem('aams-theme') || ThemeMode.LIGHT
  setTheme(saved)
}