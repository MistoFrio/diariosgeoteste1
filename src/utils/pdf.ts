import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type ExportOptions = {
  title?: string;
  logoUrl?: string; // ex: '/logogeoteste.jpeg'
  headerBgColor?: string; // ex: '#F0FDF4'
  marginMm?: number;
};

async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    title = 'Diário de Obra',
    logoUrl = '/logogeoteste.png',
    headerBgColor = '#F0FDF4',
    marginMm = 12,
  } = options;

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const contentImgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const headerHeight = 18; // mm

  const usableWidth = pageWidth - marginMm * 2;
  const contentImgWidth = usableWidth;
  const contentImgHeight = (canvas.height * contentImgWidth) / canvas.width;

  const usablePageHeight = pageHeight - marginMm * 2 - headerHeight;
  const totalPages = Math.max(1, Math.ceil(contentImgHeight / usablePageHeight));

  const logoDataUrl = logoUrl ? await loadImageAsDataUrl(logoUrl) : undefined;

  const drawHeader = (pageNumber: number) => {
    // Background bar
    pdf.setFillColor(headerBgColor);
    pdf.rect(0, 0, pageWidth, headerHeight + marginMm, 'F');
    // Logo
    if (logoDataUrl) {
      const logoHeight = 10;
      const logoWidth = 10;
      pdf.addImage(logoDataUrl, 'JPEG', marginMm, marginMm - 2, logoWidth, logoHeight, undefined, 'FAST');
    }
    // Title
    pdf.setTextColor(22, 22, 22);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(title, pageWidth / 2, marginMm + 4, { align: 'center' });
    // Page number
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(`${pageNumber}/${totalPages}`, pageWidth - marginMm, marginMm + 4, { align: 'right' });
  };

  let heightLeft = contentImgHeight;
  let positionY = marginMm + headerHeight;

  // First page
  drawHeader(1);
  pdf.addImage(contentImgData, 'PNG', marginMm, positionY, contentImgWidth, contentImgHeight, undefined, 'FAST');
  heightLeft -= usablePageHeight;

  let currentPage = 1;
  while (heightLeft > 0) {
    pdf.addPage();
    currentPage += 1;
    drawHeader(currentPage);
    positionY = marginMm + headerHeight - (contentImgHeight - heightLeft);
    pdf.addImage(contentImgData, 'PNG', marginMm, positionY, contentImgWidth, contentImgHeight, undefined, 'FAST');
    heightLeft -= usablePageHeight;
  }

  pdf.save(fileName);
}


