import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ExportOptions {
  fileName: string;
  scale?: number;
  backgroundColor?: string;
}

export interface PDFExportOptions {
  fileName: string;
  pdfType: 'pvc_card' | 'a4_certificate';
  scale?: number;
  backgroundColor?: string;
}

/**
 * Capture DOM element as high-res PNG Data URL using html-to-image.
 */
async function captureElementDataUrl(
  element: HTMLElement,
  scale: number = 2.5,
  backgroundColor: string = '#ffffff'
): Promise<string> {
  try {
    return await toPng(element, {
      pixelRatio: scale,
      backgroundColor,
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
          return false;
        }
        return true;
      },
    });
  } catch (err) {
    console.warn('High-res capture failed, falling back to basic capture:', err);
    return await toPng(element, {
      pixelRatio: 2,
      backgroundColor,
      skipFonts: true,
      fontEmbedCSS: '',
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
          return false;
        }
        return true;
      },
    });
  }
}

/**
 * High-fidelity image exporter compatible with Tailwind CSS v4 (oklch colors).
 */
export async function downloadElementAsPNG(
  element: HTMLElement,
  options: ExportOptions
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const { fileName, scale = 2.5, backgroundColor = '#ffffff' } = options;

  try {
    const dataUrl = await captureElementDataUrl(element, scale, backgroundColor);
    triggerBrowserBlobDownload(dataUrl, fileName, 'image/png');
    return { success: true, dataUrl };
  } catch (err: unknown) {
    console.error('All PNG export attempts failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PNG export failed',
    };
  }
}

/**
 * Generates and downloads a real, printable PDF file:
 * - For 'pvc_card': Standard CR80 PVC dimensions (85.6mm x 54mm) + A4 print sheet with cut guidelines
 * - For 'a4_certificate': Standard A4 Landscape (297mm x 210mm)
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<{ success: boolean; pdfBlobUrl?: string; error?: string }> {
  const { fileName, pdfType, scale = 3, backgroundColor = '#ffffff' } = options;

  try {
    const imgDataUrl = await captureElementDataUrl(element, scale, backgroundColor);

    let doc: jsPDF;

    if (pdfType === 'pvc_card') {
      // Page 1: Exact Standard CR80 PVC Card Dimensions (85.6mm × 54.0mm)
      // Perfectly calibrated for thermal PVC card printers (Evolis, Zebra, Magicard, etc.)
      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54.0],
      });

      doc.addImage(imgDataUrl, 'PNG', 0, 0, 85.6, 54.0);

      // Page 2: Standard A4 Print Sheet with Card Centered and Cutting Guides
      // For printing on standard inkjet/laser PVC sticker sheets or regular paper
      doc.addPage('a4', 'portrait');
      doc.setFontSize(13);
      doc.setTextColor(18, 41, 74);
      doc.text('SidTech Technologies - Official PVC Card Print Sheet', 105, 20, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Print Settings: 100% Scale (Actual Size / Do Not Fit to Page) | Standard CR80: 85.6 mm × 54.0 mm', 105, 26, { align: 'center' });

      // Centered Card on A4 (A4 is 210mm wide × 297mm high)
      const cardX = (210 - 85.6) / 2; // ~62.2 mm
      const cardY = 45; // mm

      // Card boundary & crop marks
      doc.setDrawColor(232, 106, 23); // SidTech Orange
      doc.setLineWidth(0.5);
      doc.rect(cardX - 0.5, cardY - 0.5, 86.6, 55.0);

      doc.addImage(imgDataUrl, 'PNG', cardX, cardY, 85.6, 54.0);

      // Crop mark labels
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('✂ Cut along the orange border for standard PVC card slot', 105, cardY + 59, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Page 1 of this PDF contains the direct CR80 dimension for specialized card printer machines.', 105, cardY + 68, { align: 'center' });
    } else {
      // Standard A4 Landscape Certificate (297mm × 210mm)
      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // 8mm margin around certificate for border padding
      doc.addImage(imgDataUrl, 'PNG', 8, 8, 281, 194);
    }

    const pdfBlob = doc.output('blob');
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);

    // Trigger instant browser download
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 2000);

    return { success: true, pdfBlobUrl };
  } catch (err: unknown) {
    console.error('PDF export failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PDF generation failed',
    };
  }
}

function triggerBrowserBlobDownload(dataUrl: string, fileName: string, mimeType: string = 'image/png') {
  try {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
  }
}
