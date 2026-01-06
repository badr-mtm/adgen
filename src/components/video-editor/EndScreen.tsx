import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import type { EndScreenSettings, QRCodeSettings } from "@/types/videoEditor";

interface EndScreenProps {
  settings: EndScreenSettings;
  qrSettings: QRCodeSettings;
  brandName: string;
  brandLogo?: string;
  isActive: boolean;
}

const EndScreen = ({ settings, qrSettings, brandName, brandLogo, isActive }: EndScreenProps) => {
  if (!settings.enabled || !isActive) return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 z-20"
      style={{
        backgroundColor: settings.backgroundColor,
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 space-y-6">
        {/* Logo */}
        {settings.showLogo && (
          <div className="mb-4">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-16 w-auto" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-4xl font-bold text-white">{brandName?.charAt(0) || "B"}</span>
              </div>
            )}
          </div>
        )}

        {/* Brand Name */}
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
          {brandName}
        </h2>

        {/* CTA Button */}
        {settings.ctaText && (
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 py-6 text-lg rounded-[20px] shadow-2xl transition-transform hover:scale-105 border border-white/10"
          >
            {settings.ctaText}
          </Button>
        )}

        {/* QR Code on End Screen */}
        {qrSettings.enabled && qrSettings.url && (
          <div className="mt-6 p-4 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5">
            <QrCode className="h-20 w-20 text-black" />
            <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest max-w-[120px] truncate">{qrSettings.url.replace('https://', '')}</p>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
    </div>
  );
};

export default EndScreen;
