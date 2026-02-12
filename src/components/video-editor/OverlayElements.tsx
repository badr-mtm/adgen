import { QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BannerSettings, QRCodeSettings, TitleSettings } from "@/types/videoEditor";

interface OverlayElementsProps {
  banner: BannerSettings;
  qrCode: QRCodeSettings;
  title?: TitleSettings;
}

const OverlayElements = ({ banner, qrCode, title }: OverlayElementsProps) => {
  const getBannerAlignment = () => {
    switch (banner.alignment) {
      case "left": return "text-left";
      case "right": return "text-right";
      default: return "text-center";
    }
  };

  const getTitlePosition = () => {
    switch (title?.position) {
      case "top-left": return "top-12 left-12";
      case "top-right": return "top-12 right-12 text-right";
      case "bottom-left": return "bottom-12 left-12";
      case "bottom-right": return "bottom-12 right-12 text-right";
      default: return "bottom-12 left-12";
    }
  };

  const getQRMarginPosition = () => {
    switch (qrCode.position) {
      case "top-left": return "top-10 left-10";
      case "top-right": return "top-10 right-10";
      case "bottom-left": return "bottom-10 left-10";
      case "bottom-right": return "bottom-10 right-10";
      default: return "top-10 right-10";
    }
  };

  return (
    <>
      {/* Banner */}
      {banner.enabled && (
        <div
          className={`absolute left-0 right-0 px-4 py-3 ${banner.position === "top" ? "top-0" : "bottom-0"
            } ${getBannerAlignment()} z-10 pointer-events-auto`}
          style={{ backgroundColor: banner.backgroundColor }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: banner.textColor }}
          >
            {banner.text}
          </p>
        </div>
      )}

      {/* QR Code */}
      {qrCode.enabled && qrCode.url && (
        <div
          className={`absolute ${getQRMarginPosition()} z-10 transition-all duration-300 pointer-events-auto`}
          style={{ width: `${qrCode.size}px`, height: `${qrCode.size}px` }}
        >
          <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col items-center justify-center shadow-2xl ring-1 ring-black/5 overflow-hidden group">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrCode.size}x${qrCode.size}&data=${encodeURIComponent(qrCode.url)}`}
              alt="QR Code"
              className="w-full h-full object-contain"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.qr-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="qr-fallback hidden w-full h-full items-center justify-center text-black">
              <QrCode className="w-2/3 h-2/3" />
            </div>
          </div>
        </div>
      )}

      {/* Title Overlays */}
      {title?.enabled && title.text && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none max-w-[80%] flex flex-col",
            getTitlePosition()
          )}
        >
          {/* Subtle gradient behind title for readability */}
          <div className="absolute inset-0 bg-black/40 blur-3xl -z-10 scale-150 transform translate-y-1/4 rounded-full" />

          <h1
            className="text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-[1.05] whitespace-pre-wrap"
            style={{ color: title.color }}
          >
            {title.text}
          </h1>
        </div>
      )}
    </>
  );
};

export default OverlayElements;