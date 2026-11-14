import CareersClient from './CareersClient';
import '../../styles/Careers.css';

export const metadata = {
  title: 'Careers | WhoAmI',
  description: "Help us bring people's favorite universes to life. Apply for our open positions at WhoAmI including Marketing and Sales, Social Media, Crocheting, and Robotics.",
  openGraph: {
    title: 'Careers at WhoAmI',
    description: "Help us bring people's favorite universes to life. Apply for our open positions at WhoAmI including Marketing and Sales, Social Media, Crocheting, and Robotics.",
  }
};

export default function CareersPage() {
  return <CareersClient />;
}
