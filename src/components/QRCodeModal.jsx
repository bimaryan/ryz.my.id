import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Download, ImageIcon, Settings2, Sparkles, Palette } from 'lucide-react'
import Button from '@/components/ui/Button'
import QRCodeStyling from 'qr-code-styling'
import Input from '@/components/ui/Input'

const FG_COLORS = [
  '#0f172a', // Slate 900
  '#0b5cff', // Primary Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
]

const BG_COLORS = [
  '#ffffff', // White
  '#f8fafc', // Slate 50
  '#fef3c7', // Yellow 100
  '#e0e7ff', // Indigo 100
  '#dcfce7', // Green 100
]

const DOTS_TYPES = [
  { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' },
  { id: 'classy', label: 'Classy' },
  { id: 'square', label: 'Square' },
  { id: 'extra-rounded', label: 'Extra' }
]

const CORNERS_TYPES = [
  { id: 'extra-rounded', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' }
]

const CORNERS_DOT_TYPES = [
  { id: 'dot', label: 'Dot' },
  { id: 'square', label: 'Square' }
]

export default function QRCodeModal({ isOpen, onClose, link }) {
  const qrRef = useRef(null)
  
  // Customization State
  const [fgColor, setFgColor] = useState(FG_COLORS[0])
  const [bgColor, setBgColor] = useState(BG_COLORS[0])
  const [dotsType, setDotsType] = useState('rounded')
  const [cornersType, setCornersType] = useState('extra-rounded')
  const [cornersDotType, setCornersDotType] = useState('dot')
  const [qrGradient, setQrGradient] = useState(false)
  const [qrGradientColor2, setQrGradientColor2] = useState('#00c6ff')
  const [logoUrl, setLogoUrl] = useState('')
  const [activeTab, setActiveTab] = useState('design')

  const url = link ? `${window.location.origin}/${link.short_code}` : ''

  // Initialize QR Code Styling only once
  const qrCode = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new QRCodeStyling({
      width: 220,
      height: 220,
      data: url,
      margin: 0,
      dotsOptions: {
        color: fgColor,
        type: dotsType,
        gradient: qrGradient ? {
          type: 'linear',
          rotation: 0,
          colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: qrGradientColor2 }]
        } : undefined
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornersType,
        gradient: qrGradient ? {
          type: 'linear',
          rotation: 0,
          colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: qrGradientColor2 }]
        } : undefined
      },
      cornersDotOptions: {
        color: fgColor,
        type: cornersDotType,
        gradient: qrGradient ? {
          type: 'linear',
          rotation: 0,
          colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: qrGradientColor2 }]
        } : undefined
      },
      backgroundOptions: {
        color: bgColor,
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

  // Update QR code when URL or Customization changes
  useEffect(() => {
    if (qrCode) {
      const gradientOptions = qrGradient ? {
        type: 'linear',
        rotation: 0,
        colorStops: [{ offset: 0, color: fgColor }, { offset: 1, color: qrGradientColor2 }]
      } : undefined;

      qrCode.update({
        data: url,
        image: logoUrl || undefined,
        dotsOptions: { color: fgColor, type: dotsType, gradient: gradientOptions },
        cornersSquareOptions: { color: fgColor, type: cornersType, gradient: gradientOptions },
        cornersDotOptions: { color: fgColor, type: cornersDotType, gradient: gradientOptions },
        backgroundOptions: { color: bgColor }
      });
    }
  }, [url, fgColor, bgColor, dotsType, cornersType, cornersDotType, qrGradient, qrGradientColor2, logoUrl, qrCode]);

  if (!isOpen || !link) return null

  const downloadQR = () => {
    if (qrCode) {
      qrCode.download({ name: `qrcode-${link.short_code}`, extension: "png" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Preview */}
        <div className="w-full md:w-5/12 bg-slate-50 border-r border-slate-200 p-8 flex flex-col items-center justify-center shrink-0">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-center transition-all duration-300 hover:shadow-md" style={{ backgroundColor: bgColor }}>
            <div ref={qrRef} />
          </div>
          <p className="text-slate-900 font-bold mb-1 text-center truncate w-full px-4">{link.title || link.short_code}</p>
          <a href={url} target="_blank" rel="noreferrer" className="text-[#0b5cff] hover:underline text-xs font-medium text-center break-all max-w-[200px]">
            {url}
          </a>
          <Button onClick={downloadQR} className="bitly-button-primary w-full mt-6">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>

        {/* Right Side: Customization */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#f26d21]" /> Customize QR
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded-md">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex border-b border-slate-100 px-6 shrink-0">
            <button 
              onClick={() => setActiveTab('design')} 
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'design' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Palette className="h-4 w-4" /> Design
            </button>
            <button 
              onClick={() => setActiveTab('logo')} 
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logo' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <ImageIcon className="h-4 w-4" /> Logo
            </button>
            <button 
              onClick={() => setActiveTab('shape')} 
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'shape' ? 'border-[#0b5cff] text-[#0b5cff]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Settings2 className="h-4 w-4" /> Shapes
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">QR Color 1</label>
                  <div className="flex gap-3 flex-wrap">
                    {FG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setFgColor(c)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${fgColor === c ? 'border-[#0b5cff] scale-110 shadow-md ring-2 ring-[#0b5cff]/20' : 'border-slate-200 hover:scale-105 hover:border-slate-300'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                        type="button"
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="qrGradient"
                    checked={qrGradient}
                    onChange={(e) => setQrGradient(e.target.checked)}
                    className="rounded text-[#0b5cff] focus:ring-[#0b5cff]"
                  />
                  <label htmlFor="qrGradient" className="text-sm font-bold text-slate-700 cursor-pointer flex-1">Enable Gradient QR</label>
                  
                  {qrGradient && (
                    <input 
                      type="color" 
                      value={qrGradientColor2} 
                      onChange={(e) => setQrGradientColor2(e.target.value)} 
                      className="w-8 h-8 p-0 border-0 rounded cursor-pointer" 
                      title="Gradient Color 2"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Background Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {BG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${bgColor === c ? 'border-[#0b5cff] scale-110 shadow-md ring-2 ring-[#0b5cff]/20' : 'border-slate-200 hover:scale-105 hover:border-slate-300'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                        type="button"
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logo' && (
              <div className="space-y-4">
                <Input
                  label={<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Logo Image URL</span>}
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="bitly-input"
                />
                <p className="text-xs text-slate-500">
                  Tip: Use a square image with a transparent background for best results. Leave blank for no logo.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setLogoUrl('https://cdn-icons-png.flaticon.com/512/174/174855.png')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-medium text-slate-700 transition-colors">Instagram</button>
                  <button onClick={() => setLogoUrl('https://cdn-icons-png.flaticon.com/512/733/733590.png')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-medium text-slate-700 transition-colors">WhatsApp</button>
                  <button onClick={() => setLogoUrl('https://cdn-icons-png.flaticon.com/512/281/281769.png')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-medium text-slate-700 transition-colors">Gmail</button>
                </div>
              </div>
            )}

            {activeTab === 'shape' && (
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Pattern Style (Dots)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DOTS_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setDotsType(type.id)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${dotsType === type.id ? 'border-[#0b5cff] bg-[#0b5cff]/5 text-[#0b5cff]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Corner Square Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CORNERS_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setCornersType(type.id)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${cornersType === type.id ? 'border-[#0b5cff] bg-[#0b5cff]/5 text-[#0b5cff]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Corner Dot Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CORNERS_DOT_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setCornersDotType(type.id)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${cornersDotType === type.id ? 'border-[#0b5cff] bg-[#0b5cff]/5 text-[#0b5cff]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
