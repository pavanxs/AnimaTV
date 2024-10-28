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

export default function Step5Component() {
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
    <div className="w-full max-w-6xl mx-auto p-6">
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
