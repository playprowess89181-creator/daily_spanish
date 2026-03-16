'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VocabularyMatching() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=my-exercises');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}

