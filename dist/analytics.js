(() => {
  const endpoint = 'https://brightroute-analytics.meldabestxd.workers.dev/collect';
  try {
    const visitorKey = 'brightroute_visitor_id';
    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(visitorKey, visitorId);
    }

    const params = new URLSearchParams(location.search);
    const payload = {
      url: location.href,
      path: location.pathname,
      referrer: document.referrer || '',
      visitorId,
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      device: /iphone|android.*mobile|mobile/i.test(navigator.userAgent) ? 'mobile' : (/ipad|tablet|android/i.test(navigator.userAgent) ? 'tablet' : 'desktop')
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true, mode: 'cors' }).catch(() => {});
    }
  } catch (_) {}
})();
