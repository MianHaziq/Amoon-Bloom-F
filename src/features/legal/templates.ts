/**
 * Canonical default content for the 5 legal pages, extracted from the old
 * hardcoded storefront templates so exactly one source of truth feeds both:
 *   1. the admin editor's "Load default template" button, and
 *   2. the one-time UAE backfill (scripts/backfill-legal-pages.mjs),
 * which seeds each region's RegionLegalPage rows from these.
 *
 * PURE module — depends only on `localized`, resolved RegionContact/VAT data and
 * pure helpers, so it runs equally in a client component and a node script (no
 * server-only imports). The storefront pages themselves render authored DB
 * content (or 404), NOT these templates.
 */
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";
import type { RegionContact } from "@/features/location/regionContact";
import type { ApiPublicVatConfig } from "@/features/vat/types";
import { termsVatClause, shippingVatClause } from "@/features/vat/vatLegalClause";
import type { LegalPageSlug } from "@/features/regions/types";
import type { LegalSection, LegalBlock } from "@/components/legal/LegalPageLayout";

export interface LegalTemplate {
  title: string;
  intro: string;
  badge: string;
  sections: LegalSection[];
}

type Ctx = { locale: Locale; contact: RegionContact; vat: ApiPublicVatConfig | null };

function helpers(locale: Locale) {
  const P = (en: string, ar: string): LegalBlock => ({ type: "p", text: localized(en, ar, locale) });
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
  return { P, L, LL };
}

function terms({ locale, contact, vat }: Ctx): LegalTemplate {
  const { P, L, LL } = helpers(locale);
  return {
    title: localized("Terms & Conditions", "الشروط والأحكام", locale),
    badge: localized("Terms & Conditions", "الشروط والأحكام", locale),
    intro: localized(
      `Please review these Terms and Conditions before accessing our website or placing an order with Amoonis Boutique, operated by ${contact.legalEntity}.`,
      `يرجى مراجعة هذه الشروط والأحكام قبل الدخول إلى موقعنا أو إتمام أي طلب مع أموونيس بوتيك، التي تديرها ${contact.legalEntity}.`,
      locale
    ),
    sections: [
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
            `${contact.legalEntity} هي متجر إلكتروني مسجل ويعمل في ${contact.registrationCity ? `${contact.registrationCity}، ${contact.countryName}` : contact.countryName}، ويقدم صناديق الهدايا وباقات الزهور وأكواب الزهور وهدايا المواليد والزيوت الطبيعية ومنتجات الهدايا الأخرى.`
          ),
          LL([
            ["Address", contact.address, "العنوان", contact.address],
            ["Contact", `${contact.email} | WhatsApp: ${contact.whatsappNumber}`, "التواصل", `${contact.email} | واتساب: ${contact.whatsappNumber}`],
          ]),
        ],
      },
      {
        title: localized("3. Products & Availability", "3. المنتجات والتوفر", locale),
        blocks: [
          L([
            ["All products are subject to availability. We reserve the right to withdraw any product at any time.", "تخضع جميع المنتجات لمدى التوفر، ونحتفظ بحق سحب أي منتج في أي وقت."],
            ["Product images are for illustrative purposes. Minor variations in colour, wrapping, or arrangement may occur due to the handcrafted and perishable nature of our products.", "صور المنتجات لأغراض توضيحية فقط، وقد تحدث اختلافات طفيفة في اللون أو التغليف أو التنسيق نظرا للطبيعة اليدوية والقابلة للتلف لمنتجاتنا."],
            termsVatClause(vat, contact.currencyDisplayName, contact.vatLawName),
            ["We reserve the right to modify prices at any time without prior notice, except for confirmed orders.", "نحتفظ بحق تعديل الأسعار في أي وقت دون إشعار مسبق، باستثناء الطلبات المؤكدة."],
          ]),
        ],
      },
      {
        title: localized("4. Orders & Payment", "4. الطلبات والدفع", locale),
        blocks: [
          L([
            [`Orders are subject to acceptance and confirmation by ${contact.legalEntity}.`, `تخضع الطلبات لقبول وتأكيد ${contact.legalEntity}.`],
            ["We accept payment via the secure payment methods listed at checkout.", "نقبل الدفع عبر طرق الدفع الآمنة المدرجة عند إتمام الطلب."],
            ["Payment must be completed in full prior to dispatch. Orders are not fulfilled until payment is confirmed.", "يجب سداد المبلغ بالكامل قبل الشحن، ولا يتم تنفيذ الطلبات إلا بعد تأكيد الدفع."],
            ["By placing an order, you confirm that all information provided is accurate and that you are authorised to use the payment method selected.", "بتقديمك للطلب، فإنك تؤكد أن جميع المعلومات المقدمة صحيحة وأنك مخول لاستخدام طريقة الدفع المختارة."],
            ["Order confirmations will be sent to the email address provided at checkout.", "ترسل تأكيدات الطلبات إلى عنوان البريد الإلكتروني المقدم عند إتمام الطلب."],
          ]),
        ],
      },
      {
        title: localized("5. Personalisation & Custom Orders", "5. التخصيص والطلبات المخصصة", locale),
        blocks: [
          P("Many of our products include personalised elements (e.g. gift boxes, flower bouquets, name cards, engraving). For personalised orders:", "يتضمن العديد من منتجاتنا عناصر مخصصة (مثل صناديق الهدايا وباقات الزهور وبطاقات الأسماء والنقش). بالنسبة للطلبات المخصصة:"),
          L([
            ["Please ensure all details submitted are accurate. We are not responsible for errors in personalisation details provided by the customer.", "يرجى التأكد من دقة جميع التفاصيل المقدمة. لا نتحمل مسؤولية الأخطاء في تفاصيل التخصيص المقدمة من العميل."],
            ["Personalised and custom orders cannot be cancelled once production has commenced.", "لا يمكن إلغاء الطلبات المخصصة والمعدة حسب الطلب بعد بدء الإنتاج."],
            ["Production timelines for custom orders will be communicated at the time of purchase.", "يتم إبلاغ العميل بالمدة الزمنية لإنتاج الطلبات المخصصة عند الشراء."],
          ]),
        ],
      },
      {
        title: localized("6. Promotions & Discounts", "6. العروض والخصومات", locale),
        blocks: [P("Promotional codes and discounts are subject to specific terms communicated at the time of the offer.", "تخضع أكواد العروض الترويجية والخصومات لشروط خاصة يتم الإعلان عنها وقت تقديم العرض.")],
      },
      {
        title: localized("7. Intellectual Property", "7. الملكية الفكرية", locale),
        blocks: [
          P(
            `All content on the ${contact.legalEntity} website including text, images, logos, and product designs is the intellectual property of ${contact.legalEntity} or its licensors and is protected under ${contact.ipLawName}. Reproduction, distribution, or commercial use without written permission is strictly prohibited.`,
            `يعد كل محتوى موقع ${contact.legalEntity}، بما في ذلك النصوص والصور والشعارات وتصاميم المنتجات، ملكية فكرية للشركة أو مرخصيها، ويخضع للحماية بموجب ${contact.ipLawName}. ويحظر نسخه أو توزيعه أو استخدامه تجاريا دون إذن كتابي.`
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
        title: localized("9. Governing Law & Dispute Resolution", "9. القانون الحاكم وتسوية المنازعات", locale),
        blocks: [
          P(
            `These Terms and Conditions are governed by the laws of ${contact.countryName}. Any disputes arising shall first be attempted to be resolved amicably. If unresolved, disputes shall be referred to the competent courts of ${contact.registrationCity ? `${contact.registrationCity}, ${contact.countryShort}` : contact.countryName}.`,
            `تخضع هذه الشروط والأحكام لقوانين دولة ${contact.countryName}. وتتم أولا محاولة تسوية أي نزاع وديا، وفي حال تعذر ذلك، تحال المنازعات إلى المحاكم المختصة في ${contact.registrationCity || contact.countryName}.`
          ),
        ],
      },
      {
        title: localized("10. Amendments", "10. التعديلات", locale),
        blocks: [
          P("We reserve the right to update these Terms and Conditions at any time. The current version will always be published on our website. Continued use of the website following any update constitutes acceptance of the amended terms.", "نحتفظ بحق تحديث هذه الشروط والأحكام في أي وقت، وستنشر النسخة الحالية دائما على موقعنا. ويعد استمرار استخدام الموقع بعد أي تحديث بمثابة موافقة على الشروط المعدلة."),
        ],
      },
      {
        title: localized("Contact Us", "تواصل معنا", locale),
        blocks: [
          P("For any queries regarding this policy, please contact us:", "لأي استفسارات بخصوص هذه السياسة، يرجى التواصل معنا:"),
          LL([
            ["Email", contact.email, "البريد الإلكتروني", contact.email],
            ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
            ["Address", contact.address, "العنوان", contact.address],
          ]),
        ],
      },
    ],
  };
}

