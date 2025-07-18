"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, AlertTriangle, X } from "lucide-react"
import { useDatabase } from "@/lib/database"
import { useAudio } from "@/lib/use-audio"
import { useToast } from "@/components/ui/use-toast"

interface ResultsSectionProps {
  onSendAlert: (name: string, status: string) => void
}

export default function ResultsSection({ onSendAlert }: ResultsSectionProps) {
  const [showAlert, setShowAlert] = useState(false)
  const [alertDetails, setAlertDetails] = useState({ name: "", status: "" })
  const { detectionResults, clearDetectionResults } = useDatabase()
  const { play, stop, isPlaying } = useAudio("/alarm.mp3")
  const { toast } = useToast()

  // Get the most recent criminal detection if any
  useEffect(() => {
    // Only process if there are detection results and we're not already showing an alert
    if (detectionResults.length > 0 && !showAlert) {
      const criminals = detectionResults
        .filter((result) => result.faces.some((face) => face.isMatch && face.person?.status === "criminal"))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      if (criminals.length > 0) {
        const latestCriminal = criminals[0]
        const criminalFace = latestCriminal.faces.find((face) => face.isMatch && face.person?.status === "criminal")

        if (criminalFace?.person) {
          setAlertDetails({
            name: criminalFace.person.name,
            status: criminalFace.person.status,
          })
          setShowAlert(true)
          play()

          // Fallback visual alert if audio fails
          if (!isPlaying) {
            toast({
              title: "Criminal Detected!",
              description: `${criminalFace.person.name} has been identified as a criminal.`,
              variant: "destructive",
              duration: 10000, // 10 seconds
            })
          }
        }
      }
    }
  }, [detectionResults, play, isPlaying, toast, showAlert])

  const dismissAlert = () => {
    setShowAlert(false)
    stop()
  }

  const handleSendAlert = () => {
    onSendAlert(alertDetails.name, alertDetails.status)
    dismissAlert()
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Detection Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showAlert && (
          <Alert variant="destructive" className="mb-4 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              Criminal Detected!
              <Button variant="ghost" size="icon" onClick={dismissAlert} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                <strong>{alertDetails.name}</strong> has been identified as a criminal.
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="destructive" size="sm" onClick={handleSendAlert}>
                  Send Alert
                </Button>
                <Button variant="outline" size="sm" onClick={dismissAlert}>
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {detectionResults.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">No detection results yet</div>
          ) : (
            detectionResults.map((result, index) => (
              <div key={index} className="face-card bg-card rounded-md overflow-hidden shadow-sm border">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={result.image || "/placeholder.svg"}
                    alt="Detection result"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.faces.map(
                      (face, faceIndex) =>
                        face.isMatch &&
                        face.person && (
                          <span
                            key={faceIndex}
                            className={face.person.status === "criminal" ? "criminal-badge" : "safe-badge"}
                          >
                            {face.person.name}
                          </span>
                        ),
                    )}
                    {result.faces.filter((face) => !face.isMatch).length > 0 && (
                      <span className="bg-muted text-muted-foreground text-xs py-0.5 px-1.5 rounded inline-block mt-1">
                        {result.faces.filter((face) => !face.isMatch).length} unknown
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {detectionResults.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={clearDetectionResults}>
              Clear Results
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

