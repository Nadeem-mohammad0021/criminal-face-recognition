"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import CameraSection from "@/components/camera-section"
import UploadSection from "@/components/upload-section"
import ResultsSection from "@/components/results-section"
import DatabaseSection from "@/components/database-section"
import AuthModal from "@/components/auth-modal"
import AlertModal from "@/components/alert-modal"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "signup">("login")
  const [alertDetails, setAlertDetails] = useState({ name: "", status: "" })
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleShowAuthModal = (tab: "login" | "signup") => {
    setAuthTab(tab)
    setShowAuthModal(true)
  }

  const handleShowAlertModal = (name: string, status: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to send alerts",
        variant: "destructive",
      })
      return
    }

    setAlertDetails({ name, status })
    setShowAlertModal(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Header onLogin={() => handleShowAuthModal("login")} onSignup={() => handleShowAuthModal("signup")} />

        {isMobile ? (
          <Tabs defaultValue="camera" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="mt-4">
              <CameraSection />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <UploadSection />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <CameraSection />
            <UploadSection />
          </div>
        )}

        <ResultsSection onSendAlert={handleShowAlertModal} />

        <DatabaseSection />
      </div>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authTab} />
      )}

      {showAlertModal && (
        <AlertModal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)} alertDetails={alertDetails} />
      )}
    </main>
  )
}

