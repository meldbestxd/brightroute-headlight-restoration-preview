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

const PHOTO_LIMIT_COUNT = 3;
const PHOTO_LIMIT_BYTES = 12 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

const form = document.getElementById('quote-form');
if (form) {
  const status = document.getElementById('form-status');
  const statusCard = document.getElementById('form-status-card');
  const statusTitle = document.getElementById('form-status-title');
  const submitButton = form.querySelector('button[type="submit"]');
  const photosInput = form.querySelector('input[name="photos"]');

  const setStatus = (state, message, title) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
    if (statusCard) {
      statusCard.hidden = false;
      statusCard.dataset.state = state;
    }
    if (statusTitle && title) statusTitle.textContent = title;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const selectedFiles = photosInput ? Array.from(photosInput.files || []) : [];

    if (selectedFiles.length > PHOTO_LIMIT_COUNT) {
      setStatus('error', `Please attach ${PHOTO_LIMIT_COUNT} photos or fewer.`, 'Please check your form');
      return;
    }

    const totalBytes = selectedFiles.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalBytes > PHOTO_LIMIT_BYTES) {
      setStatus('error', 'Please keep total photo size under 12 MB, or text the photos instead.', 'Please check your form');
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_PHOTO_TYPES.has((file.type || '').toLowerCase())) {
        setStatus('error', 'Please attach JPG, PNG, WebP, HEIC, or HEIF images only.', 'Please check your form');
        return;
      }
    }

    setStatus('loading', 'Sending your quote request now…', 'Submitting your request');
    if (submitButton) submitButton.disabled = true;

    try {
      const photos = await Promise.all(selectedFiles.map(async (file) => ({
        filename: file.name,
        type: file.type,
        size: file.size,
        content: await fileToBase64(file)
      })));

      const payload = {
        name: (data.get('name') || '').toString().trim(),
        phone: (data.get('phone') || '').toString().trim(),
        email: (data.get('email') || '').toString().trim(),
        city: (data.get('city') || '').toString().trim(),
        message: (data.get('message') || '').toString().trim(),
        botcheck: (data.get('botcheck') || '').toString(),
        photos
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
        const confirmationSent = Boolean(result.confirmationSent);
        setStatus(
          'success',
          confirmationSent
            ? 'Your request was sent successfully. BrightRoute got it, and a confirmation email was just sent to you too.'
            : 'Your request was sent successfully. BrightRoute got it and will follow up soon.',
          'Request sent successfully'
        );
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
