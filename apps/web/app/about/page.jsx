import AboutClient from './AboutClient';

export const metadata = {
  title: 'Our Story | WhoAmI',
  description: 'WhoAmI is a student-led startup in Jaipur, India, crafting identity artifacts for those who refuse to blend in.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
