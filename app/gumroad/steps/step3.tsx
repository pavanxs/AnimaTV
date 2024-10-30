// File Purpose: Third step of video creation process - audio recording and upload
// Functionality: Allows users to record audio or upload existing audio files

'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mic, Square, Play, Upload, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Step3Component({ 
  onSubmit 
}: { 
  onSubmit: (e: React.FormEvent<Element>, audioUrl: string, audioBlob: Blob) => void 
}) {
  // State for recording
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Refs for media handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle recording start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  // Handle recording stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      setAudioURL(url)
      setRecordingTime(0)
    }
  }

  // Handle audio playback
  const togglePlayback = () => {
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause()
      } else {
        audioElementRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle audio deletion
  const deleteAudio = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
      setAudioURL(null)
      setRecordingTime(0)
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Handling form submission...')

    if (audioURL) {
      try {
        // Get the blob from the URL
        const response = await fetch(audioURL)
        const blob = await response.blob()
        console.log('Audio blob created:', { size: blob.size, type: blob.type })

        onSubmit(e, audioURL, blob)
      } catch (error) {
        console.error('Error preparing audio data:', error)
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Record or Upload Audio</h2>
          <p className="text-muted-foreground text-center">
            Record your narration or upload an existing audio file
          </p>
        </div>

        <Card className="p-6">
          {/* Recording Controls */}
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              {!audioURL && (
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "default"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-40"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Timer/Duration */}
            {(isRecording || audioURL) && (
              <div className="text-center text-2xl font-mono">
                {formatTime(recordingTime)}
              </div>
            )}

            {/* Audio Player */}
            {audioURL && (
              <div className="space-y-4">
                <audio
                  ref={audioElementRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={deleteAudio}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="audio-upload" className="text-center block">
              Or upload an audio file
            </Label>
            <div className="flex justify-center">
              <Label
                htmlFor="audio-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </div>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={!audioURL}
        >
          Next Step
        </Button>

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            Please ensure your audio is clear and concise. The video will be generated based on your narration timing.
          </AlertDescription>
        </Alert>
      </form>
    </div>
  )
}
