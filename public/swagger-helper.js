(function() {
  function ensureHttpLinks() {
    const links = document.querySelectorAll('a[href^="https://"]');
    links.forEach(link => {
      if (link.href.includes(window.location.hostname)) {
        link.href = link.href.replace('https://', 'http://');
      }
    });
    
    const resources = document.querySelectorAll('[src^="https://"]');
    resources.forEach(resource => {
      if (resource.src.includes(window.location.hostname)) {
        resource.src = resource.src.replace('https://', 'http://');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureHttpLinks);
  } else {
    ensureHttpLinks();
  }
  
  const interval = setInterval(() => {
    const swaggerContainer = document.querySelector('.swagger-ui');
    if (swaggerContainer) {
      ensureHttpLinks();
      clearInterval(interval);
    }
  }, 500);
})();
