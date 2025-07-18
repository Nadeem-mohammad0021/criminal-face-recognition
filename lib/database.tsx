"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface Person {
  id: string
  name: string
  status: string
  image: string
  notes?: string
  timestamp: string
}

interface DetectionResult {
  image: string
  faces: any[]
  timestamp: string
  source: "camera" | "upload"
}

interface DatabaseContextType {
  persons: Person[]
  detectionResults: DetectionResult[]
  addPerson: (person: Omit<Person, "id">) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  searchPersons: (query: string) => Person[]
  addDetectionResult: (result: DetectionResult) => void
  clearDetectionResults: () => void
  exportDatabase: () => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [persons, setPersons] = useState<Person[]>([])
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([])

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedPersons = localStorage.getItem("faceRecognitionDB")
    if (storedPersons) {
      try {
        setPersons(JSON.parse(storedPersons))
      } catch (error) {
        console.error("Failed to parse stored persons:", error)
      }
    }

    const storedResults = localStorage.getItem("faceRecognitionResults")
    if (storedResults) {
      try {
        setDetectionResults(JSON.parse(storedResults))
      } catch (error) {
        console.error("Failed to parse stored results:", error)
      }
    }
  }, [])

  // Save persons to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("faceRecognitionDB", JSON.stringify(persons))
  }, [persons])

  // Save detection results to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("faceRecognitionResults", JSON.stringify(detectionResults))
  }, [detectionResults])

  const addPerson = (person: Omit<Person, "id">) => {
    const newPerson = {
      id: Date.now().toString(),
      ...person,
    }
    setPersons((prev) => [...prev, newPerson])
  }

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPersons((prev) => prev.map((person) => (person.id === id ? { ...person, ...updates } : person)))
  }

  const deletePerson = (id: string) => {
    setPersons((prev) => prev.filter((person) => person.id !== id))
  }

  const searchPersons = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return persons.filter(
      (person) =>
        person.name.toLowerCase().includes(lowercaseQuery) ||
        (person.notes && person.notes.toLowerCase().includes(lowercaseQuery)),
    )
  }

  const addDetectionResult = (result: DetectionResult) => {
    setDetectionResults((prev) => [result, ...prev])
  }

  const clearDetectionResults = () => {
    setDetectionResults([])
  }

  const exportDatabase = () => {
    // Create export object
    const exportData = {
      persons,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2)

    // Create download link
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `face_recognition_export_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DatabaseContext.Provider
      value={{
        persons,
        detectionResults,
        addPerson,
        updatePerson,
        deletePerson,
        searchPersons,
        addDetectionResult,
        clearDetectionResults,
        exportDatabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}

