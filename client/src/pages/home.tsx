import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Smartphone, QrCode, Key, Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { linkSession, checkSessionStatus } from "@/lib/api";
import QRScanner from "@/components/qr-scanner";
import { Link } from "wouter";

export default function Home() {
  const [method, setMethod] = useState<"qr" | "pairing">("qr");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [sessionResult, setSessionResult] = useState<{ sessionId: string; pairingCode?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>("connecting");
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  const linkMutation = useMutation({
    mutationFn: linkSession,
    onSuccess: (data) => {
      setSessionResult(data);
      setSessionStatus("connecting");
      setIsPolling(true);
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

  // Poll session status when a session is created
  useEffect(() => {
    if (!isPolling || !sessionResult?.sessionId) return;

    const pollStatus = async () => {
      try {
        const statusData = await checkSessionStatus(sessionResult.sessionId);
        setSessionStatus(statusData.status);
        
        if (statusData.status === "active") {
          setIsPolling(false);
          toast({
            title: "Session Linked!",
            description: "Your WhatsApp has been successfully linked. Check your phone for confirmation.",
          });
        } else if (statusData.status === "failed") {
          setIsPolling(false);
          toast({
            title: "Session Failed",
            description: "Failed to link WhatsApp session. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to check session status:", error);
      }
    };

    const interval = setInterval(pollStatus, 3000); // Poll every 3 seconds
    
    // Stop polling after 5 minutes to prevent infinite polling
    const timeout = setTimeout(() => {
      setIsPolling(false);
      clearInterval(interval);
      if (sessionStatus === "connecting") {
        toast({
          title: "Session Timeout",
          description: "Session linking timed out. Please try again.",
          variant: "destructive",
        });
      }
    }, 300000); // 5 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isPolling, sessionResult?.sessionId, sessionStatus, toast]);

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
                    {!sessionResult && (
                      <div className="max-w-sm mx-auto">
                        <div className="bg-gray-50 rounded-lg p-6 mb-4">
                          <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </Label>
                          <div className="flex">
                            <Select value={countryCode} onValueChange={setCountryCode}>
                              <SelectTrigger className="w-24 rounded-r-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+7">🇷🇺 +7</SelectItem>
                              <SelectItem value="+20">🇪🇬 +20</SelectItem>
                              <SelectItem value="+27">🇿🇦 +27</SelectItem>
                              <SelectItem value="+30">🇬🇷 +30</SelectItem>
                              <SelectItem value="+31">🇳🇱 +31</SelectItem>
                              <SelectItem value="+32">🇧🇪 +32</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                              <SelectItem value="+34">🇪🇸 +34</SelectItem>
                              <SelectItem value="+36">🇭🇺 +36</SelectItem>
                              <SelectItem value="+39">🇮🇹 +39</SelectItem>
                              <SelectItem value="+40">🇷🇴 +40</SelectItem>
                              <SelectItem value="+41">🇨🇭 +41</SelectItem>
                              <SelectItem value="+43">🇦🇹 +43</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+45">🇩🇰 +45</SelectItem>
                              <SelectItem value="+46">🇸🇪 +46</SelectItem>
                              <SelectItem value="+47">🇳🇴 +47</SelectItem>
                              <SelectItem value="+48">🇵🇱 +48</SelectItem>
                              <SelectItem value="+49">🇩🇪 +49</SelectItem>
                              <SelectItem value="+51">🇵🇪 +51</SelectItem>
                              <SelectItem value="+52">🇲🇽 +52</SelectItem>
                              <SelectItem value="+53">🇨🇺 +53</SelectItem>
                              <SelectItem value="+54">🇦🇷 +54</SelectItem>
                              <SelectItem value="+55">🇧🇷 +55</SelectItem>
                              <SelectItem value="+56">🇨🇱 +56</SelectItem>
                              <SelectItem value="+57">🇨🇴 +57</SelectItem>
                              <SelectItem value="+58">🇻🇪 +58</SelectItem>
                              <SelectItem value="+60">🇲🇾 +60</SelectItem>
                              <SelectItem value="+61">🇦🇺 +61</SelectItem>
                              <SelectItem value="+62">🇮🇩 +62</SelectItem>
                              <SelectItem value="+63">🇵🇭 +63</SelectItem>
                              <SelectItem value="+64">🇳🇿 +64</SelectItem>
                              <SelectItem value="+65">🇸🇬 +65</SelectItem>
                              <SelectItem value="+66">🇹🇭 +66</SelectItem>
                              <SelectItem value="+81">🇯🇵 +81</SelectItem>
                              <SelectItem value="+82">🇰🇷 +82</SelectItem>
                              <SelectItem value="+84">🇻🇳 +84</SelectItem>
                              <SelectItem value="+86">🇨🇳 +86</SelectItem>
                              <SelectItem value="+90">🇹🇷 +90</SelectItem>
                              <SelectItem value="+91">🇮🇳 +91</SelectItem>
                              <SelectItem value="+92">🇵🇰 +92</SelectItem>
                              <SelectItem value="+93">🇦🇫 +93</SelectItem>
                              <SelectItem value="+94">🇱🇰 +94</SelectItem>
                              <SelectItem value="+95">🇲🇲 +95</SelectItem>
                              <SelectItem value="+98">🇮🇷 +98</SelectItem>
                              <SelectItem value="+212">🇲🇦 +212</SelectItem>
                              <SelectItem value="+213">🇩🇿 +213</SelectItem>
                              <SelectItem value="+216">🇹🇳 +216</SelectItem>
                              <SelectItem value="+218">🇱🇾 +218</SelectItem>
                              <SelectItem value="+220">🇬🇲 +220</SelectItem>
                              <SelectItem value="+221">🇸🇳 +221</SelectItem>
                              <SelectItem value="+222">🇲🇷 +222</SelectItem>
                              <SelectItem value="+223">🇲🇱 +223</SelectItem>
                              <SelectItem value="+224">🇬🇳 +224</SelectItem>
                              <SelectItem value="+225">🇨🇮 +225</SelectItem>
                              <SelectItem value="+226">🇧🇫 +226</SelectItem>
                              <SelectItem value="+227">🇳🇪 +227</SelectItem>
                              <SelectItem value="+228">🇹🇬 +228</SelectItem>
                              <SelectItem value="+229">🇧🇯 +229</SelectItem>
                              <SelectItem value="+230">🇲🇺 +230</SelectItem>
                              <SelectItem value="+231">🇱🇷 +231</SelectItem>
                              <SelectItem value="+232">🇸🇱 +232</SelectItem>
                              <SelectItem value="+233">🇬🇭 +233</SelectItem>
                              <SelectItem value="+234">🇳🇬 +234</SelectItem>
                              <SelectItem value="+235">🇹🇩 +235</SelectItem>
                              <SelectItem value="+236">🇨🇫 +236</SelectItem>
                              <SelectItem value="+237">🇨🇲 +237</SelectItem>
                              <SelectItem value="+238">🇨🇻 +238</SelectItem>
                              <SelectItem value="+239">🇸🇹 +239</SelectItem>
                              <SelectItem value="+240">🇬🇶 +240</SelectItem>
                              <SelectItem value="+241">🇬🇦 +241</SelectItem>
                              <SelectItem value="+242">🇨🇬 +242</SelectItem>
                              <SelectItem value="+243">🇨🇩 +243</SelectItem>
                              <SelectItem value="+244">🇦🇴 +244</SelectItem>
                              <SelectItem value="+245">🇬🇼 +245</SelectItem>
                              <SelectItem value="+246">🇮🇴 +246</SelectItem>
                              <SelectItem value="+248">🇸🇨 +248</SelectItem>
                              <SelectItem value="+249">🇸🇩 +249</SelectItem>
                              <SelectItem value="+250">🇷🇼 +250</SelectItem>
                              <SelectItem value="+251">🇪🇹 +251</SelectItem>
                              <SelectItem value="+252">🇸🇴 +252</SelectItem>
                              <SelectItem value="+253">🇩🇯 +253</SelectItem>
                              <SelectItem value="+254">🇰🇪 +254</SelectItem>
                              <SelectItem value="+255">🇹🇿 +255</SelectItem>
                              <SelectItem value="+256">🇺🇬 +256</SelectItem>
                              <SelectItem value="+257">🇧🇮 +257</SelectItem>
                              <SelectItem value="+258">🇲🇿 +258</SelectItem>
                              <SelectItem value="+260">🇿🇲 +260</SelectItem>
                              <SelectItem value="+261">🇲🇬 +261</SelectItem>
                              <SelectItem value="+262">🇷🇪 +262</SelectItem>
                              <SelectItem value="+263">🇿🇼 +263</SelectItem>
                              <SelectItem value="+264">🇳🇦 +264</SelectItem>
                              <SelectItem value="+265">🇲🇼 +265</SelectItem>
                              <SelectItem value="+266">🇱🇸 +266</SelectItem>
                              <SelectItem value="+267">🇧🇼 +267</SelectItem>
                              <SelectItem value="+268">🇸🇿 +268</SelectItem>
                              <SelectItem value="+269">🇰🇲 +269</SelectItem>
                              <SelectItem value="+290">🇸🇭 +290</SelectItem>
                              <SelectItem value="+291">🇪🇷 +291</SelectItem>
                              <SelectItem value="+297">🇦🇼 +297</SelectItem>
                              <SelectItem value="+298">🇫🇴 +298</SelectItem>
                              <SelectItem value="+299">🇬🇱 +299</SelectItem>
                              <SelectItem value="+350">🇬🇮 +350</SelectItem>
                              <SelectItem value="+351">🇵🇹 +351</SelectItem>
                              <SelectItem value="+352">🇱🇺 +352</SelectItem>
                              <SelectItem value="+353">🇮🇪 +353</SelectItem>
                              <SelectItem value="+354">🇮🇸 +354</SelectItem>
                              <SelectItem value="+355">🇦🇱 +355</SelectItem>
                              <SelectItem value="+356">🇲🇹 +356</SelectItem>
                              <SelectItem value="+357">🇨🇾 +357</SelectItem>
                              <SelectItem value="+358">🇫🇮 +358</SelectItem>
                              <SelectItem value="+359">🇧🇬 +359</SelectItem>
                              <SelectItem value="+370">🇱🇹 +370</SelectItem>
                              <SelectItem value="+371">🇱🇻 +371</SelectItem>
                              <SelectItem value="+372">🇪🇪 +372</SelectItem>
                              <SelectItem value="+373">🇲🇩 +373</SelectItem>
                              <SelectItem value="+374">🇦🇲 +374</SelectItem>
                              <SelectItem value="+375">🇧🇾 +375</SelectItem>
                              <SelectItem value="+376">🇦🇩 +376</SelectItem>
                              <SelectItem value="+377">🇲🇨 +377</SelectItem>
                              <SelectItem value="+378">🇸🇲 +378</SelectItem>
                              <SelectItem value="+380">🇺🇦 +380</SelectItem>
                              <SelectItem value="+381">🇷🇸 +381</SelectItem>
                              <SelectItem value="+382">🇲🇪 +382</SelectItem>
                              <SelectItem value="+383">🇽🇰 +383</SelectItem>
                              <SelectItem value="+385">🇭🇷 +385</SelectItem>
                              <SelectItem value="+386">🇸🇮 +386</SelectItem>
                              <SelectItem value="+387">🇧🇦 +387</SelectItem>
                              <SelectItem value="+389">🇲🇰 +389</SelectItem>
                              <SelectItem value="+420">🇨🇿 +420</SelectItem>
                              <SelectItem value="+421">🇸🇰 +421</SelectItem>
                              <SelectItem value="+423">🇱🇮 +423</SelectItem>
                              <SelectItem value="+500">🇫🇰 +500</SelectItem>
                              <SelectItem value="+501">🇧🇿 +501</SelectItem>
                              <SelectItem value="+502">🇬🇹 +502</SelectItem>
                              <SelectItem value="+503">🇸🇻 +503</SelectItem>
                              <SelectItem value="+504">🇭🇳 +504</SelectItem>
                              <SelectItem value="+505">🇳🇮 +505</SelectItem>
                              <SelectItem value="+506">🇨🇷 +506</SelectItem>
                              <SelectItem value="+507">🇵🇦 +507</SelectItem>
                              <SelectItem value="+508">🇵🇲 +508</SelectItem>
                              <SelectItem value="+509">🇭🇹 +509</SelectItem>
                              <SelectItem value="+590">🇬🇵 +590</SelectItem>
                              <SelectItem value="+591">🇧🇴 +591</SelectItem>
                              <SelectItem value="+592">🇬🇾 +592</SelectItem>
                              <SelectItem value="+593">🇪🇨 +593</SelectItem>
                              <SelectItem value="+594">🇬🇫 +594</SelectItem>
                              <SelectItem value="+595">🇵🇾 +595</SelectItem>
                              <SelectItem value="+596">🇲🇶 +596</SelectItem>
                              <SelectItem value="+597">🇸🇷 +597</SelectItem>
                              <SelectItem value="+598">🇺🇾 +598</SelectItem>
                              <SelectItem value="+599">🇨🇼 +599</SelectItem>
                              <SelectItem value="+670">🇹🇱 +670</SelectItem>
                              <SelectItem value="+672">🇦🇶 +672</SelectItem>
                              <SelectItem value="+673">🇧🇳 +673</SelectItem>
                              <SelectItem value="+674">🇳🇷 +674</SelectItem>
                              <SelectItem value="+675">🇵🇬 +675</SelectItem>
                              <SelectItem value="+676">🇹🇴 +676</SelectItem>
                              <SelectItem value="+677">🇸🇧 +677</SelectItem>
                              <SelectItem value="+678">🇻🇺 +678</SelectItem>
                              <SelectItem value="+679">🇫🇯 +679</SelectItem>
                              <SelectItem value="+680">🇵🇼 +680</SelectItem>
                              <SelectItem value="+681">🇼🇫 +681</SelectItem>
                              <SelectItem value="+682">🇨🇰 +682</SelectItem>
                              <SelectItem value="+683">🇳🇺 +683</SelectItem>
                              <SelectItem value="+684">🇦🇸 +684</SelectItem>
                              <SelectItem value="+685">🇼🇸 +685</SelectItem>
                              <SelectItem value="+686">🇰🇮 +686</SelectItem>
                              <SelectItem value="+687">🇳🇨 +687</SelectItem>
                              <SelectItem value="+688">🇹🇻 +688</SelectItem>
                              <SelectItem value="+689">🇵🇫 +689</SelectItem>
                              <SelectItem value="+690">🇹🇰 +690</SelectItem>
                              <SelectItem value="+691">🇫🇲 +691</SelectItem>
                              <SelectItem value="+692">🇲🇭 +692</SelectItem>
                              <SelectItem value="+850">🇰🇵 +850</SelectItem>
                              <SelectItem value="+852">🇭🇰 +852</SelectItem>
                              <SelectItem value="+853">🇲🇴 +853</SelectItem>
                              <SelectItem value="+855">🇰🇭 +855</SelectItem>
                              <SelectItem value="+856">🇱🇦 +856</SelectItem>
                              <SelectItem value="+880">🇧🇩 +880</SelectItem>
                              <SelectItem value="+886">🇹🇼 +886</SelectItem>
                              <SelectItem value="+960">🇲🇻 +960</SelectItem>
                              <SelectItem value="+961">🇱🇧 +961</SelectItem>
                              <SelectItem value="+962">🇯🇴 +962</SelectItem>
                              <SelectItem value="+963">🇸🇾 +963</SelectItem>
                              <SelectItem value="+964">🇮🇶 +964</SelectItem>
                              <SelectItem value="+965">🇰🇼 +965</SelectItem>
                              <SelectItem value="+966">🇸🇦 +966</SelectItem>
                              <SelectItem value="+967">🇾🇪 +967</SelectItem>
                              <SelectItem value="+968">🇴🇲 +968</SelectItem>
                              <SelectItem value="+970">🇵🇸 +970</SelectItem>
                              <SelectItem value="+971">🇦🇪 +971</SelectItem>
                              <SelectItem value="+972">🇮🇱 +972</SelectItem>
                              <SelectItem value="+973">🇧🇭 +973</SelectItem>
                              <SelectItem value="+974">🇶🇦 +974</SelectItem>
                              <SelectItem value="+975">🇧🇹 +975</SelectItem>
                              <SelectItem value="+976">🇲🇳 +976</SelectItem>
                              <SelectItem value="+977">🇳🇵 +977</SelectItem>
                              <SelectItem value="+992">🇹🇯 +992</SelectItem>
                              <SelectItem value="+993">🇹🇲 +993</SelectItem>
                              <SelectItem value="+994">🇦🇿 +994</SelectItem>
                              <SelectItem value="+995">🇬🇪 +995</SelectItem>
                              <SelectItem value="+996">🇰🇬 +996</SelectItem>
                              <SelectItem value="+998">🇺🇿 +998</SelectItem>
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
                    )}

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

            {sessionResult && method === "qr" && sessionStatus === "active" && (
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

            {sessionResult && method === "pairing" && sessionResult.pairingCode && sessionStatus !== "active" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto mt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Pairing Code Generated!</h3>
                <div className="space-y-3 text-sm">
                  <div className="text-blue-800">
                    <p className="font-medium">Status: {sessionStatus === "connecting" ? "Waiting for WhatsApp connection..." : sessionStatus}</p>
                    <p>Enter the pairing code above in WhatsApp to complete the setup.</p>
                  </div>
                </div>
              </div>
            )}

            {sessionResult && method === "pairing" && sessionStatus === "active" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto mt-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Session Successfully Linked!</h3>
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
                    <p className="font-medium">✅ Success!</p>
                    <p>• Your WhatsApp has been linked successfully</p>
                    <p>• A confirmation message has been sent to your WhatsApp</p>
                    <p>• Copy the Session ID above for your bot configuration</p>
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
