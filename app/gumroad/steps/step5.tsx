// File Purpose: Final step of video creation process - video display and distribution options
// Functionality: Shows generated video with options to upload to Livepeer or mint as NFT

'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  Coins, 
  CheckCircle2, 
  ArrowUpRight,
  Download
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Add interfaces at the top
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

interface TranscriptionResponse {
  text: string
  timestamps: Array<{
    text: string
    start: number
    end: number
  }>
}

interface Step5Props {
  transcription: TranscriptionResponse | null
  imagePrompts: ImagePrompt[]
  audioURL: string
  audioBlob: Blob
}

export default function Step5Component({
  transcription,
  imagePrompts,
  audioURL
}: Step5Props) {
  const [isLivepeerUploading, setIsLivepeerUploading] = useState(false)
  const [isZoraMinting, setIsZoraMinting] = useState(false)
  const [livepeerSuccess, setLivepeerSuccess] = useState(false)
  const [zoraMintSuccess, setZoraMintSuccess] = useState(false)

  // Simulate Livepeer upload
  const handleLivepeerUpload = async () => {
    setIsLivepeerUploading(true)
    // Simulated upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLivepeerUploading(false)
    setLivepeerSuccess(true)
  }

  // Simulate Zora NFT minting
  const handleZoraMint = async () => {
    setIsZoraMinting(true)
    // Simulated minting delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsZoraMinting(false)
    setZoraMintSuccess(true)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Generated Content Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Generated Content Summary</h2>
        
        {/* Audio Preview */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Original Audio Narration</h3>
          <audio controls className="w-full">
            <source src={audioURL} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Transcription</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{transcription.text}</p>
            </div>
          </div>
        )}

        {/* Generated Images and Prompts */}
        {imagePrompts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Generated Scenes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePrompts.map((prompt, index) => {
                console.log(`Rendering prompt ${index}:`, prompt)
                console.log(`Generated image data:`, prompt.generatedImage)

                return (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">Scene {index + 1}</h4>
                        <p className="text-xs text-muted-foreground">
                          {prompt.timestamp.start}s - {prompt.timestamp.end}s
                        </p>
                      </div>
                      
                      {prompt.generatedImage?.url ? (
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                          <img
                            src={prompt.generatedImage.url}
                            alt={`Scene ${index + 1}`}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              console.error(`Error loading image ${index}:`, e)
                              e.currentTarget.src = '/placeholder.png'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">No image available</p>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="text-xs font-medium">Original Text</h5>
                        <p className="text-xs text-muted-foreground">{prompt.segment}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium">Generated Prompt</h5>
                        <p className="text-xs text-muted-foreground">{prompt.prompt}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Original Video Player and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              <video
                className="w-full h-full object-cover"
                controls
                src="/placeholder.mp4"
                poster="/placeholder.svg?height=720&width=1280"
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Generated Video</h2>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </Card>
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          {/* Livepeer Upload Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Upload to Livepeer</h3>
                <p className="text-sm text-muted-foreground">
                  Share your video on the decentralized streaming platform
                </p>
                {livepeerSuccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Upload successful!</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleLivepeerUpload}
                    disabled={isLivepeerUploading}
                    className="w-full mt-2"
                  >
                    {isLivepeerUploading ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        Upload Video
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Separator />

          {/* Zora NFT Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">Mint as NFT on Zora</h3>
                <p className="text-sm text-muted-foreground">
                  Turn your video into a unique digital collectible
                </p>
                {zoraMintSuccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">NFT minted successfully!</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleZoraMint}
                    disabled={isZoraMinting}
                    className="w-full mt-2"
                  >
                    {isZoraMinting ? (
                      <>Minting...</>
                    ) : (
                      <>
                        Mint NFT
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              Your video is ready! You can download it directly or choose to share it through Livepeer or mint it as an NFT on Zora.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}