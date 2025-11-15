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

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageLayout {
  width: number;
  height: number;
  items: TextItem[];
}

async function extractPageLayout(page: any): Promise<PageLayout> {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  const items = textContent.items
    .filter((item: any) => item.str && item.str.trim())
    .map((item: any) => ({
      str: item.str,
      x: item.x,
      y: item.y,
      width: item.width || 0,
      height: item.height || 0
    }));

  return {
    width: viewport.width,
    height: viewport.height,
    items
  };
}

function detectColumns(layout: PageLayout): number {
  if (layout.items.length === 0) return 1;

  const xPositions = layout.items.map(item => item.x);
  const uniqueX = [...new Set(xPositions.map(x => Math.round(x / 10) * 10))];
  uniqueX.sort((a, b) => a - b);

  if (uniqueX.length > 3) {
    const gaps = [];
    for (let i = 1; i < uniqueX.length; i++) {
      gaps.push(uniqueX[i] - uniqueX[i - 1]);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const largeGaps = gaps.filter(g => g > avgGap * 2).length;
    return Math.min(largeGaps + 1, 3);
  }

  return uniqueX.length > 1 ? 2 : 1;
}

function groupItemsByLine(items: TextItem[]): TextItem[][] {
  const lines: TextItem[][] = [];
  const tolerance = 5;

  const sortedItems = [...items].sort((a, b) => {
    const aDiff = Math.abs(a.y - b.y);
    const bDiff = Math.abs(a.y - b.y);
    if (Math.abs(aDiff - bDiff) > tolerance) return b.y - a.y;
    return a.x - b.x;
  });

  for (const item of sortedItems) {
    let found = false;
    for (const line of lines) {
      if (Math.abs(line[0].y - item.y) < tolerance) {
        line.push(item);
        found = true;
        break;
      }
    }
    if (!found) {
      lines.push([item]);
    }
  }

  lines.forEach(line => line.sort((a, b) => a.x - b.x));
  return lines;
}

export async function pdfToWord(file: File): Promise<Blob> {
  try {
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, AlignmentType } = await import('docx');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const sections: any[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const layout = await extractPageLayout(page);
        const columns = detectColumns(layout);

        if (layout.items.length === 0) {
          continue;
        }

        const lines = groupItemsByLine(layout.items);

        if (columns === 1) {
          const paragraphs = lines.map(line => {
            const text = line.map(item => item.str).join(' ');
            return new Paragraph({
              text,
              spacing: { line: 240 }
            });
          });
          sections.push(...paragraphs);
        } else {
          const itemsByColumn: TextItem[][] = [[], []];
          const midX = layout.width / 2;

          for (const item of layout.items) {
            if (item.x < midX) {
              itemsByColumn[0].push(item);
            } else {
              itemsByColumn[1].push(item);
            }
          }

          const col1Lines = groupItemsByLine(itemsByColumn[0]);
          const col2Lines = groupItemsByLine(itemsByColumn[1]);
          const maxLines = Math.max(col1Lines.length, col2Lines.length);

          const rows = [];
          for (let i = 0; i < maxLines; i++) {
            const col1Text = col1Lines[i]?.map(item => item.str).join(' ') || '';
            const col2Text = col2Lines[i]?.map(item => item.str).join(' ') || '';

            rows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(col1Text || ' ')],
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  }),
                  new TableCell({
                    children: [new Paragraph(col2Text || ' ')],
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                  })
                ]
              })
            );
          }

          if (rows.length > 0) {
            sections.push(
              new Table({
                rows,
                width: { size: 100, type: 'pct' },
                borders: {
                  top: { style: 'none' },
                  bottom: { style: 'none' },
                  left: { style: 'none' },
                  right: { style: 'none' },
                  insideHorizontal: { style: 'none' },
                  insideVertical: { style: 'none' }
                }
              })
            );
          }
        }

        if (pageNum < pdf.numPages) {
          sections.push(new Paragraph({ text: '', pageBreakBefore: true }));
        }
      } catch (err) {
        console.error(`Error extracting page ${pageNum}:`, err);
      }
    }

    const doc = new Document({
      sections: [{ children: sections }]
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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
