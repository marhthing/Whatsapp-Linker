import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Session } from "@shared/schema";

interface SessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionModal({ session, isOpen, onClose }: SessionModalProps) {
  if (!session) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      connecting: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
              <div className="font-mono text-sm text-gray-900 bg-gray-50 rounded p-2 break-all">
                {session.sessionId}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {getStatusBadge(session.status)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="text-sm text-gray-900">{session.phoneNumber || "Not set"}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Name</label>
              <div className="text-sm text-gray-900">{session.whatsappName || "Not available"}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <div className="text-sm text-gray-500">{formatDate(session.createdAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Seen</label>
              <div className="text-sm text-gray-500">{formatDate(session.lastActive)}</div>
            </div>
          </div>

          {session.pairingCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pairing Code</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-mono text-lg font-bold text-gray-900">{session.pairingCode}</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Data</label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {session.sessionData ? JSON.stringify(session.sessionData, null, 2) : "No session data available"}
              </pre>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline">
              Export Data
            </Button>
            <Button variant="secondary">
              Restart Session
            </Button>
            <Button variant="destructive">
              Delete Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
