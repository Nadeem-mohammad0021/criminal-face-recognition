"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onLogin: () => void
  onSignup: () => void
}

export default function Header({ onLogin, onSignup }: HeaderProps) {
  const { currentUser, logout } = useAuth()

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 border-b border-border">
      <h1 className="text-2xl font-bold text-primary mb-4 sm:mb-0">Criminal Face Recognition System</h1>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>{currentUser.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-sm text-muted-foreground">{currentUser.email || "No email provided"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-sm text-muted-foreground">{currentUser.phone || "No phone provided"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="outline" onClick={onLogin}>
              Login
            </Button>
            <Button onClick={onSignup}>Sign Up</Button>
          </>
        )}
      </div>
    </header>
  )
}

