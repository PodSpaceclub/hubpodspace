"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Copy, ExternalLink, Check } from "lucide-react";
import QRCode from "qrcode";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: { name: string; slug: string } | null;
}

export function QRCodeModal({ isOpen, onClose, partner }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const storeUrl = partner
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://podspaceclub.com.br"}/store/${partner.slug}`
    : "";

  useEffect(() => {
    if (!isOpen || !partner || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, storeUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: "#1A1A1A",
        light: "#FFFFFF",
      },
    });
  }, [isOpen, partner, storeUrl]);

  const handleDownload = () => {
    if (!canvasRef.current || !partner) return;
    const link = document.createElement("a");
    link.download = `qrcode-${partner.slug}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E8E8]">
          <div>
            <h2 className="font-display text-lg font-700 text-[#1A1A1A] uppercase">
              QR Code
            </h2>
            <p className="text-sm text-[#666666] mt-0.5">{partner.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors text-[#666666] hover:text-[#1A1A1A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Canvas */}
        <div className="flex flex-col items-center p-6 gap-4">
          <div className="p-3 bg-white rounded-xl border-2 border-[#E8E8E8]">
            <canvas ref={canvasRef} />
          </div>

          {/* URL */}
          <div className="w-full bg-[#F5F5F5] rounded-lg px-3 py-2.5 text-xs text-[#666666] break-all font-mono">
            {storeUrl}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#E8E8E8] text-sm font-medium text-[#666666] hover:border-[#3B3BFF] hover:text-[#3B3BFF] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar URL
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#3B3BFF] text-white text-sm font-medium hover:bg-[#2525DD] transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar PNG
            </button>
          </div>

          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#3B3BFF] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir loja em nova aba
          </a>
        </div>
      </div>
    </div>
  );
}
