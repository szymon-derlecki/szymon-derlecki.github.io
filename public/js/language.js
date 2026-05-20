document.addEventListener('DOMContentLoaded', function() {
  // Zapisz jezyk gdy kliknieto przelacznik
  document.querySelectorAll('.navigation-list a').forEach(function(link) {
    const text = link.textContent.trim();
    if (text === 'EN' || text === 'PL') {
      link.addEventListener('click', function() {
        localStorage.setItem('lang', text.toLowerCase());
      });
    }
  });

  const savedLang = localStorage.getItem('lang');
  if (!savedLang) return;

  const currentPath = window.location.pathname;
  const isEnglish = currentPath.startsWith('/en');

  if (savedLang === 'en' && !isEnglish) {
    // Znajdz link do angielskiej wersji tej strony
    const enLink = document.querySelector('.navigation-list a[href*="/en"]');
    if (enLink) {
      window.location.replace(enLink.getAttribute('href'));
    }
  }
});