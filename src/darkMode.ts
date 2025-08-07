// Initialize dark mode
export function initializeDarkMode() {
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === null) {
    localStorage.setItem('darkMode', 'true');
    document.documentElement.classList.add('dark');
  } else if (JSON.parse(savedMode)) {
    document.documentElement.classList.add('dark');
  }
}