function privacy({ locale, contact }: Ctx): LegalTemplate {
  const { P, L, LL } = helpers(locale);
  return {
    title: localized("Privacy Policy", "سياسة الخصوصية", locale),
    badge: localized("Privacy Policy", "سياسة الخصوصية", locale),
    intro: localized(
      `${contact.legalEntity} is committed to protecting your personal data. Please review this Privacy Policy before using our website or placing an order with Amoonis Boutique.`,
      `تلتزم ${contact.legalEntity} بحماية بياناتك الشخصية. يرجى مراجعة سياسة الخصوصية هذه قبل استخدام موقعنا أو إتمام أي طلب مع أموونيس بوتيك.`,
      locale
    ),
    sections: [
      {
        title: localized("1. Introduction", "1. مقدمة", locale),
        blocks: [
          P(
            `${contact.legalEntity} ("we", "us", or "our") is committed to protecting your personal data in accordance with ${contact.dataProtectionLawName} and applicable regulations. This Privacy Policy explains how we collect, use, store, and protect your information when you visit or make a purchase on our website.`,
            `تلتزم ${contact.legalEntity} ("نحن" أو "لنا") بحماية بياناتك الشخصية بموجب ${contact.dataProtectionLawName} واللوائح المعمول بها. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وتخزيننا وحمايتنا لمعلوماتك عند زيارتك لموقعنا أو الشراء منه.`
          ),
        ],
      },
      {
        title: localized("2. Information We Collect", "2. المعلومات التي نجمعها", locale),
        blocks: [],
        subsections: [
          {
            title: localized("2.1 Information You Provide", "2.1 المعلومات التي تقدمها", locale),
            blocks: [
              L([
                ["Full name, delivery address, and contact details (phone number and email address)", "الاسم الكامل وعنوان التسليم وبيانات التواصل (رقم الهاتف والبريد الإلكتروني)"],
                ["Payment information processed securely through our payment gateway", "معلومات الدفع التي تتم معالجتها بأمان عبر بوابة الدفع الخاصة بنا"],
                ["Order details, preferences, and special instructions", "تفاصيل الطلب والتفضيلات والتعليمات الخاصة"],
                ["Communications you send us via email, WhatsApp, or our contact form", "المراسلات التي ترسلها إلينا عبر البريد الإلكتروني أو واتساب أو نموذج التواصل"],
              ]),
            ],
          },
          {
            title: localized("2.2 Information Collected Automatically", "2.2 المعلومات التي يتم جمعها تلقائيا", locale),
            blocks: [
              L([
                ["IP address, browser type, and device information", "عنوان IP ونوع المتصفح ومعلومات الجهاز"],
                ["Browsing behaviour, pages visited, and session duration via cookies", "سلوك التصفح والصفحات التي تمت زيارتها ومدة الجلسة عبر ملفات تعريف الارتباط"],
                ["Referral source and search terms used to find our website", "مصدر الإحالة ومصطلحات البحث المستخدمة للوصول إلى موقعنا"],
              ]),
            ],
          },
        ],
      },
      {
        title: localized("3. How We Use Your Information", "3. كيف نستخدم معلوماتك", locale),
        blocks: [
          P("We process your personal data for the following lawful purposes:", "نعالج بياناتك الشخصية للأغراض القانونية التالية:"),
          L([
            ["To process, fulfil, and deliver your orders", "لمعالجة طلباتك وتنفيذها وتوصيلها"],
            ["To send order confirmations, delivery updates, and customer support communications", "لإرسال تأكيدات الطلبات وتحديثات التسليم ومراسلات دعم العملاء"],
            ["To improve our website, products, and services", "لتحسين موقعنا ومنتجاتنا وخدماتنا"],
            [`To comply with legal obligations under ${contact.countryShort} law`, `للامتثال للالتزامات القانونية بموجب قوانين ${contact.countryName}`],
            ["To send you promotional offers and newsletters, where you have provided consent", "لإرسال العروض الترويجية والنشرات الإخبارية، في حال تقديمك للموافقة على ذلك"],
          ]),
        ],
      },
      {
        title: localized("4. Legal Basis for Processing", "4. الأساس القانوني للمعالجة", locale),
        blocks: [
          P(
            `We process your data on the basis of: (a) contractual necessity to fulfil your order; (b) your explicit consent for marketing communications; and (c) compliance with applicable legal obligations in ${contact.countryName}.`,
            `نعالج بياناتك استنادا إلى: (أ) الضرورة التعاقدية لتنفيذ طلبك؛ (ب) موافقتك الصريحة على المراسلات التسويقية؛ و(ج) الامتثال للالتزامات القانونية المعمول بها في ${contact.countryName}.`
          ),
        ],
      },
      {
        title: localized("5. Data Sharing", "5. مشاركة البيانات", locale),
        blocks: [
          P("We do not sell your personal data. We may share your information with:", "لا نبيع بياناتك الشخصية. وقد نشارك معلوماتك مع:"),
          L([
            ["Delivery and logistics partners solely for order fulfilment", "شركاء التوصيل والخدمات اللوجستية، حصريا لغرض تنفيذ الطلبات"],
            ["Payment processors operating under applicable security standards", "معالجي المدفوعات العاملين وفق معايير الأمان المعمول بها"],
            [`Government authorities when required by ${contact.countryShort} law`, `الجهات الحكومية عند الاقتضاء بموجب قوانين ${contact.countryName}`],
          ]),
        ],
      },
      {
        title: localized("6. Data Retention", "6. الاحتفاظ بالبيانات", locale),
        blocks: [
          P("We retain personal data for as long as necessary to fulfil the purposes described in this policy, and no longer than five (5) years following your last transaction with us, unless a longer period is required by law.", "نحتفظ بالبيانات الشخصية للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، وبما لا يتجاوز خمس (5) سنوات من تاريخ آخر معاملة لك معنا، ما لم يتطلب القانون مدة أطول."),
        ],
      },
      {
        title: localized("7. Your Rights", "7. حقوقك", locale),
        blocks: [
          P(`Under ${contact.countryShort} law, you have the right to:`, `بموجب قوانين ${contact.countryName}، يحق لك:`),
          L([
            ["Access the personal data we hold about you", "الاطلاع على البيانات الشخصية التي نحتفظ بها عنك"],
            ["Request correction of inaccurate or incomplete data", "طلب تصحيح البيانات غير الدقيقة أو غير المكتملة"],
            ["Request deletion of your personal data, subject to legal retention obligations", "طلب حذف بياناتك الشخصية، مع مراعاة التزامات الاحتفاظ القانونية"],
            ["Withdraw consent for marketing communications at any time", "سحب موافقتك على المراسلات التسويقية في أي وقت"],
            [`Lodge a complaint with the ${contact.dataProtectionAuthority}`, `تقديم شكوى إلى ${contact.dataProtectionAuthority}`],
          ]),
          P(`To exercise any of these rights, contact us at ${contact.email} or via WhatsApp at ${contact.whatsappNumber}.`, `لممارسة أي من هذه الحقوق، تواصل معنا عبر ${contact.email} أو واتساب على ${contact.whatsappNumber}.`),
        ],
      },
      {
        title: localized("8. Cookies", "8. ملفات تعريف الارتباط", locale),
        blocks: [
          P("Our website uses cookies to enhance your browsing experience and analyse site traffic. You may manage your cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.", "يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة الزيارات. ويمكنك إدارة تفضيلاتك الخاصة بملفات تعريف الارتباط من إعدادات متصفحك. علما بأن تعطيل بعض هذه الملفات قد يؤثر على وظائف الموقع."),
        ],
      },
      {
        title: localized("9. Data Security", "9. أمان البيانات", locale),
        blocks: [
          P(`We implement appropriate technical and organisational measures to safeguard your personal data against unauthorised access, loss, or disclosure, in accordance with Article 16 of the ${contact.dataProtectionLawName}.`, `نطبق التدابير التقنية والتنظيمية المناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الفقدان أو الإفصاح، وذلك بموجب المادة 16 من ${contact.dataProtectionLawName}.`),
        ],
      },
      {
        title: localized("10. Updates to This Policy", "10. تحديثات هذه السياسة", locale),
        blocks: [
          P("We may update this Privacy Policy periodically. Changes will be published on our website with an updated effective date. Continued use of our website after changes constitutes acceptance of the revised policy.", "قد نقوم بتحديث سياسة الخصوصية هذه بشكل دوري. وسيتم نشر أي تغييرات على موقعنا مع تحديث تاريخ السريان. ويعد استمرار استخدام موقعنا بعد إجراء أي تغييرات بمثابة موافقة على السياسة المعدلة."),
        ],
      },
      {
        title: localized("11. Account Deletion and Data Deletion", "11. حذف الحساب والبيانات", locale),
        blocks: [
          P("Registered customers may request deletion of their website account and associated personal data at any time.", "يمكن للعملاء المسجلين طلب حذف حسابهم على الموقع وبياناتهم الشخصية المرتبطة به في أي وقت."),
          P(`You may request account deletion by contacting us at ${contact.email} or via WhatsApp at ${contact.whatsappNumber}.`, `يمكنك طلب حذف حسابك من خلال التواصل معنا عبر ${contact.email} أو واتساب على ${contact.whatsappNumber}.`),
          P("After verification, we will delete or anonymise your account data, except where certain information must be retained for legal, tax, payment, order, or regulatory purposes.", "بعد التحقق، سنقوم بحذف بيانات حسابك أو إخفاء هويتها، باستثناء المعلومات التي يجب الاحتفاظ بها لأغراض قانونية أو ضريبية أو متعلقة بالدفع أو الطلبات أو تنظيمية."),
        ],
      },
      {
        title: localized("12. Contact Us", "12. تواصل معنا", locale),
        blocks: [
          P("For privacy-related inquiries, please contact Amoonis Boutique:", "لأي استفسارات متعلقة بالخصوصية، يرجى التواصل مع أموونيس بوتيك:"),
          LL([
            ["Email", contact.email, "البريد الإلكتروني", contact.email],
            ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
            ["Address", contact.address, "العنوان", contact.address],
          ]),
        ],
      },
    ],
  };
}

