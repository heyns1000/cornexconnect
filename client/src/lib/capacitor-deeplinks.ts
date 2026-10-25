import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

export function setupDeepLinks() {
  if (!Capacitor.isNativePlatform()) return;

  CapApp.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);

    if (url.pathname.startsWith('/oauth/callback')) {
      const params = url.searchParams.toString();
      window.location.href = `/api/auth${url.pathname}${params ? '?' + params : ''}`;
      return;
    }

    const slug = url.pathname || '/';
    if (slug !== window.location.pathname) {
      window.location.href = slug;
    }
  });
}
