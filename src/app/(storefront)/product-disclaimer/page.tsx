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

export const metadata = { title: "Product Disclaimer" };

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
      title: localized("1. Product Representations", "1. عرض المنتجات", locale),
      blocks: [
        P(
          "Amoon Bloom Trading LLC takes pride in presenting our products as accurately as possible. However, you acknowledge that:",
          "تفخر أمون بلوم للتجارة ذ.م.م بعرض منتجاتنا بأكبر قدر ممكن من الدقة. ومع ذلك، فإنك تقر بما يلي:"
        ),
        L([
          [
            "Product images on our website are for illustrative purposes only. Actual products may vary slightly in colour, size, arrangement, or presentation due to the handcrafted and seasonal nature of our items.",
            "صور المنتجات على موقعنا هي لأغراض توضيحية فقط. وقد تختلف المنتجات الفعلية قليلاً في اللون أو الحجم أو التنسيق أو الشكل النهائي نظرًا للطبيعة اليدوية والموسمية لمنتجاتنا.",
          ],
          [
            "Flower varieties and colours are subject to seasonal availability. We reserve the right to substitute flowers or components of equal or greater value while maintaining the overall aesthetic of the arrangement.",
            "تخضع أنواع وألوان الزهور لمدى التوفر الموسمي. ونحتفظ بحق استبدال الزهور أو المكونات بأخرى ذات قيمة مساوية أو أعلى مع الحفاظ على الطابع الجمالي العام للتنسيق.",
          ],
          [
            "Colour reproduction on digital screens may differ from actual product colours due to monitor settings and display calibration.",
            "قد يختلف ظهور الألوان على الشاشات الرقمية عن الألوان الفعلية للمنتج بسبب إعدادات الشاشة ومعايرة العرض.",
          ],
        ]),
      ],
    },
    {
      title: localized("2. Perishable Products", "2. المنتجات القابلة للتلف", locale),
      blocks: [
        P(
          "Our floral arrangements and fresh products are perishable. By purchasing such items, you acknowledge that:",
          "تنسيقاتنا الزهرية ومنتجاتنا الطازجة قابلة للتلف. وبشرائك لهذه المنتجات، فإنك تقر بما يلي:"
        ),
        L([
          [
            "Fresh flowers have a natural lifespan and their longevity depends on environmental conditions, care, and handling after delivery.",
            "للزهور الطازجة عمر افتراضي طبيعي، وتعتمد مدة بقائها على الظروف البيئية والعناية والتعامل معها بعد التسليم.",
          ],
          [
            "We are not liable for the deterioration of flowers or perishable items beyond our reasonable control once delivered.",
            "لا نتحمل مسؤولية تلف الزهور أو المنتجات القابلة للتلف بعد التسليم لأسباب خارجة عن سيطرتنا المعقولة.",
          ],
          [
            "Care instructions, where provided, should be followed to extend the life of your product.",
            "يُرجى اتباع تعليمات العناية، عند توفرها، لإطالة عمر المنتج.",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "3. Personalised & Custom Products",
        "3. المنتجات المخصصة والمصممة حسب الطلب",
        locale
      ),
      blocks: [
        L([
          [
            "Personalised items are produced based on information provided by the customer. We accept no responsibility for errors in personalisation arising from inaccurate customer-submitted details.",
            "تُنتج العناصر المخصصة بناءً على المعلومات التي يقدّمها العميل، ولا نتحمل أي مسؤولية عن أخطاء التخصيص الناتجة عن معلومات غير دقيقة مقدَّمة من العميل.",
          ],
          [
            "Minor variations in font style, sizing, or positioning of personalised elements may occur.",
            "قد تحدث اختلافات طفيفة في نوع الخط أو الحجم أو موضع العناصر المخصصة.",
          ],
          [
            "Custom and personalised products cannot be returned unless they are defective or materially different from what was agreed.",
            "لا يمكن إرجاع المنتجات المخصصة والمصممة حسب الطلب إلا إذا كانت معيبة أو مختلفة جوهريًا عمّا تم الاتفاق عليه.",
          ],
        ]),
      ],
    },
    {
      title: localized("4. Baby & Children's Products", "4. منتجات الأطفال والرضّع", locale),
      blocks: [
        P(
          "Our newborn and children's gift products are intended as gifts for adult recipients to present to children. Please note:",
          "منتجات هدايا المواليد والأطفال لدينا مخصصة كهدايا يقدمها البالغون للأطفال. يُرجى ملاحظة ما يلي:"
        ),
        L([
          [
            `All baby products included in our gift boxes comply with applicable safety standards in ${contact.countryName} where required.`,
            `تتوافق جميع منتجات الأطفال المدرجة في صناديق الهدايا لدينا مع معايير السلامة المعمول بها في ${contact.countryName} حيثما يلزم.`,
          ],
          [
            "Items such as balloons and small accessories may present a choking or suffocation hazard. Keep out of reach of children under 3 years of age.",
            "قد تشكّل عناصر مثل البالونات والإكسسوارات الصغيرة خطر اختناق. يُرجى إبقاؤها بعيدًا عن متناول الأطفال دون سن 3 سنوات.",
          ],
          [
            "Adult supervision is required when presenting balloon gifts to infants and young children.",
            "يلزم إشراف شخص بالغ عند تقديم هدايا البالونات للرضّع وصغار الأطفال.",
          ],
          [
            "Amoonis Boutique is not liable for any injury resulting from misuse or failure to follow safety guidelines.",
            "لا تتحمل أموونيس بوتيك مسؤولية أي إصابة ناتجة عن سوء الاستخدام أو عدم اتباع إرشادات السلامة.",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "5. Beauty & Personal Care Products",
        "5. منتجات التجميل والعناية الشخصية",
        locale
      ),
      blocks: [
        P(
          "Gift boxes containing beauty, skincare, or personal care products are curated from reputable suppliers. However:",
          "يتم اختيار صناديق الهدايا التي تحتوي على منتجات تجميل أو عناية بالبشرة أو عناية شخصية من موردين موثوقين. مع ذلك:"
        ),
        L([
          [
            "We recommend that recipients check product ingredient lists for potential allergens before use.",
            "نوصي بأن يتحقق مستلمو الهدايا من قائمة مكونات المنتج بحثًا عن أي مسببات حساسية محتملة قبل الاستخدام.",
          ],
          [
            "We are not liable for adverse reactions arising from individual sensitivities or allergies.",
            "لا نتحمل مسؤولية ردود الفعل التحسسية الناتجة عن حساسيات فردية.",
          ],
          [
            "Products included in gift boxes are intended for personal use and should be used in accordance with their individual packaging instructions.",
            "المنتجات المدرجة في صناديق الهدايا مخصصة للاستخدام الشخصي، ويجب استخدامها وفقًا لتعليمات التغليف الخاصة بكل منتج.",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "6. Grooming & Men's Products",
        "6. منتجات العناية والحلاقة للرجال",
        locale
      ),
      blocks: [
        P(
          "Products included in men's gift cups and grooming sets are for personal use. Please follow the usage instructions provided by the respective product manufacturer.",
          "المنتجات المدرجة في أكواب الهدايا ومجموعات العناية الرجالية مخصصة للاستخدام الشخصي. يُرجى اتباع تعليمات الاستخدام المقدَّمة من الشركة المصنعة لكل منتج."
        ),
      ],
    },
    {
      title: localized("7. General Limitation", "7. تحديد عام للمسؤولية", locale),
      blocks: [
        P(
          `Amoon Bloom Trading LLC makes no warranties, express or implied, beyond those required by ${contact.consumerProtectionLawName} and the applicable laws. Our products are sold as gifts and are not intended for medical, therapeutic, or professional use unless explicitly stated.`,
          `لا تقدّم شركة أمون بلوم للتجارة ذ.م.م أي ضمانات، صريحة أو ضمنية، تتجاوز ما يقتضيه ${contact.consumerProtectionLawName} والقوانين المعمول بها الأخرى. وتُباع منتجاتنا كهدايا وليست مخصصة للاستخدام الطبي أو العلاجي أو المهني ما لم يُذكر ذلك صراحةً.`
        ),
      ],
    },
    {
      title: localized("8. Regulatory Compliance", "8. الامتثال التنظيمي", locale),
      blocks: [
        P(
          `All products sold by Amoonis Boutique are sourced from suppliers who comply with applicable laws and standards in ${contact.countryName}. We are committed to consumer safety and adhere to the requirements of the ${contact.standardsAuthority} where applicable.`,
          `يتم توريد جميع المنتجات التي تبيعها أموونيس بوتيك من موردين يلتزمون بالقوانين والمعايير المعمول بها في ${contact.countryName}. ونحن ملتزمون بسلامة المستهلك ونتقيّد بمتطلبات ${contact.standardsAuthority} حيثما ينطبق ذلك.`
        ),
      ],
    },
    {
      title: localized("9. Updates", "9. التحديثات", locale),
      blocks: [
        P(
          "This Product Disclaimer may be updated periodically. The current version will always be available on our website at amoonis.sawatech.ae.",
          "قد يتم تحديث إخلاء المسؤولية هذا بشكل دوري. وستكون النسخة الحالية متاحة دائمًا على موقعنا الإلكتروني على amoonis.sawatech.ae."
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

export default async function ProductDisclaimerPage() {
  const [locale, region] = await Promise.all([getServerLocale(), getServerRegion()]);
  const contact = await regionContactFromRegionCode(region, locale);
  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={localized("Product Disclaimer", "إخلاء مسؤولية المنتج", locale)}
      intro={localized(
        "Please read this Product Disclaimer to understand how we present our products and the limitations that apply to perishable, personalised, and gift items sold by Amoon Bloom Trading LLC.",
        "يُرجى قراءة إخلاء مسؤولية المنتج هذا لفهم كيفية عرضنا لمنتجاتنا والقيود التي تنطبق على المنتجات القابلة للتلف والمخصصة والهدايا التي تبيعها أمون بلوم للتجارة ذ.م.م.",
        locale
      )}
      badge={localized("Product Disclaimer", "إخلاء مسؤولية المنتج", locale)}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={localized("June 2026", "يونيو 2026", locale)}
      sections={getSections(locale, contact)}
    />
  );
}
