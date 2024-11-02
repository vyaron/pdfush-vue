import { PDFDocument } from 'pdf-lib'

export default {
    namespaced: true,
    state: {
      pdfDataStore: {},
      pageOrder: [],
      previewPage: null
    },
    getters: {
      hasPdfs: state => Object.keys(state.pdfDataStore).length > 0
    },
    mutations: {
      ADD_PDF(state, { name, data }) {
        console.log('Adding PDF to store:', name)
        state.pdfDataStore[name] = data
      },
      ADD_PAGES(state, pages) {
        console.log('Adding pages:', pages)
        const pagesWithOriginal = pages.map(page => ({
          ...page,
          originalPdfName: page.pdfName
        }))
        state.pageOrder.push(...pagesWithOriginal)
        console.log('Updated pageOrder:', state.pageOrder)
      },
      UPDATE_PDF_NAME(state, { oldName, newName }) {
        state.pdfDataStore[newName] = state.pdfDataStore[oldName]
        delete state.pdfDataStore[oldName]
        
        // Update page order references
        state.pageOrder = state.pageOrder.map(page => ({
          ...page,
          pdfName: page.pdfName === oldName ? newName : page.pdfName
        }))
      },
      UPDATE_PAGE_ORDER(state, newOrder) {
        state.pageOrder = [...newOrder]
      },
      REMOVE_PAGE(state, { pdfName, pageNum }) {
        const pages = [...state.pageOrder]
        const pageIndex = pages.findIndex(
          p => p.pdfName === pdfName && p.pageNum === pageNum
        )
        
        if (pageIndex !== -1) {
          pages.splice(pageIndex, 1)
          
          // Update page numbers for the PDF
          const pdfPages = pages.filter(p => p.pdfName === pdfName)
          pdfPages.forEach((page, index) => {
            page.pageNum = index + 1
          })
          
          state.pageOrder = pages
        }
      },
      ROTATE_PAGE(state, { pdfName, pageNum, rotation }) {
        const pageIndex = state.pageOrder.findIndex(page => 
          page.pdfName === pdfName && page.pageNum === pageNum
        )
        if (pageIndex !== -1) {
          state.pageOrder[pageIndex].rotation = rotation
        }
      },
      DELETE_PAGE(state, { pdfName, pageNum }) {
        state.pageOrder = state.pageOrder.filter(page => 
          !(page.pdfName === pdfName && page.pageNum === pageNum)
        )
        
        // If this was the last page of the PDF, remove the PDF data
        const remainingPages = state.pageOrder.filter(page => page.pdfName === pdfName)
        if (remainingPages.length === 0) {
          delete state.pdfDataStore[pdfName]
        }
      },
      REORDER_PAGES(state, { fromPage, toPage, fromPdf, toPdf }) {
        console.log('REORDER_PAGES:', { fromPage, toPage, fromPdf, toPdf })
        
        const pages = [...state.pageOrder]
        
        // Find the source page
        const fromIndex = pages.findIndex(
          p => p.pageNum === fromPage && p.pdfName === fromPdf
        )
        
        if (fromIndex === -1) {
          console.warn('Could not find source page:', { fromPage, fromPdf })
          return
        }
        
        // Move the page
        const [movedPage] = pages.splice(fromIndex, 1)
        movedPage.pdfName = toPdf
        
        // If dropping at the end of a document
        if (toPage > pages.filter(p => p.pdfName === toPdf).length) {
          // Add to the end of target document's pages
          const lastTargetIndex = pages.findLastIndex(p => p.pdfName === toPdf)
          pages.splice(lastTargetIndex + 1, 0, movedPage)
        } else {
          // Insert at specific position
          const toIndex = pages.findIndex(
            p => p.pageNum === toPage && p.pdfName === toPdf
          )
          pages.splice(toIndex, 0, movedPage)
        }
        
        // Update page numbers for both PDFs
        const updatePageNumbers = (pdfName) => {
          const pdfPages = pages.filter(p => p.pdfName === pdfName)
          pdfPages.forEach((page, index) => {
            page.pageNum = index + 1
          })
        }
        
        updatePageNumbers(fromPdf)
        updatePageNumbers(toPdf)
        
        state.pageOrder = [...pages]
      },
      RENAME_PDF(state, { oldName, newName }) {
        // Update data store
        state.pdfDataStore[newName] = state.pdfDataStore[oldName]
        delete state.pdfDataStore[oldName]

        // Update page order
        state.pageOrder.forEach(page => {
          if (page.pdfName === oldName) {
            page.pdfName = newName
          }
        })
      },
      SET_PAGE_ORDER(state, newOrder) {
        console.log('Setting new page order:', newOrder)
        state.pageOrder = [...newOrder]
      },
      SET_PREVIEW_PAGE(state, pageInfo) {
        state.previewPage = pageInfo
      }
    },
    actions: {
      async addPdf({ commit, state }, file) {
        try {
          if (file.type === 'application/pdf') {
            console.log('Processing PDF file:', file.name)
            
            // Check if PDF is already added
            if (state.pdfDataStore[file.name]) {
              console.warn('PDF already exists:', file.name)
              return
            }

            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
            const pageCount = pdf.numPages
            
            console.log('PDF page count:', pageCount)

            // Add PDF to data store
            commit('ADD_PDF', { 
              name: file.name, 
              data: file 
            })

            // Create page entries
            const newPages = Array.from({ length: pageCount }, (_, i) => ({
              pdfName: file.name,
              pageNum: i + 1,
              originalPageNum: i + 1,
              rotation: 0
            }))

            // Add pages to order
            commit('ADD_PAGES', newPages)
          } else if (file.type.startsWith('image/')) {
            const pdfDoc = await PDFDocument.create()
            
            const imageBytes = await file.arrayBuffer()
            let image
            
            if (file.type === 'image/jpeg') {
              image = await pdfDoc.embedJpg(imageBytes)
            } else if (file.type === 'image/png') {
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
            
            const pdfBytes = await pdfDoc.save()
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' })
            const pdfName = `${file.name}.pdf`
            
            commit('ADD_PDF', { 
              name: pdfName, 
              data: pdfBlob
            })
            commit('UPDATE_PAGE_ORDER', [
              ...state.pageOrder,
              { pdfName, pageNum: 1, rotation: 0 }
            ])
          }
        } catch (error) {
          console.error('Error adding PDF:', error)
          throw error
        }
      },
      async combinePdfs({ state }) {
        // PDF combining logic
      },
      async deletePage({ commit }, { pdfName, pageNum }) {
        commit('DELETE_PAGE', { pdfName, pageNum })
      }
    }
  }