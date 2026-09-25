import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car YTH',
  description: 'สมัครสมาชิก',
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
