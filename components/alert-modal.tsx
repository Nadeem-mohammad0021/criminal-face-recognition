"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useAlertSystem } from "@/lib/alert-system"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  alertDetails: {
    name: string
    status: string
  }
}

export default function AlertModal({ isOpen, onClose, alertDetails }: AlertModalProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const { sendAlert } = useAlertSystem()

  const handleSendAlert = async () => {
    if (!currentUser?.phone) {
      toast({
        title: "No phone number",
        description: "No phone number available to send alerts",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const defaultMessage = `ALERT: ${alertDetails.name} has been identified as a ${alertDetails.status.toUpperCase()}.`
      const alertMessage = message || defaultMessage

      await sendAlert(currentUser.phone, alertMessage)

      toast({
        title: "Alert sent",
        description: "The alert has been sent successfully",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Failed to send alert",
        description: "There was an error sending the alert",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Send Alert
          </DialogTitle>
          <DialogDescription>Send an alert notification about {alertDetails.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Recipient</p>
            <p className="bg-muted p-2 rounded-md">{currentUser?.phone || "No phone number available"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Default Message</p>
            <p className="bg-muted p-2 rounded-md">
              ALERT: {alertDetails.name} has been identified as a {alertDetails.status.toUpperCase()}.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Custom Message (optional)</p>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter custom alert message"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSendAlert} disabled={sending || !currentUser?.phone}>
            {sending ? "Sending..." : "Send Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

