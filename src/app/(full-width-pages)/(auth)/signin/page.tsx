import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car YTH',
  description: 'Car YTH SignIn',
};

export default function SignIn() {
  return <SignInForm />;
}
