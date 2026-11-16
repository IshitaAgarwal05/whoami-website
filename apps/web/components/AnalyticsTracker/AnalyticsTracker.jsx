'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import config, { getApiUrl } from '../../config';

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef('');

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams ? searchParams.toString() : '';
    const fullPath = query ? `${pathname}?${query}` : pathname;

    if (lastTracked.current === fullPath) return;
    lastTracked.current = fullPath;

    const trackVisit = async () => {
      try {
        const endpoint = getApiUrl('/api/v1/analytics/track');
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: fullPath,
            referrer: typeof document !== 'undefined' ? document.referrer : '',
          }),
        });
      } catch (e) {
        // Silently ignore tracking errors to avoid disrupting UX
      }
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => trackVisit());
      } else {
        setTimeout(trackVisit, 300);
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
