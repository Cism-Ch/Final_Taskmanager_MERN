// On page load or when changing themes, best to add inline in `head` to avoid FOUC
if (localStorage.theme === 'bg-gray-700' || (!('theme' in localStorage) &&  window.matchMedia('(prefers-color-scheme: bg-gray-700)').matches)
) {
  document.documentElement.classList.add('bg-white');
} else {
  document.documentElement.classList.remove('bg-gray-700');
}