function refundPolicy({ locale, contact }: Ctx): LegalTemplate {
  const { P, L, LL } = helpers(locale);
  return {
    title: localized("Refund & Return Policy", "سياسة الاسترجاع والاستبدال", locale),
    badge: localized("Refund & Return Policy", "سياسة الاسترجاع والاستبدال", locale),
    intro: localized(
      `This policy is in accordance with ${contact.consumerProtectionLawName} and its executive regulations.`,
      `تتوافق هذه السياسة مع ${contact.consumerProtectionLawName} ولوائحه التنفيذية.`,
      locale
    ),
    sections: [
      {
        title: localized("1. Our Commitment", "1. التزامنا", locale),
        blocks: [
          P(`At ${contact.legalEntity}, we take great care in preparing and delivering every order. If your order arrives damaged, incorrect, or defective, we will make it right.`, `في ${contact.legalEntity}، نولي عناية كبيرة بتجهيز وتوصيل كل طلب. وإذا وصل طلبك تالفا أو غير مطابق أو معيبا، فسنعمل على تصحيح الأمر.`),
        ],
      },
      {
        title: localized("2. Eligibility for Returns & Refunds", "2. أهلية الاسترجاع والاسترداد", locale),
        blocks: [
          P("You are eligible for a return or refund in the following circumstances:", "يحق لك الاسترجاع أو الاسترداد في الحالات التالية:"),
          L([
            ["The product received is materially different from what was ordered", "المنتج المستلم مختلف جوهريا عما تم طلبه"],
            ["The product arrives in a damaged or defective condition", "وصل المنتج تالفا أو بحالة معيبة"],
            ["The order was not delivered within the agreed timeframe due to our error", "لم يسلم الطلب ضمن المدة المتفق عليها بسبب خطأ من جانبنا"],
            ["The product poses a safety concern", "يشكل المنتج مصدر قلق يتعلق بالسلامة"],
          ]),
        ],
      },
      {
        title: localized("3. Non-Returnable & Non-Refundable Items", "3. المنتجات غير القابلة للإرجاع أو الاسترداد", locale),
        blocks: [
          P("Due to the perishable and personalised nature of our products, the following cannot be returned or refunded:", "نظرا للطبيعة القابلة للتلف والمخصصة لمنتجاتنا، لا يمكن إرجاع أو استرداد قيمة ما يلي:"),
          L([
            ["Fresh flowers and floral arrangements (perishable goods)", "الزهور الطازجة والتنسيقات الزهرية (سلع قابلة للتلف)"],
            ["Personalised and custom-made items, once production has begun", "المنتجات المخصصة والمصنوعة حسب الطلب، بعد بدء الإنتاج"],
            ["Gift boxes where packaging has been opened or items removed", "صناديق الهدايا التي تم فتح تغليفها أو إزالة محتوياتها"],
            ["Products damaged due to customer mishandling after delivery", "المنتجات التي تلفت بسبب سوء استخدام العميل بعد التسليم"],
            ["Items where the return request is made more than 24 hours after delivery", "الحالات التي يقدم فيها طلب الإرجاع بعد مرور أكثر من 24 ساعة على التسليم"],
          ]),
        ],
      },
      {
        title: localized("4. How to Request a Return or Refund", "4. كيفية طلب الإرجاع أو الاسترداد", locale),
        blocks: [
          P("To initiate a return or refund request:", "لبدء طلب الإرجاع أو الاسترداد:"),
          L([
            [`Contact us within 24 hours of receiving your order at ${contact.email} or via WhatsApp at ${contact.whatsappNumber}`, `تواصل معنا خلال 24 ساعة من استلام طلبك عبر ${contact.email} أو واتساب على ${contact.whatsappNumber}`],
            ["Provide your order number, a description of the issue, and clear photographs of the product and packaging", "قدم رقم طلبك ووصفا للمشكلة وصورا واضحة للمنتج والتغليف"],
            ["Our customer care team will review your request within one (1) business day", "سيراجع فريق خدمة العملاء لدينا طلبك خلال يوم عمل واحد (1)"],
            ["Approved returns must be dispatched within 48 hours of approval", "يجب شحن المرتجعات المعتمدة خلال 48 ساعة من الموافقة"],
          ]),
        ],
      },
      {
        title: localized("5. Refund Processing", "5. معالجة المبالغ المستردة", locale),
        blocks: [
          L([
            ["Approved refunds will be processed to the original payment method within 7 to 14 business days, depending on your bank or payment provider.", "تتم معالجة المبالغ المستردة المعتمدة إلى طريقة الدفع الأصلية خلال 7 إلى 14 يوم عمل، حسب البنك أو مزود الدفع."],
            ["Where a full refund is not applicable, we may offer a store credit or replacement product of equal value at our discretion.", "في حال عدم انطباق الاسترداد الكامل، يجوز لنا تقديم رصيد للمتجر أو منتج بديل بقيمة معادلة وفقا لتقديرنا."],
            ["Shipping charges are non-refundable unless the return is due to our error.", "رسوم الشحن غير قابلة للاسترداد ما لم يكن الإرجاع بسبب خطأ من جانبنا."],
          ]),
        ],
      },
      {
        title: localized("6. Order Cancellations", "6. إلغاء الطلبات", locale),
        blocks: [
          L([
            ["Orders may be cancelled within two (2) hours of placement, provided production has not yet commenced.", "يمكن إلغاء الطلبات خلال ساعتين (2) من تقديمها، شريطة عدم بدء الإنتاج بعد."],
            ["Personalised orders cannot be cancelled once customisation has begun.", "لا يمكن إلغاء الطلبات المخصصة بعد بدء التخصيص."],
            [`To cancel an order, contact us immediately via WhatsApp at ${contact.whatsappNumber}.`, `لإلغاء طلب، تواصل معنا فورا عبر واتساب على ${contact.whatsappNumber}.`],
            ["Cancellations approved before dispatch will receive a full refund.", "تحصل حالات الإلغاء المعتمدة قبل الشحن على استرداد كامل للمبلغ."],
          ]),
        ],
      },
      {
        title: localized("7. Exchanges", "7. الاستبدال", locale),
        blocks: [
          P("We do not offer product exchanges. If you have received a defective or incorrect item, please follow the return process outlined above, and we will provide a replacement or refund accordingly.", "لا نقدم خدمة استبدال المنتجات. وفي حال استلامك منتجا معيبا أو غير مطابق، يرجى اتباع إجراء الإرجاع الموضح أعلاه، وسنوفر لك بديلا أو استردادا وفقا لذلك."),
        ],
      },
      {
        title: localized("8. Consumer Rights", "8. حقوق المستهلك", locale),
        blocks: [
          P(`Nothing in this policy limits or excludes your rights as a consumer under ${contact.consumerProtectionLawName} and the applicable laws. In the event of a dispute, you may also refer your complaint to the ${contact.consumerProtectionAuthority}.`, `لا يحد أي بند في هذه السياسة من حقوقك كمستهلك بموجب ${contact.consumerProtectionLawName} والقوانين المعمول بها الأخرى، أو يستثنيها. وفي حال وجود نزاع، يمكنك أيضا إحالة شكواك إلى ${contact.consumerProtectionAuthority}.`),
        ],
      },
      {
        title: localized("Contact Us", "تواصل معنا", locale),
        blocks: [
          P("For any return or refund enquiries:", "لأي استفسارات تتعلق بالإرجاع أو الاسترداد:"),
          LL([
            ["Email", contact.email, "البريد الإلكتروني", contact.email],
            ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
            ["Hours", contact.hours, "أوقات العمل", contact.hours],
          ]),
        ],
      },
    ],
  };
}

