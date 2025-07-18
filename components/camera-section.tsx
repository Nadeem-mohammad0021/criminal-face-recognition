"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CameraOff, FlipHorizontal, Pause, Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFaceDetection } from "@/lib/face-detection"
import { useDatabase } from "@/lib/database"

export default function CameraSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const { toast } = useToast()
  const { detectFaces, drawFaceRectangles } = useFaceDetection()
  const { addDetectionResult } = useDatabase()

  // Modify the startCamera function
  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera()
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsActive(true)
        setIsPaused(false)

        toast({
          title: "Camera started",
          description: "Face detection is now active",
        })
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsActive(false)

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      toast({
        title: "Camera stopped",
      })
    }
  }

  const togglePause = () => {
    if (isPaused) {
      if (videoRef.current) {
        videoRef.current.play()
        // Start face detection loop
        // startFaceDetection() // Removed to useEffect
      }
      setIsPaused(false)
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setIsPaused(true)
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    if (isActive) {
      // Restart camera with new facing mode
      startCamera()
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data URL
    const imageDataURL = canvas.toDataURL("image/jpeg")

    // Process the captured image
    processImage(imageDataURL)
  }

  const processImage = async (imageDataURL: string) => {
    // Create an image element to get dimensions
    const img = new Image()
    img.onload = async () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image to canvas
      ctx.drawImage(img, 0, 0)

      // Get image data for detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Detect faces
      const faces = await detectFaces(imageData)

      // Draw face rectangles
      drawFaceRectangles(ctx, faces)

      // Add to detection results
      if (faces.length > 0) {
        addDetectionResult({
          image: imageDataURL,
          faces: faces,
          timestamp: new Date().toISOString(),
          source: "camera",
        })

        toast({
          title: `${faces.length} face(s) detected`,
          description: "Image saved to results",
        })
      } else {
        toast({
          title: "No faces detected",
          description: "Try adjusting the camera or lighting",
        })
      }
    }

    img.src = imageDataURL
  }

  // Modify the startFaceDetection function to prevent infinite loops
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isPaused) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    let animationFrameId: number

    const detectFrame = async () => {
      if (!isActive || !stream || isPaused) {
        cancelAnimationFrame(animationFrameId)
        return
      }

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      try {
        // Detect faces
        const faces = await detectFaces(imageData)

        // Draw face rectangles
        drawFaceRectangles(ctx, faces)

        // Continue detection loop
        if (isActive && !isPaused) {
          animationFrameId = requestAnimationFrame(detectFrame)
        }
      } catch (error) {
        console.error("Face detection error:", error)
        animationFrameId = requestAnimationFrame(detectFrame)
      }
    }

    detectFrame()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isActive, isPaused, stream, detectFaces, drawFaceRectangles])

  // Use useEffect to manage the face detection loop
  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (isActive && !isPaused && videoRef.current) {
      cleanup = startFaceDetection()
    }

    return () => {
      if (cleanup) cleanup()
    }
  }, [isActive, isPaused, startFaceDetection])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Live Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="video-container bg-muted rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className={isActive ? "" : "hidden"} />
          <canvas ref={canvasRef} className={isActive ? "" : "hidden"} />

          {!isActive && (
            <div className="flex items-center justify-center h-full">
              <CameraOff className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {!isActive ? (
            <Button onClick={startCamera}>
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={togglePause} variant="outline">
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>

              <Button onClick={captureImage} variant="secondary">
                Capture
              </Button>

              <Button onClick={switchCamera} variant="outline">
                <FlipHorizontal className="h-4 w-4 mr-2" />
                Switch Camera
              </Button>

              <Button onClick={stopCamera} variant="destructive">
                <CameraOff className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

