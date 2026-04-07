import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateVoucherPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById('printable-voucher') || document.getElementById(elementId);
  if (!element) return;

  try {
    // 1. Capturar o elemento com alta densidade (3x) para nitidez absoluta
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1400, // Forçamos a largura do template horizontal
      windowHeight: 500
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 2. Criar o documento PDF (14cm x 5cm horizontal)
    // 14cm = 140mm, 5cm = 50mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [140, 50]
    });

    // Adiciona a imagem cobrindo todo o espaço do "ticket"
    pdf.addImage(imgData, 'PNG', 0, 0, 140, 50);
    
    // 3. Salvar o arquivo
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Falha ao gerar PDF:', error);
    return false;
  }
};