function shippingPolicy({ locale, contact, vat }: Ctx): LegalTemplate {
  const { P, L, LL } = helpers(locale);
  return {
    title: localized("Shipping Policy", "سياسة الشحن", locale),
    badge: localized("Shipping Policy", "سياسة الشحن", locale),
    intro: localized(
      `Learn how ${contact.legalEntity} delivers orders across ${contact.countryName}, including delivery options, charges, and what to expect on delivery day.`,
      `تعرف على كيفية توصيل ${contact.legalEntity} للطلبات داخل دولة ${contact.countryName}، بما في ذلك خيارات التوصيل والرسوم وما يمكن توقعه في يوم التسليم.`,
      locale
    ),
    sections: [
      {
        title: localized("1. Delivery Coverage", "1. نطاق التوصيل", locale),
        blocks: [P(`${contact.legalEntity} delivers across ${contact.countryName}. We currently do not offer international shipping.`, `تقوم ${contact.legalEntity} بالتوصيل داخل دولة ${contact.countryName}، ولا نقدم حاليا خدمة الشحن الدولي.`)],
      },
      {
        title: localized("2. Delivery Options & Timeframes", "2. خيارات ومدد التوصيل", locale),
        blocks: [],
        subsections: [
          {
            title: localized("2.1 Same-Day Delivery", "2.1 التوصيل في نفس اليوم", locale),
            blocks: [L([["Subject to availability and delivery area", "يخضع لمدى التوفر ومنطقة التوصيل"], ["Same-day delivery charges apply and are displayed at checkout", "تطبق رسوم التوصيل في نفس اليوم وتظهر عند إتمام الطلب"]])],
          },
          {
            title: localized("2.2 Standard Delivery", "2.2 التوصيل العادي", locale),
            blocks: [L([["Delivered within 1–3 business days from the date of order confirmation", "يتم التوصيل خلال 1 إلى 3 أيام عمل من تاريخ تأكيد الطلب"], ["Exact delivery windows will be communicated via WhatsApp or SMS", "يتم إبلاغ العميل بمواعيد التسليم الدقيقة عبر واتساب أو رسالة نصية"]])],
          },
          {
            title: localized("2.3 Scheduled Delivery", "2.3 التوصيل المجدول", locale),
            blocks: [L([["You may select a preferred delivery date and time slot at checkout", "يمكنك اختيار التاريخ والوقت المفضلين للتوصيل عند إتمام الطلب"], ["We will make reasonable efforts to honour your selected slot; however, delivery times are estimates and cannot be guaranteed", "نبذل جهودا معقولة للالتزام بالموعد الذي اخترته، إلا أن أوقات التسليم تقديرية ولا يمكن ضمانها"]])],
          },
        ],
      },
      {
        title: localized("3. Delivery Charges", "3. رسوم التوصيل", locale),
        blocks: [P("Same-day delivery and express services may incur additional charges.", "قد تترتب رسوم إضافية على خدمات التوصيل في نفس اليوم والتوصيل السريع.")],
      },
      {
        title: localized("4. Product Prices & VAT", "4. أسعار المنتجات وضريبة القيمة المضافة", locale),
        blocks: [P(...shippingVatClause(vat, contact.currencyDisplayName, contact.vatLawName))],
      },
      {
        title: localized("5. Delivery Process", "5. إجراءات التسليم", locale),
        blocks: [
          L([
            ["A confirmation message will be sent to you once your order has been dispatched", "ترسل إليك رسالة تأكيد فور شحن طلبك"],
            ["Our delivery team will contact you prior to arrival", "سيتواصل معك فريق التوصيل قبل الوصول"],
            ["Please ensure someone is available to receive the order at the specified delivery address", "يرجى التأكد من وجود شخص لاستلام الطلب في عنوان التسليم المحدد"],
            ["If a delivery attempt is unsuccessful due to the recipient's unavailability, a second attempt will be arranged; additional charges may apply", "في حال تعذر التسليم بسبب عدم توفر المستلم، سيتم ترتيب محاولة ثانية، وقد تطبق رسوم إضافية"],
          ]),
        ],
      },
      {
        title: localized("6. Perishable Items", "6. المنتجات القابلة للتلف", locale),
        blocks: [
          P("Floral arrangements and perishable gift items require timely receipt upon delivery. We are not responsible for deterioration of perishable products due to:", "تتطلب التنسيقات الزهرية ومنتجات الهدايا القابلة للتلف استلاما في وقته عند التسليم. ولا نتحمل مسؤولية تلف المنتجات القابلة للتلف الناتج عن:"),
          L([
            ["Failed delivery attempts where the recipient was unavailable", "محاولات التسليم الفاشلة بسبب عدم توفر المستلم"],
            ["Incorrect delivery address provided by the customer", "عنوان تسليم غير صحيح مقدم من العميل"],
            ["Delays caused by circumstances beyond our control", "التأخيرات الناجمة عن ظروف خارجة عن سيطرتنا"],
          ]),
        ],
      },
      {
        title: localized("7. Order Tracking", "7. تتبع الطلب", locale),
        blocks: [P(`You can track your order status by contacting our customer care team via WhatsApp at ${contact.whatsappNumber}.`, `يمكنك متابعة حالة طلبك من خلال التواصل مع فريق خدمة العملاء عبر واتساب على ${contact.whatsappNumber}.`)],
      },
      {
        title: localized("8. Delivery Restrictions", "8. قيود التوصيل", locale),
        blocks: [
          L([
            ["Deliveries may be subject to access restrictions in certain areas (e.g., gated communities, military zones). The customer is responsible for providing accurate and accessible delivery details.", "قد تخضع عمليات التسليم لقيود الوصول في بعض المناطق (مثل المجمعات السكنية المغلقة أو المناطق العسكرية)، ويتحمل العميل مسؤولية تقديم تفاصيل تسليم دقيقة وقابلة للوصول إليها."],
            ["We reserve the right to decline delivery to locations that are inaccessible or pose safety concerns.", "نحتفظ بحق رفض التسليم إلى المواقع التي يتعذر الوصول إليها أو التي تشكل مخاوف تتعلق بالسلامة."],
          ]),
        ],
      },
      {
        title: localized("9. Failed or Delayed Deliveries", "9. حالات التسليم الفاشلة أو المتأخرة", locale),
        blocks: [P(`In the event of a delivery failure caused by us (not attributable to customer error or force majeure), we will re-deliver at no additional charge or issue a full refund at the customer's election, in accordance with ${contact.consumerProtectionLawName}.`, `في حال حدوث فشل في التسليم بسبب خطأ من جانبنا (وليس بسبب خطأ من العميل أو ظرف قاهر)، سنقوم بإعادة التسليم دون أي رسوم إضافية أو نصدر استردادا كاملا حسب اختيار العميل، بموجب ${contact.consumerProtectionLawName}.`)],
      },
      {
        title: localized("10. Force Majeure", "10. القوة القاهرة", locale),
        blocks: [P("We shall not be liable for delivery delays or failures caused by circumstances beyond our reasonable control, including but not limited to extreme weather, road closures, public emergencies, or government restrictions.", "لا نتحمل مسؤولية تأخير أو فشل التسليم الناتج عن ظروف خارجة عن سيطرتنا المعقولة، بما في ذلك على سبيل المثال لا الحصر الظروف الجوية القاسية أو إغلاق الطرق أو حالات الطوارئ العامة أو القيود الحكومية.")],
      },
      {
        title: localized("11. Contact Us", "11. تواصل معنا", locale),
        blocks: [
          P("For delivery enquiries or special delivery requests:", "لأي استفسارات تتعلق بالتوصيل أو طلبات التسليم الخاصة:"),
          LL([
            ["Email", contact.email, "البريد الإلكتروني", contact.email],
            ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
            ["Hours", contact.hours, "أوقات العمل", contact.hours],
          ]),
        ],
      },
    ],
  };
}

