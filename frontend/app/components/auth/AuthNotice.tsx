'use client';

import { useEffect, useState } from 'react';

export default function AuthNotice() {
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const value = sessionStorage.getItem('emble.auth.notice');
    if (value) {
      setNotice(value);
      sessionStorage.removeItem('emble.auth.notice');
    }
  }, []);

  if (!notice) return null;

  return (
    <div className="w-full mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      {notice}
    </div>
  );
}
