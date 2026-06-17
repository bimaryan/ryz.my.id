import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import QRCodeStyling from 'qr-code-styling'

const FG_COLORS = [
  '#0f172a', // Slate 900
  '#0b5cff', // Primary Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
]

export default function QRCodeModal({ isOpen, onClose, link }) {
  const qrRef = useRef(null)
  const [fgColor, setFgColor] = useState(FG_COLORS[0])
  const url = link ? `${window.location.origin}/${link.short_code}` : ''

  // Initialize QR Code Styling only once
  const qrCode = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new QRCodeStyling({
      width: 200,
      height: 200,
      data: url,
      margin: 0,
      dotsOptions: {
        color: fgColor,
        type: "rounded" // makes the QR code dots rounded
      },
      cornersSquareOptions: {
        color: fgColor,
        type: "extra-rounded" // modern rounded corners
      },
      cornersDotOptions: {
        color: fgColor,
        type: "dot" 
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Append QR code to the DOM
  useEffect(() => {
    if (qrRef.current && qrCode) {
      qrRef.current.innerHTML = ''; // clear before append
      qrCode.append(qrRef.current);
    }
  }, [qrCode, isOpen]);

  // Update QR code when URL or Color changes
  useEffect(() => {
    if (qrCode) {
      qrCode.update({
        data: url,
        dotsOptions: { color: fgColor },
        cornersSquareOptions: { color: fgColor },
        cornersDotOptions: { color: fgColor }
      });
    }
  }, [url, fgColor, qrCode]);

  if (!isOpen || !link) return null

  const downloadQR = () => {
    if (qrCode) {
      qrCode.download({ name: `qrcode-${link.short_code}`, extension: "png" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Premium QR Code</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-6 flex justify-center">
            {/* The QR Code will be rendered inside this div */}
            <div ref={qrRef} />
          </div>
          <p className="text-slate-900 font-bold mb-1 text-center truncate w-full px-4">{link.title || link.short_code}</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:underline text-sm font-medium mb-6">
            {url}
          </a>
          
          <div className="flex flex-col gap-2 w-full mb-6 items-center">
            <label className="text-[11px] font-bold text-[#566b8f] uppercase tracking-wider block mb-1">Select Color</label>
            <div className="flex gap-2 justify-center flex-wrap">
              {FG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFgColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${fgColor === c ? 'border-[#0b5cff] scale-110 shadow-md ring-2 ring-[#0b5cff]/20' : 'border-slate-200 hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                  type="button"
                />
              ))}
            </div>
          </div>

          <Button onClick={downloadQR} className="bitly-button-primary w-full">
            <Download className="h-4 w-4 mr-2" /> Download PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