function productDisclaimer({ locale, contact }: Ctx): LegalTemplate {
  const { P, L, LL } = helpers(locale);
  return {
    title: localized("Product Disclaimer", "إخلاء مسؤولية المنتج", locale),
    badge: localized("Product Disclaimer", "إخلاء مسؤولية المنتج", locale),
    intro: localized(
      `Please read this Product Disclaimer to understand how we present our products and the limitations that apply to perishable, personalised, and gift items sold by ${contact.legalEntity}.`,
      `يرجى قراءة إخلاء مسؤولية المنتج هذا لفهم كيفية عرضنا لمنتجاتنا والقيود التي تنطبق على المنتجات القابلة للتلف والمخصصة والهدايا التي تبيعها ${contact.legalEntity}.`,
      locale
    ),
    sections: [
      {
        title: localized("1. Product Representations", "1. عرض المنتجات", locale),
        blocks: [
          P(`${contact.legalEntity} takes pride in presenting our products as accurately as possible. However, you acknowledge that:`, `تفخر ${contact.legalEntity} بعرض منتجاتنا بأكبر قدر ممكن من الدقة. ومع ذلك، فإنك تقر بما يلي:`),
          L([
            ["Product images on our website are for illustrative purposes only. Actual products may vary slightly in colour, size, arrangement, or presentation due to the handcrafted and seasonal nature of our items.", "صور المنتجات على موقعنا هي لأغراض توضيحية فقط. وقد تختلف المنتجات الفعلية قليلا في اللون أو الحجم أو التنسيق أو الشكل النهائي نظرا للطبيعة اليدوية والموسمية لمنتجاتنا."],
            ["Flower varieties and colours are subject to seasonal availability. We reserve the right to substitute flowers or components of equal or greater value while maintaining the overall aesthetic of the arrangement.", "تخضع أنواع وألوان الزهور لمدى التوفر الموسمي. ونحتفظ بحق استبدال الزهور أو المكونات بأخرى ذات قيمة مساوية أو أعلى مع الحفاظ على الطابع الجمالي العام للتنسيق."],
            ["Colour reproduction on digital screens may differ from actual product colours due to monitor settings and display calibration.", "قد يختلف ظهور الألوان على الشاشات الرقمية عن الألوان الفعلية للمنتج بسبب إعدادات الشاشة ومعايرة العرض."],
          ]),
        ],
      },
      {
        title: localized("2. Perishable Products", "2. المنتجات القابلة للتلف", locale),
        blocks: [
          P("Our floral arrangements and fresh products are perishable. By purchasing such items, you acknowledge that:", "تنسيقاتنا الزهرية ومنتجاتنا الطازجة قابلة للتلف. وبشرائك لهذه المنتجات، فإنك تقر بما يلي:"),
          L([
            ["Fresh flowers have a natural lifespan and their longevity depends on environmental conditions, care, and handling after delivery.", "للزهور الطازجة عمر افتراضي طبيعي، وتعتمد مدة بقائها على الظروف البيئية والعناية والتعامل معها بعد التسليم."],
            ["We are not liable for the deterioration of flowers or perishable items beyond our reasonable control once delivered.", "لا نتحمل مسؤولية تلف الزهور أو المنتجات القابلة للتلف بعد التسليم لأسباب خارجة عن سيطرتنا المعقولة."],
            ["Care instructions, where provided, should be followed to extend the life of your product.", "يرجى اتباع تعليمات العناية، عند توفرها، لإطالة عمر المنتج."],
          ]),
        ],
      },
      {
        title: localized("3. Personalised & Custom Products", "3. المنتجات المخصصة والمصممة حسب الطلب", locale),
        blocks: [
          L([
            ["Personalised items are produced based on information provided by the customer. We accept no responsibility for errors in personalisation arising from inaccurate customer-submitted details.", "تنتج العناصر المخصصة بناء على المعلومات التي يقدمها العميل، ولا نتحمل أي مسؤولية عن أخطاء التخصيص الناتجة عن معلومات غير دقيقة مقدمة من العميل."],
            ["Minor variations in font style, sizing, or positioning of personalised elements may occur.", "قد تحدث اختلافات طفيفة في نوع الخط أو الحجم أو موضع العناصر المخصصة."],
            ["Custom and personalised products cannot be returned unless they are defective or materially different from what was agreed.", "لا يمكن إرجاع المنتجات المخصصة والمصممة حسب الطلب إلا إذا كانت معيبة أو مختلفة جوهريا عما تم الاتفاق عليه."],
          ]),
        ],
      },
      {
        title: localized("4. Baby & Children's Products", "4. منتجات الأطفال والرضع", locale),
        blocks: [
          P("Our newborn and children's gift products are intended as gifts for adult recipients to present to children. Please note:", "منتجات هدايا المواليد والأطفال لدينا مخصصة كهدايا يقدمها البالغون للأطفال. يرجى ملاحظة ما يلي:"),
          L([
            [`All baby products included in our gift boxes comply with applicable safety standards in ${contact.countryName} where required.`, `تتوافق جميع منتجات الأطفال المدرجة في صناديق الهدايا لدينا مع معايير السلامة المعمول بها في ${contact.countryName} حيثما يلزم.`],
            ["Items such as balloons and small accessories may present a choking or suffocation hazard. Keep out of reach of children under 3 years of age.", "قد تشكل عناصر مثل البالونات والإكسسوارات الصغيرة خطر اختناق. يرجى إبقاؤها بعيدا عن متناول الأطفال دون سن 3 سنوات."],
            ["Adult supervision is required when presenting balloon gifts to infants and young children.", "يلزم إشراف شخص بالغ عند تقديم هدايا البالونات للرضع وصغار الأطفال."],
            ["Amoonis Boutique is not liable for any injury resulting from misuse or failure to follow safety guidelines.", "لا تتحمل أموونيس بوتيك مسؤولية أي إصابة ناتجة عن سوء الاستخدام أو عدم اتباع إرشادات السلامة."],
          ]),
        ],
      },
      {
        title: localized("5. Beauty & Personal Care Products", "5. منتجات التجميل والعناية الشخصية", locale),
        blocks: [
          P("Gift boxes containing beauty, skincare, or personal care products are curated from reputable suppliers. However:", "يتم اختيار صناديق الهدايا التي تحتوي على منتجات تجميل أو عناية بالبشرة أو عناية شخصية من موردين موثوقين. مع ذلك:"),
          L([
            ["We recommend that recipients check product ingredient lists for potential allergens before use.", "نوصي بأن يتحقق مستلمو الهدايا من قائمة مكونات المنتج بحثا عن أي مسببات حساسية محتملة قبل الاستخدام."],
            ["We are not liable for adverse reactions arising from individual sensitivities or allergies.", "لا نتحمل مسؤولية ردود الفعل التحسسية الناتجة عن حساسيات فردية."],
            ["Products included in gift boxes are intended for personal use and should be used in accordance with their individual packaging instructions.", "المنتجات المدرجة في صناديق الهدايا مخصصة للاستخدام الشخصي، ويجب استخدامها وفقا لتعليمات التغليف الخاصة بكل منتج."],
          ]),
        ],
      },
      {
        title: localized("6. Grooming & Men's Products", "6. منتجات العناية والحلاقة للرجال", locale),
        blocks: [P("Products included in men's gift cups and grooming sets are for personal use. Please follow the usage instructions provided by the respective product manufacturer.", "المنتجات المدرجة في أكواب الهدايا ومجموعات العناية الرجالية مخصصة للاستخدام الشخصي. يرجى اتباع تعليمات الاستخدام المقدمة من الشركة المصنعة لكل منتج.")],
      },
      {
        title: localized("7. General Limitation", "7. تحديد عام للمسؤولية", locale),
        blocks: [P(`${contact.legalEntity} makes no warranties, express or implied, beyond those required by ${contact.consumerProtectionLawName} and the applicable laws. Our products are sold as gifts and are not intended for medical, therapeutic, or professional use unless explicitly stated.`, `لا تقدم ${contact.legalEntity} أي ضمانات، صريحة أو ضمنية، تتجاوز ما يقتضيه ${contact.consumerProtectionLawName} والقوانين المعمول بها الأخرى. وتباع منتجاتنا كهدايا وليست مخصصة للاستخدام الطبي أو العلاجي أو المهني ما لم يذكر ذلك صراحة.`)],
      },
      {
        title: localized("8. Regulatory Compliance", "8. الامتثال التنظيمي", locale),
        blocks: [P(`All products sold by Amoonis Boutique are sourced from suppliers who comply with applicable laws and standards in ${contact.countryName}. We are committed to consumer safety and adhere to the requirements of the ${contact.standardsAuthority} where applicable.`, `يتم توريد جميع المنتجات التي تبيعها أموونيس بوتيك من موردين يلتزمون بالقوانين والمعايير المعمول بها في ${contact.countryName}. ونحن ملتزمون بسلامة المستهلك ونتقيد بمتطلبات ${contact.standardsAuthority} حيثما ينطبق ذلك.`)],
      },
      {
        title: localized("9. Updates", "9. التحديثات", locale),
        blocks: [P("This Product Disclaimer may be updated periodically. The current version will always be available on our website.", "قد يتم تحديث إخلاء المسؤولية هذا بشكل دوري. وستكون النسخة الحالية متاحة دائما على موقعنا الإلكتروني.")],
      },
      {
        title: localized("Contact Us", "تواصل معنا", locale),
        blocks: [
          P("For any queries regarding this policy, please contact us:", "لأي استفسارات بخصوص هذه السياسة، يرجى التواصل معنا:"),
          LL([
            ["Email", contact.email, "البريد الإلكتروني", contact.email],
            ["WhatsApp", contact.whatsappNumber, "واتساب", contact.whatsappNumber],
            ["Address", contact.address, "العنوان", contact.address],
          ]),
        ],
      },
    ],
  };
}

