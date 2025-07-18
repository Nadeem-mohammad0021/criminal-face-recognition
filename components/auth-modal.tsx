"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab: "login" | "signup"
}

export default function AuthModal({ isOpen, onClose, defaultTab }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
  })
  const { login, signup } = useAuth()
  const { toast } = useToast()

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password",
        variant: "destructive",
      })
      return
    }

    try {
      await login(loginData.username, loginData.password)
      toast({
        title: "Login successful",
        description: "You are now logged in",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      })
    }
  }

  const handleSignup = async () => {
    if (!signupData.username || !signupData.password || !signupData.confirmPassword || !signupData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      await signup(signupData.username, signupData.password, signupData.phone, signupData.email)
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Username may already exist",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Login or create an account to use all features</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="loginUsername">Username</Label>
              <Input
                id="loginUsername"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginPassword">Password</Label>
              <Input
                id="loginPassword"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="signupUsername">Username</Label>
              <Input
                id="signupUsername"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupPassword">Password</Label>
              <Input
                id="signupPassword"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
              <Input
                id="signupConfirmPassword"
                type="password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupPhone">Phone Number (for alerts)</Label>
              <Input
                id="signupPhone"
                type="tel"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupEmail">Email (optional)</Label>
              <Input
                id="signupEmail"
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSignup} className="w-full">
                Create Account
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

