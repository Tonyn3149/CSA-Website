/**
 * CSA — NAV (shared across all pages)
 * Sets active link, handles mobile hamburger toggle.
 */
(function () {
  // Mark active nav link based on current page
  const links = document.querySelectorAll('.nav-links a');
  const path  = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      hamburger.classList.toggle('open');
    });

    // Close when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-inner')) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
      }
    });
  }

  // Dark nav background on scroll
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 1);
    }, { passive: true });
  }
})();

// ---- Shared toast helper ----
function showToast(msg, duration = 2500) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

window.showToast = showToast;
