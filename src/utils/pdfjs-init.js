// import { GlobalWorkerOptions } from 'pdfjs-dist'

// Option 1: Use CDN worker (recommended for development)
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

// Option 2: If you prefer using local worker (recommended for production)
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js'
// GlobalWorkerOptions.workerSrc = pdfjsWorker



import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

// Make pdfjsLib available globally
window.pdfjsLib = pdfjsLib