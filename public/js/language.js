document.addEventListener('DOMContentLoaded', function() {
  // Zapisz wybrany język gdy user kliknie przełącznik
  document.querySelectorAll('.navigation-item a[href]').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('/en') || href === '/')) {
      link.addEventListener('click', function() {
        if (href.startsWith('/en')) {
          localStorage.setItem('lang', 'en');
        } else {
          localStorage.setItem('lang', 'pl');
        }
      });
    }
  });

  // Przekieruj na właściwy język jeśli nie zgadza się z zapisanym
  const savedLang = localStorage.getItem('lang');
  if (!savedLang) return;

  const currentPath = window.location.pathname;
  const isEnglish = currentPath.startsWith('/en');

  if (savedLang === 'en' && !isEnglish) {
    const newPath = '/en' + currentPath;
    window.location.replace(newPath);
  } else if (savedLang === 'pl' && isEnglish) {
    const newPath = currentPath.replace('/en', '');
    window.location.replace(newPath);
  }
});