'use client';

import { Suspense } from 'react';
import ResetPasswordConfirmPageInner from './ResetPasswordConfirmPageInner';

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense>
      <ResetPasswordConfirmPageInner />
    </Suspense>
  );
}
