import { QrCode } from "lucide-react";
import type { BannerSettings, QRCodeSettings } from "@/types/videoEditor";

interface OverlayElementsProps {
  banner: BannerSettings;
  qrCode: QRCodeSettings;
}

const OverlayElements = ({ banner, qrCode }: OverlayElementsProps) => {
  const getQRPosition = () => {
    switch (qrCode.position) {
      case "top-left": return "top-4 left-4";
      case "top-right": return "top-4 right-4";
      case "bottom-left": return "bottom-24 left-4";
      case "bottom-right": return "bottom-24 right-4";
      default: return "top-4 right-4";
    }
  };

  const getBannerAlignment = () => {
    switch (banner.alignment) {
      case "left": return "text-left";
      case "right": return "text-right";
      default: return "text-center";
    }
  };

  return (
    <>
      {/* Banner */}
      {banner.enabled && (
        <div
          className={`absolute left-0 right-0 px-4 py-3 ${banner.position === "top" ? "top-0" : "bottom-0"
            } ${getBannerAlignment()} z-10`}
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
          className={`absolute ${getQRPosition()} z-10 scale-transition`}
          style={{ width: qrCode.size, height: qrCode.size }}
        >
          <div className="w-full h-full bg-white rounded-xl p-2 flex items-center justify-center shadow-2xl ring-1 ring-black/5">
            <QrCode className="w-full h-full text-black" />
          </div>
        </div>
      )}
    </>
  );
};

export default OverlayElements;
