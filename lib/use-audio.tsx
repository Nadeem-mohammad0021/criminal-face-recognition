"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useAudio(url: string) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Create audio element
    audio.current = new Audio(url)

    // Set properties
    if (audio.current) {
      audio.current.loop = true
    }

    // Cleanup
    return () => {
      if (audio.current) {
        audio.current.pause()
        audio.current = null
      }
    }
  }, [url])

  const play = useCallback(() => {
    if (audio.current && !isPlaying) {
      audio.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
          toast({
            title: "Audio Error",
            description: "Failed to play alert sound. Please check your audio settings.",
            variant: "destructive",
          })
        })
    }
  }, [isPlaying, toast])

  const stop = useCallback(() => {
    if (audio.current) {
      audio.current.pause()
      audio.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  return {
    play,
    stop,
    isPlaying,
  }
}

