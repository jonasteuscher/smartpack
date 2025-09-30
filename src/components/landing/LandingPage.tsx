import Header from './Header.tsx';
import HeroSection from './sections/HeroSection.tsx';
import FeatureSection from './sections/FeatureSection.tsx';
import ProcessSection from './sections/ProcessSection.tsx';
import MetricsSection from './sections/MetricsSection.tsx';
import TestimonialsSection from './sections/TestimonialsSection.tsx';
import FAQSection from './sections/FAQSection.tsx';
import CallToActionSection from './sections/CallToActionSection.tsx';
import FooterSection from './sections/FooterSection.tsx';

const LandingPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-16">
      <div className="sticky top-4 z-30 pt-6">
        <Header />
      </div>
      <HeroSection />
      <FeatureSection />
      <ProcessSection />
      <MetricsSection />
      <TestimonialsSection />
      <FAQSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
