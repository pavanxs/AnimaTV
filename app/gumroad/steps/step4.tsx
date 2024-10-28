// File Purpose: Fourth step of video creation process with audio transcription
// Functionality: Transcribes audio and displays generation progress

'use client'

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Wand2, ImageIcon, Film, AudioLines, Check } from "lucide-react"

// Define the generation states
type GenerationState = {
  id: number
  title: string
  description: string
  icon: React.ElementType
  progress: number
}

interface TranscriptionResponse {
  text: string
  timestamps: Array<{
    text: string
    start: number
    end: number
  }>
}

const states: GenerationState[] = [
  {
    id: 1,
    title: "Audio Transcription",
    description: "Converting your audio to text",
    icon: AudioLines,
    progress: 25
  },
  {
    id: 2,
    title: "Prompt Generation",
    description: "Creating prompts for image generation",
    icon: Wand2,
    progress: 50
  },
  {
    id: 3,
    title: "Image Generation",
    description: "Generating images for each scene",
    icon: ImageIcon,
    progress: 75
  },
  {
    id: 4,
    title: "Video Generation",
    description: "Combining everything into final video",
    icon: Film,
    progress: 100
  }
]

interface ImagePrompt {
  segment: string
  prompt: string
  timestamp: {
    start: number
    end: number
  }
}

export default function Step4Component({ 
  onComplete,
  audioURL,
  audioBlob 
}: { 
  onComplete: () => void
  audioURL: string
  audioBlob: Blob
}) {
  const [currentStateIndex, setCurrentStateIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null)
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([])

  // Function to generate image prompt for a text segment
  const generateImagePrompt = async (text: string, timestamp: { start: number, end: number }) => {
    console.log('~~~~~Pop~~~~~~ Generating image prompt for:', text)
    
    try {
      const systemMessage = "You are an expert at converting narrative text into detailed image generation prompts. Create vivid, descriptive prompts that capture the essence of the narrative in a visual way. Focus on style, mood, composition, and important details."
      
      const promptText = `Convert this narrative text into a detailed image generation prompt. Focus on visual elements, style, and mood: "${text}"`

      const formData = new URLSearchParams()
      formData.append('prompt', promptText)
      formData.append('model_id', 'gpt-4') // or your preferred model
      formData.append('system_msg', systemMessage)
      formData.append('temperature', '0.7')
      formData.append('max_tokens', '256')

      const response = await fetch('https://dream-gateway.livepeer.cloud/llm', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_API_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      const data = await response.json()
      console.log('~~~~~Pop~~~~~~ LLM Response:', data)

      return {
        segment: text,
        prompt: data.response,
        timestamp
      }
    } catch (error) {
      console.error('~~~~~Pop~~~~~~ Error generating image prompt:', error)
      return null
    }
  }

  // Function to process transcription segments
  const processTranscriptionSegments = async (segments: Array<{text: string, start: number, end: number}>) => {
    console.log('~~~~~Pop~~~~~~ Processing transcription segments:', segments)
    
    const prompts = []
    for (const segment of segments) {
      const prompt = await generateImagePrompt(segment.text, {
        start: segment.start,
        end: segment.end
      })
      if (prompt) {
        prompts.push(prompt)
      }
    }

    console.log('~~~~~Pop~~~~~~ Generated image prompts:', prompts)
    setImagePrompts(prompts)
    return prompts
  }

  // Modify the transcribeAudio function
  const transcribeAudio = async (audioBlob: Blob) => {
    console.log('~~~~~Pop~~~~~~ Starting audio transcription...')
    
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('model', 'whisper-1')
      formData.append('response_format', 'verbose_json')
      formData.append('timestamp_granularities', ['word', 'segment'])

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('~~~~~Pop~~~~~~ Transcription completed:', data)

      // Process segments and generate image prompts
      const segments = data.segments.map((segment: any) => ({
        text: segment.text,
        start: segment.start,
        end: segment.end
      }))

      await processTranscriptionSegments(segments)

      setTranscription({
        text: data.text,
        timestamps: segments
      })

      setCurrentStateIndex(prev => prev + 1)
      
    } catch (error) {
      console.error('~~~~~Pop~~~~~~ Transcription error:', error)
    }
  }

  // Start transcription when component mounts
  useEffect(() => {
    console.log('Component mounted with audio:', { audioURL, audioBlob })
    if (audioBlob) {
      transcribeAudio(audioBlob)
    }
  }, [audioBlob])

  // Progress simulation effect
  useEffect(() => {
    console.log('Starting progress simulation for state:', currentStateIndex)
    
    const timer = setInterval(() => {
      if (currentStateIndex < states.length) {
        setProgress(prev => {
          const newProgress = prev + 1
          console.log('Progress update:', { 
            currentState: states[currentStateIndex].title, 
            progress: newProgress 
          })
          
          if (newProgress >= states[currentStateIndex].progress) {
            setCurrentStateIndex(current => {
              if (current === states.length - 1) {
                console.log('All states completed, clearing timer')
                clearInterval(timer)
                setTimeout(() => {
                  console.log('Triggering completion callback')
                  onComplete()
                }, 1000)
                return current
              }
              console.log('Moving to next state:', current + 1)
              return current + 1
            })
            return prev
          }
          return newProgress
        })
      }
    }, 100)

    return () => {
      console.log('Cleaning up timer')
      clearInterval(timer)
    }
  }, [currentStateIndex, onComplete])

  // Debug logging for state changes
  useEffect(() => {
    console.log('State changed:', {
      currentStateIndex,
      progress,
      transcription: transcription ? 'Available' : 'Not available'
    })
  }, [currentStateIndex, progress, transcription])

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="space-y-8">
          {/* Progress section remains the same */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generation Progress</span>
              <span>{Math.min(progress, 100)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* State indicators section remains the same */}
          <div className="space-y-6">
            {states.map((state, index) => {
              const isComplete = index < currentStateIndex
              const isCurrent = index === currentStateIndex
              const isPending = index > currentStateIndex

              return (
                <div
                  key={state.id}
                  className={`flex items-center gap-4 ${
                    isPending ? 'text-muted-foreground' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isComplete
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-primary/20'
                          : 'bg-muted'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <state.icon className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="font-medium">{state.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {state.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Debug information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 space-y-4">
              {transcription && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <h3 className="font-semibold mb-2">Debug: Transcription</h3>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(transcription, null, 2)}
                  </pre>
                </div>
              )}
              
              {imagePrompts.length > 0 && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <h3 className="font-semibold mb-2">Debug: Image Prompts</h3>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(imagePrompts, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
