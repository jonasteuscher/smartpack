import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQSection = () => {
  const { t } = useTranslation();
  const faqs = t('faq.items', { returnObjects: true }) as FAQItem[];

  return (
    <section id="faq" className="py-24">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-secondary">
            {t('faq.tagline')}
          </span>
          <h2 className="section-heading mt-4 text-4xl text-slate-900 dark:text-white">{t('faq.headline')}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('faq.description')}</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 rounded-3xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur dark:divide-slate-700 dark:border-slate-800/60 dark:bg-slate-900/60">
          {faqs.map((faq) => (
            <Disclosure key={faq.question} as="div" className="px-6 py-5">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex w-full items-center justify-between text-left">
                    <span className="text-base font-semibold text-slate-700 dark:text-white">{faq.question}</span>
                    {open ? (
                      <MinusSmallIcon className="h-6 w-6 text-brand-secondary" />
                    ) : (
                      <PlusSmallIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </Disclosure.Button>
                  <Disclosure.Panel className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
