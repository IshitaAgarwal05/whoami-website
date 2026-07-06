import CareersClient from './CareersClient';
import '../../styles/Careers.css';

export const metadata = {
  title: 'Careers | WhoAmI',
  description: "Help us bring people's favorite universes to life. Apply for our open internship positions at WhoAmI including 3D Modelling, Crocheting, Social Media, and Robotics.",
  openGraph: {
    title: 'Careers at WhoAmI',
    description: "Help us bring people's favorite universes to life. Apply for our open internship positions at WhoAmI including 3D Modelling, Crocheting, Social Media, and Robotics.",
  }
};

export default function CareersPage() {
  return <CareersClient />;
}
