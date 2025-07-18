"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFaceDetection } from "@/lib/face-detection"
import { useDatabase } from "@/lib/database"

export default function UploadSection() {
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("safe")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const { detectFaces, drawFaceRectangles } = useFaceDetection()
  const { addPerson, addDetectionResult } = useDatabase()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.match("image.*")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()

    reader.onload = async (event) => {
      if (event.target?.result) {
        const imageDataURL = event.target.result as string
        setImage(imageDataURL)
        processImage(imageDataURL)
      }
    }

    reader.readAsDataURL(file)
  }

  const processImage = async (imageDataURL: string) => {
    setProcessing(true)

    try {
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
            source: "upload",
          })

          toast({
            title: `${faces.length} face(s) detected`,
            description: "Image processed successfully",
          })
        } else {
          toast({
            title: "No faces detected",
            description: "Try uploading a clearer image",
          })
        }

        setProcessing(false)
      }

      img.src = imageDataURL
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Processing error",
        description: "Failed to process the image",
        variant: "destructive",
      })
      setProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !id) {
      toast({
        title: "Missing information",
        description: "Please provide a name and ID",
        variant: "destructive",
      })
      return
    }

    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      })
      return
    }

    // Add to database
    addPerson({
      name,
      id,
      notes,
      status,
      image,
      timestamp: new Date().toISOString(),
    })

    toast({
      title: "Person added",
      description: `${name} has been added to the database`,
    })

    // Reset form
    setName("")
    setId("")
    setNotes("")
    setStatus("safe")
    setImage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUpload" className="block mb-2">
                Select Image
              </Label>
              <Input
                ref={fileInputRef}
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {image && (
              <div className="preview-container bg-muted rounded-md">
                <img src={image || "/placeholder.svg"} alt="Preview" className="max-w-full max-h-full object-contain" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
              </div>
            )}

            {!image && (
              <div className="preview-container bg-muted rounded-md flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2" />
                <p>Upload an image to preview</p>
              </div>
            )}

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="personName">Full Name</Label>
                <Input
                  id="personName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="personId">ID Number</Label>
                <Input id="personId" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter ID number" />
              </div>

              <div>
                <Label htmlFor="personStatus">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">Safe</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="personNotes">Additional Notes</Label>
                <Textarea
                  id="personNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter additional information"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!image || processing || !name || !id}>
                Submit to Database
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

