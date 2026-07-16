document.querySelectorAll('[data-slider]').forEach((slider) => {
  const range = slider.querySelector('input[type="range"]');
  const divider = slider.querySelector('.ba-divider');

  if (!range || !divider) return;

  const setPosition = (value) => {
    divider.style.left = `${value}%`;
  };

  range.addEventListener('input', () => setPosition(range.value));
  setPosition(range.value || 50);
});

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = Array.from(document.querySelectorAll('.nav-menu a[href^="#"]'));
const trackableLinks = navLinks.filter((link) => !link.classList.contains('nav-cta'));
const sections = trackableLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.forEach((link) =>
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );
}

let clickHoldUntil = 0;

function setActiveLink(activeLink) {
  trackableLinks.forEach((link) => {
    link.classList.toggle('is-active', link === activeLink);
  });
}

trackableLinks.forEach((link) => {
  link.addEventListener('click', () => {
    clickHoldUntil = Date.now() + 1200;
    setActiveLink(link);
  });
});

function updateActiveNav() {
  if (!trackableLinks.length || !sections.length) return;
  if (Date.now() < clickHoldUntil) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = (section) => {
    const rect = section.getBoundingClientRect();
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, viewportHeight);
    return Math.max(0, bottom - top);
  };

  if (window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 12) {
    const contactLink = trackableLinks.find((link) => link.getAttribute('href') === '#contact');
    if (contactLink) setActiveLink(contactLink);
    return;
  }

  let bestIndex = 0;
  let bestScore = -1;

  sections.forEach((section, index) => {
    const score = visibleHeight(section);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  setActiveLink(trackableLinks[bestIndex]);
}

updateActiveNav();
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);

const form = document.getElementById('quote-form');
const statusCard = document.getElementById('form-status-card');
const statusTitle = document.getElementById('form-status-title');
const statusMessage = document.getElementById('form-status');
const statusNote = document.getElementById('form-status-note');

if (form && statusCard && statusTitle && statusMessage) {
  const submitButton = form.querySelector('button[type="submit"]');

  const setStatus = (state, message, title, note = '') => {
    statusCard.hidden = false;
    statusCard.className = `form-status-card ${state}`;
    statusTitle.textContent = title;
    statusMessage.textContent = message;
    if (statusNote) statusNote.textContent = note;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;
    setStatus('loading', 'Sending your quote request now…', 'Just a second');

    try {
      const payload = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        city: form.city.value.trim(),
        message: form.message.value.trim(),
        botcheck: form.botcheck.value,
        photos: []
      };

      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        form.reset();
        setStatus(
          'success',
          'Your request was sent successfully. BrightRoute got it and will follow up soon.',
          'Request sent successfully',
          'Do not resubmit. BrightRoute already received your request.'
        );
        (statusCard || form).scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      throw new Error(result.error || 'The form did not send.');
    } catch (error) {
      setStatus('error', `${error.message || 'Something went wrong.'} If needed, text the photos to (708) 942-4258.`, 'We could not send your request');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
