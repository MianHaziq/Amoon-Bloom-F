import { Container, Section } from "@/components/ui";
import { getServerLocale } from "@/i18n/server";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "Privacy policy" };

const getSections = (locale: Locale) => [
  {
    title: localized("1. What we collect", "1. ما الذي نجمعه", locale),
    body: localized(
      "We collect the information you give us when placing an order or creating an account — name, email, phone, delivery address, and order details. Payment information is processed by our PCI-compliant payment partner; we never store full card numbers on our servers.",
      "نجمع المعلومات التي تزوّدنا بها عند إتمام طلب أو إنشاء حساب — الاسم والبريد الإلكتروني ورقم الهاتف وعنوان التسليم وتفاصيل الطلب. أمّا معلومات الدفع فتتم معالجتها عبر شريك الدفع المتوافق مع معيار PCI؛ ولا نخزّن أرقام البطاقات كاملةً على خوادمنا مطلقًا.",
      locale
    ),
  },
  {
    title: localized("2. How we use it", "2. كيف نستخدمها", locale),
    body: localized(
      "Your data is used to fulfil orders, send transactional notifications (order confirmations, delivery updates), and — only with your consent — to keep you updated on new edits and seasonal launches.",
      "تُستخدم بياناتك لتنفيذ الطلبات، وإرسال الإشعارات المتعلقة بالمعاملات (تأكيدات الطلبات وتحديثات التسليم)، ولإطلاعك — بموافقتك فقط — على أحدث التشكيلات والإصدارات الموسمية.",
      locale
    ),
  },
  {
    title: localized("3. Sharing", "3. مشاركة البيانات", locale),
    body: localized(
      "We share data only with the partners we need to deliver your order: payment processors, courier services, and our cloud infrastructure provider. We never sell or rent your data.",
      "لا نشارك البيانات إلا مع الشركاء اللازمين لتوصيل طلبك: معالِجي المدفوعات، وخدمات التوصيل، ومزوّد البنية التحتية السحابية لدينا. ولا نبيع بياناتك أو نؤجّرها مطلقًا.",
      locale
    ),
  },
  {
    title: localized("4. Cookies", "4. ملفات تعريف الارتباط", locale),
    body: localized(
      "We use a small set of cookies to keep you signed in, remember your cart, and measure aggregate site performance. You can clear or block these in your browser settings.",
      "نستخدم مجموعة محدودة من ملفات تعريف الارتباط لإبقائك مسجّل الدخول، وتذكّر سلة مشترياتك، وقياس أداء الموقع الإجمالي. ويمكنك مسح هذه الملفات أو حظرها من إعدادات متصفحك.",
      locale
    ),
  },
  {
    title: localized("5. Your rights", "5. حقوقك", locale),
    body: localized(
      "You can ask for a copy of the data we hold, request a correction, or ask us to delete it — write to hello@amoonis-boutique.com and we will respond within 30 days.",
      "يمكنك طلب نسخة من البيانات التي نحتفظ بها، أو طلب تصحيحها، أو طلب حذفها — راسلنا على hello@amoonis-boutique.com وسنردّ عليك خلال 30 يومًا.",
      locale
    ),
  },
  {
    title: localized("6. Contact", "6. التواصل", locale),
    body: localized(
      "Questions? Reach our concierge at hello@amoonis-boutique.com.",
      "هل لديك أسئلة؟ تواصل مع خدمة الكونسيرج لدينا عبر hello@amoonis-boutique.com.",
      locale
    ),
  },
];

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const sections = getSections(locale);
  return (
    <>
      <section className="bg-cream-50 pt-16 pb-10 lg:pt-24">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
            {localized("Legal", "الشؤون القانونية", locale)}
          </p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink-900 md:text-6xl">
            {localized("Privacy policy.", "سياسة الخصوصية.", locale)}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-500">
            {localized(
              "How Amoonis Boutique handles your data — written in plain language.",
              "كيف يتعامل أموونيس بوتيك مع بياناتك — مكتوبة بلغة واضحة ومبسّطة.",
              locale
            )}
          </p>
        </Container>
      </section>

      <Section spacing="md" containerSize="md">
        <div className="prose prose-lg flex flex-col gap-10">
          {sections.map((s) => (
            <article key={s.title}>
              <h2 className="font-display text-2xl font-medium text-ink-900 md:text-3xl">
                {s.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-600">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