const BUILDERS: Record<LegalPageSlug, (ctx: Ctx) => LegalTemplate> = {
  terms,
  privacy,
  "refund-policy": refundPolicy,
  "shipping-policy": shippingPolicy,
  "product-disclaimer": productDisclaimer,
};

/** Build the default template (title/intro/sections) for a slug + resolved context. */
export function getLegalTemplate(slug: LegalPageSlug, ctx: Ctx): LegalTemplate {
  return BUILDERS[slug](ctx);
}

// ---- LegalSection[] -> sanitized-friendly HTML --------------------------------

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function blocksToHtml(blocks: LegalBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "p") return `<p>${esc(b.text)}</p>`;
      const items = b.items
        .map((it) =>
          typeof it === "string"
            ? `<li>${esc(it)}</li>`
            : `<li><strong>${esc(it.label ?? "")}: </strong>${esc(it.text)}</li>`
        )
        .join("");
      return `<ul>${items}</ul>`;
    })
    .join("\n");
}

/** Serialize LegalSection[] to the HTML the rich-text editor + sanitizer accept
 *  (h2/h3/p/ul/li/strong). Used for the "Load default template" seed. */
export function legalSectionsToHtml(sections: LegalSection[]): string {
  return sections
    .map((s) => {
      let html = `<h2>${esc(s.title)}</h2>\n${blocksToHtml(s.blocks)}`;
      if (s.subsections) {
        for (const sub of s.subsections) {
          html += `\n<h3>${esc(sub.title)}</h3>\n${blocksToHtml(sub.blocks)}`;
        }
      }
      return html;
    })
    .join("\n");
}

/** Convenience: default HTML for a slug in one language. */
export function getLegalTemplateHtml(slug: LegalPageSlug, ctx: Ctx): { title: string; html: string } {
  const tpl = getLegalTemplate(slug, ctx);
  return { title: tpl.title, html: legalSectionsToHtml(tpl.sections) };
}
