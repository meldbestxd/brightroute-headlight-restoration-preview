document.querySelectorAll('[data-slider]').forEach((slider) => {
  const range = slider.querySelector('input[type="range"]');
  const after = slider.querySelector('.after-wrap');
  const update = () => { after.style.width = `${range.value}%`; };
  range.addEventListener('input', update, { passive: true });
  update();
});

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('quote-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const body = [
      'New BrightRoute quote request',
      '',
      `Name: ${data.get('name') || ''}`,
      `Phone: ${data.get('phone') || ''}`,
      `City: ${data.get('city') || ''}`,
      `Vehicle: ${data.get('vehicle') || ''}`,
      '',
      `Message: ${data.get('message') || ''}`,
      '',
      'Please attach/send headlight photos for the most accurate quote.'
    ].join('\n');
    window.location.href = `mailto:brightroutemyj@gmail.com?subject=${encodeURIComponent('BrightRoute Headlight Restoration Quote')}&body=${encodeURIComponent(body)}`;
  });
}
