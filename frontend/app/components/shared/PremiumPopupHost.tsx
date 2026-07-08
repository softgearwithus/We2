'use client';

import dynamic from 'next/dynamic';

const PremiumPopup = dynamic(() => import('./PremiumPopup'), {
  ssr: false,
});

export default function PremiumPopupHost() {
  return <PremiumPopup />;
}
