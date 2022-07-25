import {degrees, PDFDocument} from 'pdf-lib';

export const centerPdf = async (pdfBytes: string | Uint8Array | ArrayBuffer, options: {
  drawAlignment?: boolean,
  drawBorder?: boolean,
  nudgeHeight?: number,
  nudgeWidth?: number,
  nudgeBorderWidth?: number,
  nudgeBorderHeight?: number,
}): Promise<Uint8Array> => {
  const oldPdfDoc = await PDFDocument.load(pdfBytes);
  const newPdfDoc = await PDFDocument.create();

  for (const oldPage of oldPdfDoc.getPages()) {
    const newPage = newPdfDoc.addPage();

    const isLandscape = oldPage.getWidth() > oldPage.getHeight();

    const newWidth = newPage.getWidth();
    const newHeight = newPage.getHeight();
    const oldWidth = isLandscape ? oldPage.getHeight() : oldPage.getWidth();
    const oldHeight = isLandscape ? oldPage.getWidth() : oldPage.getHeight();
    const widthOffset = (newWidth - oldWidth) / 2;
    const heightOffset = (newHeight - oldHeight) / 2;

    const embedded = await newPdfDoc.embedPage(oldPage);
    newPage.drawPage(embedded, {
      x: (isLandscape ? newWidth - widthOffset : widthOffset) + (options?.nudgeWidth || 0),
      y: heightOffset + (options?.nudgeHeight || 0),
      rotate: isLandscape ? degrees(90) : degrees(0),
    });

    if (options?.drawAlignment) {
      newPage.drawLine({
        start: {x: 10, y: 10},
        end: {x: 30, y: 10},
        thickness: 2,
      });

      newPage.drawLine({
        start: {x: 10, y: 30},
        end: {x: 10, y: 10},
        thickness: 2,
      });
    }

    if (options?.drawBorder) {
      newPage.drawRectangle({
        x: widthOffset + (options?.nudgeBorderWidth || 0) + (options?.nudgeWidth || 0),
        y: heightOffset + (options?.nudgeBorderHeight || 0) + (options?.nudgeHeight || 0),
        height: oldHeight - ((options?.nudgeBorderHeight || 0) * 2),
        width: oldWidth - ((options?.nudgeBorderWidth || 0) * 2),
        opacity: 0,
        borderOpacity: 1,
        borderWidth: 2,
      });
    }
  }

  return await newPdfDoc.save();
}
