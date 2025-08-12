import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Smartphone, QrCode, Key, Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { linkSession } from "@/lib/api";
import QRScanner from "@/components/qr-scanner";
import { Link } from "wouter";

export default function Home() {
  const [method, setMethod] = useState<"qr" | "pairing">("qr");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [sessionResult, setSessionResult] = useState<{ sessionId: string; pairingCode?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const linkMutation = useMutation({
    mutationFn: linkSession,
    onSuccess: (data) => {
      setSessionResult(data);
      toast({
        title: "Session Created",
        description: method === "qr" ? "QR code ready for scanning" : "Pairing code generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (method === "pairing" && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number for pairing code method",
        variant: "destructive",
      });
      return;
    }

    linkMutation.mutate({
      method,
      phoneNumber: method === "pairing" ? `${countryCode}${phoneNumber}` : undefined,
    });
  };

  const copySessionId = async () => {
    if (sessionResult?.sessionId) {
      await navigator.clipboard.writeText(sessionResult.sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Session ID copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">WhatsApp Bridge</h1>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <span className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                Link WhatsApp
              </span>
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  Admin Panel
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <CardContent className="px-6 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect Your WhatsApp</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Link your WhatsApp account to create a bot session. Choose between QR code or pairing code method.
            </p>

            {!sessionResult && (
              <>
                {/* Method Selection */}
                <div className="flex justify-center space-x-4 mb-8">
                  <Button
                    onClick={() => setMethod("qr")}
                    variant={method === "qr" ? "default" : "secondary"}
                    className="flex items-center space-x-2"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>QR Code</span>
                  </Button>
                  <Button
                    onClick={() => setMethod("pairing")}
                    variant={method === "pairing" ? "default" : "secondary"}
                    className="flex items-center space-x-2"
                  >
                    <Key className="w-5 h-5" />
                    <span>Pairing Code</span>
                  </Button>
                </div>

                {method === "qr" && (
                  <div className="space-y-6">
                    <QRScanner sessionResult={sessionResult} />
                    <div className="text-left max-w-md mx-auto bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">How to scan:</h4>
                      <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Open WhatsApp on your phone</li>
                        <li>2. Go to Settings → Linked Devices</li>
                        <li>3. Tap "Link a Device"</li>
                        <li>4. Scan the QR code above</li>
                      </ol>
                    </div>
                  </div>
                )}

                {method === "pairing" && (
                  <div className="space-y-6">
                    <div className="max-w-sm mx-auto">
                      <div className="bg-gray-50 rounded-lg p-6 mb-4">
                        <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </Label>
                        <div className="flex">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-20 rounded-r-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+1">+1</SelectItem>
                              <SelectItem value="+44">+44</SelectItem>
                              <SelectItem value="+91">+91</SelectItem>
                              <SelectItem value="+62">+62</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="tel"
                            placeholder="1234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="rounded-l-none border-l-0"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleSubmit} 
                        disabled={linkMutation.isPending}
                        className="w-full"
                      >
                        {linkMutation.isPending ? "Generating..." : "Generate Pairing Code"}
                      </Button>
                    </div>

                    {sessionResult?.pairingCode && (
                      <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto">
                        <h4 className="font-medium text-gray-900 mb-3">Your Pairing Code:</h4>
                        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
                          <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
                            {sessionResult?.pairingCode}
                          </div>
                          <p className="text-sm text-gray-500">Enter this in WhatsApp</p>
                        </div>
                        <div className="mt-4 text-left bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Steps:</h5>
                          <ol className="text-sm text-blue-800 space-y-1">
                            <li>1. Open WhatsApp → Settings</li>
                            <li>2. Go to Linked Devices</li>
                            <li>3. Tap "Link with Phone Number"</li>
                            <li>4. Enter the code above</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {method === "qr" && !sessionResult && (
                  <Button onClick={handleSubmit} disabled={linkMutation.isPending} className="mt-4">
                    {linkMutation.isPending ? "Generating QR Code..." : "Generate QR Code"}
                  </Button>
                )}
              </>
            )}

            {sessionResult && !sessionResult.pairingCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Session Created!</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-lg p-4 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">Session ID:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copySessionId}
                        className="h-auto p-1"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="font-mono text-xs text-gray-600 bg-gray-50 rounded p-2 break-all">
                      {sessionResult.sessionId}
                    </div>
                  </div>
                  <div className="text-green-800">
                    <p className="font-medium">Next steps:</p>
                    <p>Copy the Session ID above and add it to your bot's .env file as SESSION_ID</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
