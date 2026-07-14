import {
  LegalPageLayout,
  type LegalBlock,
  type LegalSection,
} from "@/components/legal/LegalPageLayout";
import { getServerLocale } from "@/i18n/server";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "Privacy policy" };

const getSections = (locale: Locale): LegalSection[] => {
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
      title: localized("1. Introduction", "1. مقدمة", locale),
      blocks: [
        P(
          "Amoon Bloom Trading LLC (“we”, “us”, or “our”) is committed to protecting your personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL) and applicable regulations. This Privacy Policy explains how we collect, use, store, and protect your information when you visit or make a purchase on our website.",
          "تلتزم شركة أمون بلوم للتجارة ذ.م.م (\"نحن\" أو \"لنا\") بحماية بياناتك الشخصية وفقًا للمرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية واللوائح المعمول بها. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وتخزيننا وحمايتنا لمعلوماتك عند زيارتك لموقعنا أو الشراء منه."
        ),
      ],
    },
    {
      title: localized("2. Information We Collect", "2. المعلومات التي نجمعها", locale),
      blocks: [],
      subsections: [
        {
          title: localized(
            "2.1 Information You Provide",
            "2.1 المعلومات التي تقدّمها",
            locale
          ),
          blocks: [
            L([
              [
                "Full name, delivery address, and contact details (phone number and email address)",
                "الاسم الكامل وعنوان التسليم وبيانات التواصل (رقم الهاتف والبريد الإلكتروني)",
              ],
              [
                "Payment information processed securely through our payment gateway",
                "معلومات الدفع التي تتم معالجتها بأمان عبر بوابة الدفع الخاصة بنا",
              ],
              [
                "Order details, preferences, and special instructions",
                "تفاصيل الطلب والتفضيلات والتعليمات الخاصة",
              ],
              [
                "Communications you send us via email, WhatsApp, or our contact form",
                "المراسلات التي ترسلها إلينا عبر البريد الإلكتروني أو واتساب أو نموذج التواصل",
              ],
            ]),
          ],
        },
        {
          title: localized(
            "2.2 Information Collected Automatically",
            "2.2 المعلومات التي يتم جمعها تلقائيًا",
            locale
          ),
          blocks: [
            L([
              [
                "IP address, browser type, and device information",
                "عنوان IP ونوع المتصفح ومعلومات الجهاز",
              ],
              [
                "Browsing behaviour, pages visited, and session duration via cookies",
                "سلوك التصفح والصفحات التي تمت زيارتها ومدة الجلسة عبر ملفات تعريف الارتباط",
              ],
              [
                "Referral source and search terms used to find our website",
                "مصدر الإحالة ومصطلحات البحث المستخدَمة للوصول إلى موقعنا",
              ],
            ]),
          ],
        },
      ],
    },
    {
      title: localized(
        "3. How We Use Your Information",
        "3. كيف نستخدم معلوماتك",
        locale
      ),
      blocks: [
        P(
          "We process your personal data for the following lawful purposes:",
          "نعالج بياناتك الشخصية للأغراض القانونية التالية:"
        ),
        L([
          [
            "To process, fulfil, and deliver your orders",
            "لمعالجة طلباتك وتنفيذها وتوصيلها",
          ],
          [
            "To send order confirmations, delivery updates, and customer support communications",
            "لإرسال تأكيدات الطلبات وتحديثات التسليم ومراسلات دعم العملاء",
          ],
          [
            "To improve our website, products, and services",
            "لتحسين موقعنا ومنتجاتنا وخدماتنا",
          ],
          [
            "To comply with legal obligations under UAE law",
            "للامتثال للالتزامات القانونية بموجب القانون الإماراتي",
          ],
          [
            "To send you promotional offers and newsletters, where you have provided consent",
            "لإرسال العروض الترويجية والنشرات الإخبارية، في حال تقديمك للموافقة على ذلك",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "4. Legal Basis for Processing",
        "4. الأساس القانوني للمعالجة",
        locale
      ),
      blocks: [
        P(
          "We process your data on the basis of: (a) contractual necessity to fulfil your order; (b) your explicit consent for marketing communications; and (c) compliance with applicable UAE legal obligations.",
          "نعالج بياناتك استنادًا إلى: (أ) الضرورة التعاقدية لتنفيذ طلبك؛ (ب) موافقتك الصريحة على المراسلات التسويقية؛ و(ج) الامتثال للالتزامات القانونية الإماراتية المعمول بها."
        ),
      ],
    },
    {
      title: localized("5. Data Sharing", "5. مشاركة البيانات", locale),
      blocks: [
        P(
          "We do not sell your personal data. We may share your information with:",
          "لا نبيع بياناتك الشخصية. وقد نشارك معلوماتك مع:"
        ),
        L([
          [
            "Delivery and logistics partners solely for order fulfilment",
            "شركاء التوصيل والخدمات اللوجستية، حصريًا لغرض تنفيذ الطلبات",
          ],
          [
            "Payment processors operating under applicable security standards",
            "معالِجي المدفوعات العاملين وفق معايير الأمان المعمول بها",
          ],
          [
            "Government authorities when required by UAE law",
            "الجهات الحكومية عند الاقتضاء بموجب القانون الإماراتي",
          ],
        ]),
      ],
    },
    {
      title: localized("6. Data Retention", "6. الاحتفاظ بالبيانات", locale),
      blocks: [
        P(
          "We retain personal data for as long as necessary to fulfil the purposes described in this policy, and no longer than five (5) years following your last transaction with us, unless a longer period is required by law.",
          "نحتفظ بالبيانات الشخصية للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، وبما لا يتجاوز خمس (5) سنوات من تاريخ آخر معاملة لك معنا، ما لم يتطلب القانون مدة أطول."
        ),
      ],
    },
    {
      title: localized("7. Your Rights", "7. حقوقك", locale),
      blocks: [
        P("Under UAE law, you have the right to:", "بموجب القانون الإماراتي، يحق لك:"),
        L([
          [
            "Access the personal data we hold about you",
            "الاطلاع على البيانات الشخصية التي نحتفظ بها عنك",
          ],
          [
            "Request correction of inaccurate or incomplete data",
            "طلب تصحيح البيانات غير الدقيقة أو غير المكتملة",
          ],
          [
            "Request deletion of your personal data, subject to legal retention obligations",
            "طلب حذف بياناتك الشخصية، مع مراعاة التزامات الاحتفاظ القانونية",
          ],
          [
            "Withdraw consent for marketing communications at any time",
            "سحب موافقتك على المراسلات التسويقية في أي وقت",
          ],
          [
            "Lodge a complaint with the UAE Data Office",
            "تقديم شكوى إلى مكتب البيانات الإماراتي",
          ],
        ]),
        P(
          "To exercise any of these rights, contact us at management@amoonbloom.com or via WhatsApp at +971 50 345 6793.",
          "لممارسة أي من هذه الحقوق، تواصل معنا عبر management@amoonbloom.com أو واتساب على 6793 345 50 971+."
        ),
      ],
    },
    {
      title: localized("8. Cookies", "8. ملفات تعريف الارتباط", locale),
      blocks: [
        P(
          "Our website uses cookies to enhance your browsing experience and analyse site traffic. You may manage your cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.",
          "يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة الزيارات. ويمكنك إدارة تفضيلاتك الخاصة بملفات تعريف الارتباط من إعدادات متصفحك. علمًا بأن تعطيل بعض هذه الملفات قد يؤثر على وظائف الموقع."
        ),
      ],
    },
    {
      title: localized("9. Data Security", "9. أمان البيانات", locale),
      blocks: [
        P(
          "We implement appropriate technical and organisational measures to safeguard your personal data against unauthorised access, loss, or disclosure, in accordance with Article 16 of the UAE PDPL.",
          "نطبّق التدابير التقنية والتنظيمية المناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الفقدان أو الإفصاح، وذلك وفقًا للمادة 16 من قانون حماية البيانات الشخصية الإماراتي."
        ),
      ],
    },
    {
      title: localized("10. Updates to This Policy", "10. تحديثات هذه السياسة", locale),
      blocks: [
        P(
          "We may update this Privacy Policy periodically. Changes will be published on our website with an updated effective date. Continued use of our website after changes constitutes acceptance of the revised policy.",
          "قد نقوم بتحديث سياسة الخصوصية هذه بشكل دوري. وسيتم نشر أي تغييرات على موقعنا مع تحديث تاريخ السريان. ويُعدّ استمرار استخدام موقعنا بعد إجراء أي تغييرات بمثابة موافقة على السياسة المعدَّلة."
        ),
      ],
    },
    {
      title: localized(
        "11. Account Deletion and Data Deletion",
        "11. حذف الحساب والبيانات",
        locale
      ),
      blocks: [
        P(
          "Registered customers may request deletion of their website account and associated personal data at any time.",
          "يمكن للعملاء المسجَّلين طلب حذف حسابهم على الموقع وبياناتهم الشخصية المرتبطة به في أي وقت."
        ),
        P(
          "You may request account deletion by contacting us at management@amoonbloom.com or via WhatsApp at +971 50 345 6793.",
          "يمكنك طلب حذف حسابك من خلال التواصل معنا عبر management@amoonbloom.com أو واتساب على 6793 345 50 971+."
        ),
        P(
          "After verification, we will delete or anonymise your account data, except where certain information must be retained for legal, tax, payment, order, or regulatory purposes.",
          "بعد التحقق، سنقوم بحذف بيانات حسابك أو إخفاء هويتها، باستثناء المعلومات التي يجب الاحتفاظ بها لأغراض قانونية أو ضريبية أو متعلقة بالدفع أو الطلبات أو تنظيمية."
        ),
      ],
    },
    {
      title: localized("12. Contact Us", "12. تواصل معنا", locale),
      blocks: [
        P(
          "For privacy-related inquiries, please contact Amoonis Boutique:",
          "لأي استفسارات متعلقة بالخصوصية، يُرجى التواصل مع أموونيس بوتيك:"
        ),
        LL([
          [
            "Email",
            "management@amoonbloom.com",
            "البريد الإلكتروني",
            "management@amoonbloom.com",
          ],
          ["WhatsApp", "+971 50 345 6793", "واتساب", "6793 345 50 971+"],
          [
            "Address",
            "Abraj Centre, 903-31 Office, Naif, Dubai, United Arab Emirates",
            "العنوان",
            "أبراج سنتر، مكتب 903-31، نايف، دبي، الإمارات العربية المتحدة",
          ],
        ]),
      ],
    },
  ];
};

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={localized("Privacy Policy", "سياسة الخصوصية", locale)}
      intro={localized(
        "Amoon Bloom Trading LLC is committed to protecting your personal data. Please review this Privacy Policy before using our website or placing an order with Amoonis Boutique.",
        "تلتزم أمون بلوم للتجارة ذ.م.م بحماية بياناتك الشخصية. يُرجى مراجعة سياسة الخصوصية هذه قبل استخدام موقعنا أو إتمام أي طلب مع أموونيس بوتيك.",
        locale
      )}
      badge={localized("Privacy Policy", "سياسة الخصوصية", locale)}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={localized("June 2026", "يونيو 2026", locale)}
      sections={getSections(locale)}
    />
  );
}
