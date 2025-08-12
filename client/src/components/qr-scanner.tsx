import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

interface QRScannerProps {
  sessionResult: { sessionId: string; pairingCode?: string } | null;
}

export default function QRScanner({ sessionResult }: QRScannerProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (sessionResult?.sessionId && !sessionResult.pairingCode) {
      // Simulate QR code generation - in real implementation, this would come from Baileys
      setQrCode("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiLz4KICA8ZyBmaWxsPSJibGFjayI+CiAgICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPgogICAgPHJlY3QgeD0iODAiIHk9IjIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz4KICAgIDxyZWN0IHg9IjE0MCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPgogICAgPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz4KICAgIDxyZWN0IHg9IjE0MCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPgogICAgPHJlY3QgeD0iMjAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIi8+CiAgICA8cmVjdCB4PSI4MCIgeT0iMTQwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz4KICAgIDxyZWN0IHg9IjE0MCIgeT0iMTQwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz4KICA8L2c+Cjwvc3ZnPgo=");
      setIsConnecting(true);
    }
  }, [sessionResult]);

  if (!qrCode) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 max-w-sm mx-auto">
        <div className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4">
          <div className="text-center">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click "Generate QR Code" to start</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8 max-w-sm mx-auto">
      <div className="w-48 h-48 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center mx-auto mb-4 overflow-hidden">
        <img 
          src={qrCode} 
          alt="WhatsApp QR Code" 
          className="w-full h-full object-contain"
        />
      </div>
      {isConnecting && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <span>Waiting for scan...</span>
        </div>
      )}
    </div>
  );
}
