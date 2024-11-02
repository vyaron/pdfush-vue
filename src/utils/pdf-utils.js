import { PDFDocument } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist'

export async function createPdfFromImage(imageFile) {
  const pdfDoc = await PDFDocument.create()
  const imageBytes = await imageFile.arrayBuffer()
  
  let image
  if (imageFile.type === 'image/jpeg') {
    image = await pdfDoc.embedJpg(imageBytes)
  } else if (imageFile.type === 'image/png') {
    image = await pdfDoc.embedPng(imageBytes)
  } else {
    throw new Error('Unsupported image type')
  }

  const page = pdfDoc.addPage([image.width, image.height])
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height
  })

  return await pdfDoc.save()
}

export async function renderPdfPage(pdfData, pageNum, scale = 1, rotation = 0) {
  const pdf = await getDocument(pdfData).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale, rotation })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  await page.render({
    canvasContext: context,
    viewport
  }).promise

  return canvas
}

export async function addFormField(pdfData, pageNum, fieldType, x, y) {
  const pdfDoc = await PDFDocument.load(pdfData)
  const page = pdfDoc.getPages()[pageNum - 1]
  const { width, height } = page.getSize()

  const field = pdfDoc.getForm().createTextField(`${fieldType}_${Date.now()}`)
  field.setText('')

  const fieldDimensions = {
    date: { width: 100, height: 20 },
    name: { width: 200, height: 20 },
    signature: { width: 200, height: 50 }
  }[fieldType] || { width: 100, height: 20 }

  field.addToPage(page, {
    x: x * width,
    y: y * height,
    ...fieldDimensions
  })

  return await pdfDoc.save()
}

export function downloadPdf(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  
  URL.revokeObjectURL(url)
}
