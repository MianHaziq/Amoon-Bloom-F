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

export const metadata = { title: "Refund & Return Policy" };

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
      title: localized("1. Our Commitment", "1. التزامنا", locale),
      blocks: [
        P(
          "At Amoon Bloom Trading LLC, we take great care in preparing and delivering every order. If your order arrives damaged, incorrect, or defective, we will make it right.",
          "في أمون بلوم للتجارة ذ.م.م، نولي عناية كبيرة بتجهيز وتوصيل كل طلب. وإذا وصل طلبك تالفًا أو غير مطابق أو معيبًا، فسنعمل على تصحيح الأمر."
        ),
      ],
    },
    {
      title: localized(
        "2. Eligibility for Returns & Refunds",
        "2. أهلية الاسترجاع والاسترداد",
        locale
      ),
      blocks: [
        P(
          "You are eligible for a return or refund in the following circumstances:",
          "يحق لك الاسترجاع أو الاسترداد في الحالات التالية:"
        ),
        L([
          [
            "The product received is materially different from what was ordered",
            "المنتج المستلَم مختلف جوهريًا عمّا تم طلبه",
          ],
          [
            "The product arrives in a damaged or defective condition",
            "وصل المنتج تالفًا أو بحالة معيبة",
          ],
          [
            "The order was not delivered within the agreed timeframe due to our error",
            "لم يُسلَّم الطلب ضمن المدة المتفق عليها بسبب خطأ من جانبنا",
          ],
          [
            "The product poses a safety concern",
            "يشكّل المنتج مصدر قلق يتعلق بالسلامة",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "3. Non-Returnable & Non-Refundable Items",
        "3. المنتجات غير القابلة للإرجاع أو الاسترداد",
        locale
      ),
      blocks: [
        P(
          "Due to the perishable and personalised nature of our products, the following cannot be returned or refunded:",
          "نظرًا للطبيعة القابلة للتلف والمخصصة لمنتجاتنا، لا يمكن إرجاع أو استرداد قيمة ما يلي:"
        ),
        L([
          [
            "Fresh flowers and floral arrangements (perishable goods)",
            "الزهور الطازجة والتنسيقات الزهرية (سلع قابلة للتلف)",
          ],
          [
            "Personalised and custom-made items, once production has begun",
            "المنتجات المخصصة والمصنوعة حسب الطلب، بعد بدء الإنتاج",
          ],
          [
            "Gift boxes where packaging has been opened or items removed",
            "صناديق الهدايا التي تم فتح تغليفها أو إزالة محتوياتها",
          ],
          [
            "Products damaged due to customer mishandling after delivery",
            "المنتجات التي تلفت بسبب سوء استخدام العميل بعد التسليم",
          ],
          [
            "Items where the return request is made more than 24 hours after delivery",
            "الحالات التي يُقدَّم فيها طلب الإرجاع بعد مرور أكثر من 24 ساعة على التسليم",
          ],
        ]),
      ],
    },
    {
      title: localized(
        "4. How to Request a Return or Refund",
        "4. كيفية طلب الإرجاع أو الاسترداد",
        locale
      ),
      blocks: [
        P("To initiate a return or refund request:", "لبدء طلب الإرجاع أو الاسترداد:"),
        L([
          [
            `Contact us within 24 hours of receiving your order at ${contact.email} or via WhatsApp at ${contact.whatsappNumber}`,
            `تواصل معنا خلال 24 ساعة من استلام طلبك عبر ${contact.email} أو واتساب على ${contact.whatsappNumber}`,
          ],
          [
            "Provide your order number, a description of the issue, and clear photographs of the product and packaging",
            "قدّم رقم طلبك ووصفًا للمشكلة وصورًا واضحة للمنتج والتغليف",
          ],
          [
            "Our customer care team will review your request within one (1) business day",
            "سيراجع فريق خدمة العملاء لدينا طلبك خلال يوم عمل واحد (1)",
          ],
          [
            "Approved returns must be dispatched within 48 hours of approval",
            "يجب شحن المرتجعات المعتمدة خلال 48 ساعة من الموافقة",
          ],
        ]),
      ],
    },
    {
      title: localized("5. Refund Processing", "5. معالجة المبالغ المستردة", locale),
      blocks: [
        L([
          [
            "Approved refunds will be processed to the original payment method within 7 to 14 business days, depending on your bank or payment provider.",
            "تتم معالجة المبالغ المستردة المعتمدة إلى طريقة الدفع الأصلية خلال 7 إلى 14 يوم عمل، حسب البنك أو مزود الدفع.",
          ],
          [
            "Where a full refund is not applicable, we may offer a store credit or replacement product of equal value at our discretion.",
            "في حال عدم انطباق الاسترداد الكامل، يجوز لنا تقديم رصيد للمتجر أو منتج بديل بقيمة معادلة وفقًا لتقديرنا.",
          ],
          [
            "Shipping charges are non-refundable unless the return is due to our error.",
            "رسوم الشحن غير قابلة للاسترداد ما لم يكن الإرجاع بسبب خطأ من جانبنا.",
          ],
        ]),
      ],
    },
    {
      title: localized("6. Order Cancellations", "6. إلغاء الطلبات", locale),
      blocks: [
        L([
          [
            "Orders may be cancelled within two (2) hours of placement, provided production has not yet commenced.",
            "يمكن إلغاء الطلبات خلال ساعتين (2) من تقديمها، شريطة عدم بدء الإنتاج بعد.",
          ],
          [
            "Personalised orders cannot be cancelled once customisation has begun.",
            "لا يمكن إلغاء الطلبات المخصصة بعد بدء التخصيص.",
          ],
          [
            `To cancel an order, contact us immediately via WhatsApp at ${contact.whatsappNumber}.`,
            `لإلغاء طلب، تواصل معنا فورًا عبر واتساب على ${contact.whatsappNumber}.`,
          ],
          [
            "Cancellations approved before dispatch will receive a full refund.",
            "تحصل حالات الإلغاء المعتمدة قبل الشحن على استرداد كامل للمبلغ.",
          ],
        ]),
      ],
    },
    {
      title: localized("7. Exchanges", "7. الاستبدال", locale),
      blocks: [
        P(
          "We do not offer product exchanges. If you have received a defective or incorrect item, please follow the return process outlined above, and we will provide a replacement or refund accordingly.",
          "لا نقدّم خدمة استبدال المنتجات. وفي حال استلامك منتجًا معيبًا أو غير مطابق، يُرجى اتباع إجراء الإرجاع الموضح أعلاه، وسنوفر لك بديلاً أو استردادًا وفقًا لذلك."
        ),
      ],
    },
    {
      title: localized("8. Consumer Rights", "8. حقوق المستهلك", locale),
      blocks: [
        P(
          `Nothing in this policy limits or excludes your rights as a consumer under ${contact.consumerProtectionLawName} and the applicable laws. In the event of a dispute, you may also refer your complaint to the ${contact.consumerProtectionAuthority}.`,
          `لا يحد أي بند في هذه السياسة من حقوقك كمستهلك بموجب ${contact.consumerProtectionLawName} والقوانين المعمول بها الأخرى، أو يستثنيها. وفي حال وجود نزاع، يمكنك أيضًا إحالة شكواك إلى ${contact.consumerProtectionAuthority}.`
        ),
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
  ];
};

export default async function RefundPolicyPage() {
  const [locale, region] = await Promise.all([getServerLocale(), getServerRegion()]);
  const contact = await regionContactFromRegionCode(region, locale);
  return (
    <LegalPageLayout
      eyebrow={localized("Policies", "السياسات", locale)}
      title={localized("Refund & Return Policy", "سياسة الاسترجاع والاستبدال", locale)}
      intro={localized(
        `This policy is in accordance with ${contact.consumerProtectionLawName} and its executive regulations.`,
        `تتوافق هذه السياسة مع ${contact.consumerProtectionLawName} ولوائحه التنفيذية.`,
        locale
      )}
      badge={localized("Refund & Return Policy", "سياسة الاسترجاع والاستبدال", locale)}
      updatedLabel={localized("Last Updated", "آخر تحديث", locale)}
      updatedValue={localized("June 2026", "يونيو 2026", locale)}
      sections={getSections(locale, contact)}
    />
  );
}
