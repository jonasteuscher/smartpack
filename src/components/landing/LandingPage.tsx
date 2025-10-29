import Header from './Header';
import HeroSection from './sections/HeroSection';
import FeatureSection from './sections/FeatureSection';
import ProcessSection from './sections/ProcessSection';
import MetricsSection from './sections/MetricsSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FAQSection from './sections/FAQSection';
import FooterSection from './sections/FooterSection';

const LandingPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-16">
      <div className="sticky top-4 z-30 pt-6">
        <Header showUtilities />
      </div>
      <HeroSection />
      <FeatureSection />
      <ProcessSection />
      <MetricsSection />
      <TestimonialsSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
