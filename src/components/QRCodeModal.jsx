import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function QRCodeModal({ isOpen, onClose, link }) {
  const svgRef = useRef(null)

  if (!isOpen || !link) return null

  const url = `${window.location.origin}/${link.short_code}`

  const downloadQR = () => {
    if (!svgRef.current) return
    const svg = svgRef.current.outerHTML
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const URL = window.URL || window.webkitURL || window
    const blobURL = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobURL
    a.download = `qrcode-${link.short_code}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobURL)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">QR Code</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-6">
            <QRCodeSVG 
              value={url}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
              level={"Q"}
              includeMargin={false}
              ref={svgRef}
            />
          </div>
          <p className="text-slate-900 font-bold mb-1 text-center truncate w-full px-4">{link.title || link.short_code}</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:underline text-sm font-medium mb-6">
            {url}
          </a>
          
          <Button onClick={downloadQR} className="bitly-button-primary w-full">
            <Download className="h-4 w-4 mr-2" /> Download SVG
          </Button>
        </div>
      </div>
    </div>
  )
}
