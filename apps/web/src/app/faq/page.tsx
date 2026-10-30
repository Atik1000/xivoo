import Faq from '@/components/faq';
import PageShell from '@/components/page-shell';

export const metadata = { title: 'FAQ — Xivoo' };

export default function FaqPage() {
  return (
    <PageShell
      title="Frequently asked questions"
      blurb="Everything about ordering, delivery, payments, returns and warranty."
    >
      <Faq />
    </PageShell>
  );
}
