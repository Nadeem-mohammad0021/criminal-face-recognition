import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { DatabaseProvider } from "@/lib/database"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Criminal Face Recognition System",
  description: "Advanced face recognition system for security and surveillance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DatabaseProvider>
            {children}
            <Toaster />
          </DatabaseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'