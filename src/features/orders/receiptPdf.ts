import { downloadBlob } from "@/lib/download";

/**
 * Renders an on-screen receipt node to a real, downloadable PDF entirely on the
 * client — no backend endpoint involved.
 *
 * Why rasterise the DOM instead of drawing the receipt programmatically: the
 * storefront is bilingual (English + Arabic/RTL) and product titles can be
 * Arabic even in the English UI. Capturing the already-rendered node lets the
 * browser shape every script correctly, so the PDF always matches what the
 * customer sees. We use `html2canvas-pro` rather than classic `html2canvas`
 * because Tailwind v4 emits `oklch()` colors, which the classic build can't
 * parse.
 *
 * Both heavy libraries are imported lazily here so they never touch the initial
 * bundle — only a click on "Download PDF" pulls them in.
 */
export async function downloadReceiptPdf(
  node: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(node, {
    // 2× keeps text/thumbnails crisp when the PDF is opened or printed.
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    // The receipt's screen-only bits (order tracker, etc.) already carry the
    // `.no-print` class; skipping the same nodes keeps the PDF a clean invoice,
    // exactly matching what the print stylesheet omits.
    ignoreElements: (el) => el.classList.contains("no-print"),
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Fit the capture to the page width, then slice it down across as many pages
  // as its height needs — a long receipt (many items) spans multiple pages.
  const imgW = pageW;
  const imgH = (canvas.height / canvas.width) * imgW;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  downloadBlob(pdf.output("blob"), filename);
}
