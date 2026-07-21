import {
  LegalPageLayout,
  type LegalBlock,
  type LegalSection,
} from "@/components/legal/LegalPageLayout";
import { getServerLocale } from "@/i18n/server";
import { getServerRegion } from "@/services/serverRegion";
import { localized } from "@/i18n";
import { regionContactFromRegionCode, type RegionContact } from "@/features/location/regionContact";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "Terms & Conditions" };

const getSections = (locale: Locale, contact: RegionContact): LegalSection[] => {
  const P = (en: string, ar: string): LegalBlock => ({
    type: "p",
    text: localized(en, ar, locale),
  });
  const L = (items: [string, string][]): LegalBlock => ({
    type: "list",
    items: items.map(([en, ar]) => localized(en, ar, locale)),
  });
  const LL = (items: [string, string, string, string][]): LegalBlock => ({
    type: "list",
    items: items.map(([enLabel, enText, arLabel, arText]) => ({
      label: localized(enLabel, arLabel, locale),
      text: localized(enText, arText, locale),
    })),
  });

  return [
    {
      title: localized("1. Acceptance of Terms", "1. قبول الشروط", locale),
      blocks: [
        P(
          `By accessing and using the ${contact.legalEntity} website (www.amoonbloom.com) and placing an order, you agree to be bound by these Terms and Conditions. These terms are governed by applicable Electronic Transactions, Trust Services and Consumer Protection laws.`,
          `من خلال الدخول إلى موقع ${contact.legalEntity} (www.amoonbloom.com) وإتمام أي طلب، فإنك توافق على الالتزام بهذه الشروط والأحكام. وتخضع هذه الشروط لقوانين المعاملات الإلكترونية وخدمات الثقة وحماية المستهلك المعمول بها.`
        ),
      ],
    },
    {
      title: localized("2. About Us", "2. من نحن", locale),
      blocks: [
        P(
          `${contact.legalEntity} is an online e-commerce business registered and operating in ${contact.registrationCity ? `${contact.registrationCity}, ${contact.countryName}` : contact.countryName}, offering gift boxes, flower bouquets, flower mugs, newborn gifts, natural oil, and other gift items.`,
          `${contact.legalEntity} هي متجر إلكتروني مسجل ويعمل في ${contact.registrationCity ? `${contact.registrationCity}، ${contact.countryName}` : contact.countryName}، ويقدّم صناديق الهدايا وباقات الزهور وأكواب الزهور وهدايا المواليد والزيوت الطبيعية ومنتجات الهدايا الأخرى.`
        ),
        LL([
          ["Address", contact.address, "العنوان", contact.address],
          [
            "Contact",
            `${contact.email} | WhatsApp: ${contact.whatsappNumber}`,
            "التواصل",
            `${contact.email} | واتساب: ${contact.whatsappNumber}`,
          ],
        ]),
      ],
    },
    {
      title: localized("3. Products & Availability", "3. المنتجات والتوفر", locale),
      blocks: [
        L([
          [
            "All products are subject to availability. We reserve the right to withdraw any product at any time.",
            "تخضع جميع المنتجات لمدى التوفر، ونحتفظ بحق سحب أي منتج في أي وقت.",
          ],
          [
            "Product images are for illustrative purposes. Minor variations in colour, wrapping, or arrangement may occur due to the handcrafted and perishable nature of our products.",
            "صور المنتجات لأغراض توضيحية فقط، وقد تحدث اختلافات طفيفة في اللون أو التغليف أو التنسيق نظرًا للطبيعة اليدوية والقابلة للتلف لمنتجاتنا.",
          ],
          [
            `Prices are displayed in ${contact.currencyDisplayName} and are inclusive of VAT where applicable, in accordance with ${contact.vatLawName}.`,
            `تُعرض الأسعار ب${contact.currencyDisplayName} وتشمل ضريبة القيمة المضافة حيثما ينطبق ذلك، بموجب ${contact.vatLawName}.`,
          ],
          [
            "We reserve the right to modify prices at any time without prior notice, except for confirmed orders.",
            "نحتفظ بحق تعديل الأسعار في أي وقت دون إشعار مسبق، باستثناء الطلبات المؤكدة.",
          ],
        ]),
      ],
    },
    {
      title: localized("4. Orders & Payment", "4. الطلبات والدفع", locale),
      blocks: [
        L([
          [
            `Orders are subject to acceptance and confirmation by ${contact.legalEntity}.`,
            `تخضع الطلبات لقبول وتأكيد ${contact.legalEntity}.`,
          ],
          [
            "We accept payment via the secure payment methods listed at checkout.",
            "نقبل الدفع عبر طرق الدفع الآمنة المدرجة عند إتمام الطلب.",
          ],
          [
            "Payment must be completed in full prior to dispatch. Orders are not fulfilled until payment is confirmed.",
            "يجب سداد المبلغ بالكامل قبل الشحن، ولا يتم تنفيذ الطلبات إلا بعد تأكيد الدفع.",
          ],
          [
            "By placing an order, you confirm that all information provided is accurate and that you are authorised to use the payment method selected.",
            "بتقديمك للطلب، فإنك تؤكد أن جميع المعلومات المقدَّمة صحيحة وأنك مخوَّل لاستخدام طريقة الدفع المختارة.",
          ],
          [
            "Order confirmations will be sent to the email address provided at checkout.",
            "تُرسل تأكيدات الطلبات إلى عنوان البريد الإلكتروني المقدَّم عند إتمام الطلب.",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "5. Personalisation & Custom Orders",
        "5. التخصيص والطلبات المخصصة",
        locale
      ),
      blocks: [
        P(
          "Many of our products include personalised elements (e.g. gift boxes, flower bouquets, name cards, engraving). For personalised orders:",
          "يتضمّن العديد من منتجاتنا عناصر مخصصة (مثل صناديق الهدايا وباقات الزهور وبطاقات الأسماء والنقش). بالنسبة للطلبات المخصصة:"
        ),
        L([
          [
            "Please ensure all details submitted are accurate. We are not responsible for errors in personalisation details provided by the customer.",
            "يُرجى التأكد من دقة جميع التفاصيل المقدَّمة. لا نتحمل مسؤولية الأخطاء في تفاصيل التخصيص المقدَّمة من العميل.",
          ],
          [
            "Personalised and custom orders cannot be cancelled once production has commenced.",
            "لا يمكن إلغاء الطلبات المخصصة والمعدّة حسب الطلب بعد بدء الإنتاج.",
          ],
          [
            "Production timelines for custom orders will be communicated at the time of purchase.",
            "يتم إبلاغ العميل بالمدة الزمنية لإنتاج الطلبات المخصصة عند الشراء.",
          ],
        ]),
      ],
    },
    {
      title: localized("6. Promotions & Discounts", "6. العروض والخصومات", locale),
      blocks: [
        P(
          "Promotional codes and discounts are subject to specific terms communicated at the time of the offer.",
          "تخضع أكواد العروض الترويجية والخصومات لشروط خاصة يتم الإعلان عنها وقت تقديم العرض."
        ),
      ],
    },
    {
      title: localized("7. Intellectual Property", "7. الملكية الفكرية", locale),
      blocks: [
        P(
          `All content on the ${contact.legalEntity} website including text, images, logos, and product designs is the intellectual property of ${contact.legalEntity} or its licensors and is protected under ${contact.ipLawName}. Reproduction, distribution, or commercial use without written permission is strictly prohibited.`,
          `يُعد كل محتوى موقع ${contact.legalEntity}، بما في ذلك النصوص والصور والشعارات وتصاميم المنتجات، ملكية فكرية للشركة أو مرخّصيها، ويخضع للحماية بموجب ${contact.ipLawName}. ويُحظر نسخه أو توزيعه أو استخدامه تجاريًا دون إذن كتابي.`
        ),
      ],
    },
    {
      title: localized("8. Limitation of Liability", "8. تحديد المسؤولية", locale),
      blocks: [
        P(
          `To the fullest extent permitted by ${contact.countryShort} law, ${contact.legalEntity} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our aggregate liability to any customer shall not exceed the value of the order in question.`,
          `إلى أقصى حد تسمح به قوانين ${contact.countryName}، لا تتحمل ${contact.legalEntity} مسؤولية أي أضرار غير مباشرة أو عرضية أو تبعية ناتجة عن استخدام موقعنا أو منتجاتنا. ولا تتجاوز مسؤوليتنا الإجمالية تجاه أي عميل قيمة الطلب المعني.`
        ),
      ],
    },
    {
      title: localized(
        "9. Governing Law & Dispute Resolution",
        "9. القانون الحاكم وتسوية المنازعات",
        locale
      ),
      blocks: [
        P(
          `These Terms and Conditions are governed by the laws of ${contact.countryName}. Any disputes arising shall first be attempted to be resolved amicably. If unresolved, disputes shall be referred to the competent courts of ${contact.registrationCity ? `${contact.registrationCity}, ${contact.countryShort}` : contact.countryName}.`,
          `تخضع هذه الشروط والأحكام لقوانين دولة ${contact.countryName}. وتتم أولاً محاولة تسوية أي نزاع ودّيًا، وفي حال تعذّر ذلك، تُحال المنازعات إلى المحاكم المختصة في ${contact.registrationCity || contact.countryName}.`
        ),
      ],
    },
    {
      title: localized("10. Amendments", "10. التعديلات", locale),
      blocks: [
        P(
          "We reserve the right to update these Terms and Conditions at any time. The current version will always be published on our website. Continued use of the website following any update constitutes acceptance of the amended terms.",
          "نحتفظ بحق تحديث هذه الشروط والأحكام في أي وقت، وستُنشر النسخة الحالية دائمًا على موقعنا. ويُعدّ استمرار استخدام الموقع بعد أي تحديث بمثابة موافقة على الشروط المعدّلة."
        ),
      ],
    },
    {
      title: localized("Contact Us", "تواصل معنا", locale),
      blocks: [
        P(
          "For any queries regarding this policy, please contact us:",
          "لأي استفسارات بخصوص هذه السياسة، يُرجى التواصل معنا:"
        ),
        LL([
          ["Email", contact.email, "البريد الإلكتروني", contact.email],
          ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
          ["Address", contact.address, "العنوان", contact.address],
        ]),
      ],
    },
  ];
};

export default async function TermsPage() {
  const [locale, region] = await Promise.all([getServerLocale(), getServerRegion()]);
  const contact = await regionContactFromRegionCode(region, locale);
  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={localized("Terms & Conditions", "الشروط والأحكام", locale)}
      intro={localized(
        `Please review these Terms and Conditions before accessing our website or placing an order with Amoonis Boutique, operated by ${contact.legalEntity}.`,
        `يُرجى مراجعة هذه الشروط والأحكام قبل الدخول إلى موقعنا أو إتمام أي طلب مع أموونيس بوتيك، التي تديرها ${contact.legalEntity}.`,
        locale
      )}
      badge={localized("Terms & Conditions", "الشروط والأحكام", locale)}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={localized("June 2026", "يونيو 2026", locale)}
      sections={getSections(locale, contact)}
    />
  );
}
