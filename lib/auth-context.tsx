"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  username: string
  phone?: string
  email?: string
}

interface AuthContextType {
  currentUser: User | null
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, phone: string, email?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const login = async (username: string, password: string) => {
    // In a real app, this would be an API call
    return new Promise<void>((resolve, reject) => {
      try {
        // Get users from localStorage
        const storedUsers = localStorage.getItem("faceRecognitionUsers")
        const users = storedUsers ? JSON.parse(storedUsers) : []

        // Find matching user
        const user = users.find((u: any) => u.username === username && u.password === password)

        if (user) {
          // Create user object without password
          const authenticatedUser = {
            id: user.id,
            username: user.username,
            phone: user.phone,
            email: user.email,
          }

          // Store in state and localStorage
          setCurrentUser(authenticatedUser)
          localStorage.setItem("currentUser", JSON.stringify(authenticatedUser))
          resolve()
        } else {
          reject(new Error("Invalid credentials"))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  const signup = async (username: string, password: string, phone: string, email?: string) => {
    // In a real app, this would be an API call
    return new Promise<void>((resolve, reject) => {
      try {
        // Get users from localStorage
        const storedUsers = localStorage.getItem("faceRecognitionUsers")
        const users = storedUsers ? JSON.parse(storedUsers) : []

        // Check if username already exists
        if (users.some((u: any) => u.username === username)) {
          reject(new Error("Username already exists"))
          return
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          username,
          password,
          phone,
          email,
          createdAt: new Date().toISOString(),
        }

        // Add to users array
        users.push(newUser)
        localStorage.setItem("faceRecognitionUsers", JSON.stringify(users))

        // Create user object without password
        const authenticatedUser = {
          id: newUser.id,
          username: newUser.username,
          phone: newUser.phone,
          email: newUser.email,
        }

        // Store in state and localStorage
        setCurrentUser(authenticatedUser)
        localStorage.setItem("currentUser", JSON.stringify(authenticatedUser))
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ currentUser, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

