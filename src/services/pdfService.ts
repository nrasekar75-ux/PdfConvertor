import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function getPdfInfo(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return {
      pages: pdf.numPages,
      filename: file.name,
      size: file.size
    };
  } catch (err) {
    console.error('Error reading PDF:', err);
    throw new Error('Invalid PDF file');
  }
}

export async function pdfToImage(file: File, pageNumber: number = 1): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('PDF to Image error:', err);
    throw new Error('Failed to convert PDF to image');
  }
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
        throw new Error(`Failed to process ${file.name}`);
      }
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (err) {
    console.error('Merge PDFs error:', err);
    throw new Error('Failed to merge PDFs');
  }
}

export async function splitPdf(file: File, startPage: number, endPage: number): Promise<Blob> {
  try {
    const { PDFDocument } = await import('pdf-lib');

    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer);
    const splitPdf = await PDFDocument.create();

    const pagesToCopy = [];
    for (let i = startPage - 1; i < Math.min(endPage, originalPdf.getPageCount()); i++) {
      pagesToCopy.push(i);
    }

    const pages = await splitPdf.copyPages(originalPdf, pagesToCopy);
    pages.forEach(page => splitPdf.addPage(page));

    const pdfBytes = await splitPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (err) {
    console.error('Split PDF error:', err);
    throw new Error('Failed to split PDF');
  }
}

export async function compressPdf(file: File): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const { PDFDocument } = await import('pdf-lib');
    const compressedPdf = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Failed to get canvas context');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.7);
      });

      const arrayBuf = await imageBlob.arrayBuffer();
      const image = await compressedPdf.embedJpg(arrayBuf);
      const pdfPage = compressedPdf.addPage([viewport.width, viewport.height]);
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    const pdfBytes = await compressedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (err) {
    console.error('Compress PDF error:', err);
    throw new Error('Failed to compress PDF');
  }
}

export async function pdfToWord(file: File): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n\n';
      } catch (err) {
        console.error(`Error extracting text from page ${i}:`, err);
      }
    }

    const docx = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${escapeXml(fullText)}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    return new Blob([docx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  } catch (err) {
    console.error('PDF to Word error:', err);
    throw new Error('Failed to convert PDF to Word');
  }
}

export async function pdfToExcel(file: File): Promise<Blob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const rows: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
          .join(' ');
        rows.push(pageText);
      } catch (err) {
        console.error(`Error extracting text from page ${i}:`, err);
      }
    }

    let csv = 'Content\n';
    rows.forEach(row => {
      csv += `"${row.replace(/"/g, '""')}"\n`;
    });

    return new Blob([csv], { type: 'text/csv' });
  } catch (err) {
    console.error('PDF to Excel error:', err);
    throw new Error('Failed to convert PDF to Excel');
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
