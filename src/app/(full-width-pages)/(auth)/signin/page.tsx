import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Car YTH',
  description: 'Car YTH SignIn',
};

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
