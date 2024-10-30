// File Purpose: Fourth step of video creation process with audio transcription
// Functionality: Transcribes audio and displays generation progress

'use client'

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Wand2, ImageIcon, Film, AudioLines, Check, ArrowUpRight } from "lucide-react"
import { Livepeer } from "@livepeer/ai"
import { Button } from "@/components/ui/button"

// Initialize Livepeer client
const livepeerAI = new Livepeer({
  httpBearer: ""
})

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

interface ImageGeneration {
  url: string
  seed: number
  nsfw: boolean
}

interface ImagePrompt {
  segment: string
  prompt: string
  timestamp: {
    start: number
    end: number
  }
  generatedImage?: ImageGeneration
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
    console.log('🎨 Generating image prompt for text:', text)
    console.log('⏱️ Timestamp:', timestamp)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert at converting narrative text into detailed image generation prompts. Create vivid, descriptive prompts that capture the essence of the narrative in a visual way. Focus on style, mood, composition, lighting, and important details. Keep the prompt concise but detailed."
            },
            {
              role: "user",
              content: `Convert this narrative text into a detailed image generation prompt that could be used with DALL-E or Midjourney. Focus on visual elements, style, and mood. Text: "${text}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🤖 OpenAI Response:', data)
      
      const generatedPrompt = data.choices[0].message.content
      console.log('✨ Generated Image Prompt:', generatedPrompt)

      return {
        segment: text,
        prompt: generatedPrompt,
        timestamp
      }
    } catch (error) {
      console.error('❌ Error generating image prompt:', error)
      return null
    }
  }

  // Function to generate image from prompt using Livepeer
  const generateImageFromPrompt = async (prompt: string) => {
    console.log('🖼️ Generating image for prompt:', prompt)

    try {
      const result = await livepeerAI.generate.textToImage({
        prompt,
        modelId: "SG161222/RealVisXL_V4.0_Lightning",
        width: 1024,
        height: 1024
      })

      console.log('📷 Livepeer Image Response:', result.images)

      return result.images?.[0] || null
    } catch (error) {
      console.error('❌ Error generating image:', error)
      return null
    }
  }

  // Function to process transcription segments
  const processTranscriptionSegments = async (segments: Array<{text: string, start: number, end: number}>) => {
    console.log('📝 Processing transcription segments:', segments)
    
    const prompts = []
    for (const segment of segments) {
      console.log('🎯 Processing segment:', segment)
      const prompt = await generateImagePrompt(segment.text, {
        start: segment.start,
        end: segment.end
      })
      if (prompt) {
        console.log('✅ Generated prompt for segment:', prompt)

        // Generate image for the prompt
        const image = await generateImageFromPrompt(prompt.prompt)
        if (image) {
          console.log('✅ Generated image for prompt:', image)
          prompt.generatedImage = image
        }

        prompts.push(prompt)
      }
    }

    console.log('🎬 All generated image prompts with images:', prompts)
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
      const segments = data.segments.map((segment: { text: string; start: number; end: number }) => ({
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

          {/* Display generated images */}
          {imagePrompts.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-semibold">Generated Images</h3>
              {imagePrompts.map((prompt, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium">Segment {index + 1}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{prompt.segment}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Generated Prompt</h4>
                    <p className="text-sm text-muted-foreground mt-1">{prompt.prompt}</p>
                  </div>
                  
                  {prompt.generatedImage && (
                    <div>
                      <h4 className="font-medium mb-2">Generated Image</h4>
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={prompt.generatedImage.url}
                          alt={`Generated image for segment ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Seed: {prompt.generatedImage.seed}
                        {prompt.generatedImage.nsfw && (
                          <span className="ml-2 text-destructive">NSFW</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Timestamp: {prompt.timestamp.start}s - {prompt.timestamp.end}s
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add this after the generated images section, just before closing the main Card div */}
          {imagePrompts.length > 0 && (
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={() => {
                  console.log('🎬 Moving to final step')
                  onComplete()
                }}
                className="gap-2"
              >
                Continue to Final Step
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
