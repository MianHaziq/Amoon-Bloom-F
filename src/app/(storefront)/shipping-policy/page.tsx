import {
  LegalPageLayout,
  type LegalBlock,
  type LegalSection,
} from "@/components/legal/LegalPageLayout";
import { getServerLocale } from "@/i18n/server";
import { localized } from "@/i18n";
import type { Locale } from "@/store/slices/ui.slice";

export const metadata = { title: "Shipping Policy" };

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
      title: localized("1. Delivery Coverage", "1. نطاق التوصيل", locale),
      blocks: [
        P(
          "Amoon Bloom Trading LLC delivers across the United Arab Emirates. We currently do not offer international shipping.",
          "تقوم أمون بلوم للتجارة ذ.م.م بالتوصيل داخل دولة الإمارات العربية المتحدة، ولا نقدّم حاليًا خدمة الشحن الدولي."
        ),
      ],
    },
    {
      title: localized(
        "2. Delivery Options & Timeframes",
        "2. خيارات ومدد التوصيل",
        locale
      ),
      blocks: [],
      subsections: [
        {
          title: localized("2.1 Same-Day Delivery", "2.1 التوصيل في نفس اليوم", locale),
          blocks: [
            L([
              [
                "Subject to availability and delivery area",
                "يخضع لمدى التوفر ومنطقة التوصيل",
              ],
              [
                "Same-day delivery charges apply and are displayed at checkout",
                "تُطبَّق رسوم التوصيل في نفس اليوم وتظهر عند إتمام الطلب",
              ],
            ]),
          ],
        },
        {
          title: localized("2.2 Standard Delivery", "2.2 التوصيل العادي", locale),
          blocks: [
            L([
              [
                "Delivered within 1–3 business days from the date of order confirmation",
                "يتم التوصيل خلال 1 إلى 3 أيام عمل من تاريخ تأكيد الطلب",
              ],
              [
                "Exact delivery windows will be communicated via WhatsApp or SMS",
                "يتم إبلاغ العميل بمواعيد التسليم الدقيقة عبر واتساب أو رسالة نصية",
              ],
            ]),
          ],
        },
        {
          title: localized("2.3 Scheduled Delivery", "2.3 التوصيل المجدول", locale),
          blocks: [
            L([
              [
                "You may select a preferred delivery date and time slot at checkout",
                "يمكنك اختيار التاريخ والوقت المفضلين للتوصيل عند إتمام الطلب",
              ],
              [
                "We will make reasonable efforts to honour your selected slot; however, delivery times are estimates and cannot be guaranteed",
                "نبذل جهودًا معقولة للالتزام بالموعد الذي اخترته، إلا أن أوقات التسليم تقديرية ولا يمكن ضمانها",
              ],
            ]),
          ],
        },
      ],
    },
    {
      title: localized("3. Delivery Charges", "3. رسوم التوصيل", locale),
      blocks: [
        P(
          "Same-day delivery and express services may incur additional charges.",
          "قد تترتب رسوم إضافية على خدمات التوصيل في نفس اليوم والتوصيل السريع."
        ),
      ],
    },
    {
      title: localized("4. Delivery Process", "4. إجراءات التسليم", locale),
      blocks: [
        L([
          [
            "A confirmation message will be sent to you once your order has been dispatched",
            "تُرسل إليك رسالة تأكيد فور شحن طلبك",
          ],
          [
            "Our delivery team will contact you prior to arrival",
            "سيتواصل معك فريق التوصيل قبل الوصول",
          ],
          [
            "Please ensure someone is available to receive the order at the specified delivery address",
            "يُرجى التأكد من وجود شخص لاستلام الطلب في عنوان التسليم المحدد",
          ],
          [
            "If a delivery attempt is unsuccessful due to the recipient's unavailability, a second attempt will be arranged; additional charges may apply",
            "في حال تعذّر التسليم بسبب عدم توفر المستلم، سيتم ترتيب محاولة ثانية، وقد تُطبَّق رسوم إضافية",
          ],
        ]),
      ],
    },
    {
      title: localized("5. Perishable Items", "5. المنتجات القابلة للتلف", locale),
      blocks: [
        P(
          "Floral arrangements and perishable gift items require timely receipt upon delivery. We are not responsible for deterioration of perishable products due to:",
          "تتطلب التنسيقات الزهرية ومنتجات الهدايا القابلة للتلف استلامًا في وقته عند التسليم. ولا نتحمل مسؤولية تلف المنتجات القابلة للتلف الناتج عن:"
        ),
        L([
          [
            "Failed delivery attempts where the recipient was unavailable",
            "محاولات التسليم الفاشلة بسبب عدم توفر المستلم",
          ],
          [
            "Incorrect delivery address provided by the customer",
            "عنوان تسليم غير صحيح مقدَّم من العميل",
          ],
          [
            "Delays caused by circumstances beyond our control",
            "التأخيرات الناجمة عن ظروف خارجة عن سيطرتنا",
          ],
        ]),
      ],
    },
    {
      title: localized("6. Order Tracking", "6. تتبع الطلب", locale),
      blocks: [
        P(
          "You can track your order status by contacting our customer care team via WhatsApp at +971 50 345 6793.",
          "يمكنك متابعة حالة طلبك من خلال التواصل مع فريق خدمة العملاء عبر واتساب على 6793 345 50 971+."
        ),
      ],
    },
    {
      title: localized("7. Delivery Restrictions", "7. قيود التوصيل", locale),
      blocks: [
        L([
          [
            "Deliveries may be subject to access restrictions in certain areas (e.g., gated communities, military zones). The customer is responsible for providing accurate and accessible delivery details.",
            "قد تخضع عمليات التسليم لقيود الوصول في بعض المناطق (مثل المجمعات السكنية المغلقة أو المناطق العسكرية)، ويتحمل العميل مسؤولية تقديم تفاصيل تسليم دقيقة وقابلة للوصول إليها.",
          ],
          [
            "We reserve the right to decline delivery to locations that are inaccessible or pose safety concerns.",
            "نحتفظ بحق رفض التسليم إلى المواقع التي يتعذر الوصول إليها أو التي تشكّل مخاوف تتعلق بالسلامة.",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "8. Failed or Delayed Deliveries",
        "8. حالات التسليم الفاشلة أو المتأخرة",
        locale
      ),
      blocks: [
        P(
          "In the event of a delivery failure caused by us (not attributable to customer error or force majeure), we will re-deliver at no additional charge or issue a full refund at the customer's election, in accordance with UAE Consumer Protection Law.",
          "في حال حدوث فشل في التسليم بسبب خطأ من جانبنا (وليس بسبب خطأ من العميل أو ظرف قاهر)، سنقوم بإعادة التسليم دون أي رسوم إضافية أو نصدر استردادًا كاملًا حسب اختيار العميل، وفقًا لقانون حماية المستهلك الإماراتي."
        ),
      ],
    },
    {
      title: localized("9. Force Majeure", "9. القوة القاهرة", locale),
      blocks: [
        P(
          "We shall not be liable for delivery delays or failures caused by circumstances beyond our reasonable control, including but not limited to extreme weather, road closures, public emergencies, or government restrictions.",
          "لا نتحمل مسؤولية تأخير أو فشل التسليم الناتج عن ظروف خارجة عن سيطرتنا المعقولة، بما في ذلك على سبيل المثال لا الحصر الظروف الجوية القاسية أو إغلاق الطرق أو حالات الطوارئ العامة أو القيود الحكومية."
        ),
      ],
    },
    {
      title: localized("10. Contact Us", "10. تواصل معنا", locale),
      blocks: [
        P(
          "For delivery enquiries or special delivery requests:",
          "لأي استفسارات تتعلق بالتوصيل أو طلبات التسليم الخاصة:"
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
            "Hours",
            "10:00 AM – 12:00 AM (Dubai Time)",
            "أوقات العمل",
            "10:00 صباحًا – 12:00 منتصف الليل (بتوقيت دبي)",
          ],
        ]),
      ],
    },
  ];
};

export default async function ShippingPolicyPage() {
  const locale = await getServerLocale();
  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={localized("Shipping Policy", "سياسة الشحن", locale)}
      intro={localized(
        "Learn how Amoon Bloom Trading LLC delivers orders across the UAE, including delivery options, charges, and what to expect on delivery day.",
        "تعرّف على كيفية توصيل أمون بلوم للتجارة ذ.م.م للطلبات داخل دولة الإمارات العربية المتحدة، بما في ذلك خيارات التوصيل والرسوم وما يمكن توقعه في يوم التسليم.",
        locale
      )}
      badge={localized("Shipping Policy", "سياسة الشحن", locale)}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={localized("June 2026", "يونيو 2026", locale)}
      sections={getSections(locale)}
    />
  );
}
