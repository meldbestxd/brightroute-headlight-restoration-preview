document.querySelectorAll('[data-slider]').forEach((slider) => {
  const range = slider.querySelector('input[type="range"]');
  const divider = slider.querySelector('.ba-divider');

  if (!range || !divider) return;

  const update = () => {
    const value = `${range.value}%`;
    slider.style.setProperty('--split', value);
    divider.style.left = value;
  };

  range.addEventListener('input', update, { passive: true });
  update();
});

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('quote-form');
if (form) {
  const status = document.getElementById('form-status');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const accessKey = (data.get('access_key') || '').toString().trim();

    if (!accessKey || accessKey === 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY') {
      if (status) {
        status.textContent = 'Add your Web3Forms access key first, then this form will send normally.';
        status.dataset.state = 'error';
      }
      return;
    }

    if (status) {
      status.textContent = 'Sending your quote request…';
      status.dataset.state = 'loading';
    }
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        if (status) {
          status.textContent = 'Quote request sent. BrightRoute can now review your details and attached photos.';
          status.dataset.state = 'success';
        }
        return;
      }

      throw new Error(result.message || 'The form did not send.');
    } catch (error) {
      if (status) {
        status.textContent = `${error.message || 'Something went wrong.'} If needed, text the photos to (708) 942-4258.`;
        status.dataset.state = 'error';
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
