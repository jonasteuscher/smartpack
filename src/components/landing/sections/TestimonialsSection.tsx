import { useTranslation } from 'react-i18next';

type Testimonial = {
  quote: string;
  author: string;
  initials: string;
};

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const testimonials = t('testimonials.items', { returnObjects: true }) as Testimonial[];

  return (
    <section id="testimonials" className="bg-[var(--surface-secondary)] py-24">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <p className="signature-font text-3xl text-brand-secondary/80">{t('testimonials.tagline')}</p>
          <h2 className="section-heading mt-3 text-4xl text-slate-900 dark:text-white">{t('testimonials.headline')}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('testimonials.description')}</p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="flex h-full flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-secondary to-brand-primary text-sm font-semibold text-white">
                  {testimonial.initials}
                </span>
                <figcaption className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {testimonial.author}
                </figcaption>
              </div>
              <blockquote className="text-base leading-relaxed text-slate-600 dark:text-slate-200">
                “{testimonial.quote}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
