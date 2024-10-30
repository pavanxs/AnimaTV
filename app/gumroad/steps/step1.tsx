// File Purpose: First step of video creation process - collecting video details and format
// Functionality: Form that captures video title, description, and preferred aspect ratio with visual indicators


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

export default function Step1Component({ 
  onSubmit 
}: { 
  onSubmit: (e: React.FormEvent) => void 
}) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Video Details Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title *</Label>
            <Input 
              id="title" 
              placeholder="Enter your video title" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Video Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Enter a description for your video"
              className="h-32"
            />
          </div>
        </div>

        {/* Screen Size Selection */}
        <div className="space-y-4">
          <Label>Select Screen Size</Label>
          <RadioGroup defaultValue="16:9" className="grid grid-cols-3 gap-4">
            {/* Landscape - 16:9 */}
            <div>
              <RadioGroupItem 
                value="16:9" 
                id="16:9" 
                className="peer sr-only" 
              />
              <Label 
                htmlFor="16:9" 
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-28 h-16 bg-muted-foreground/20 rounded-sm mb-3" />
                <p className="font-medium">Landscape 16:9</p>
                <span className="text-xs text-muted-foreground">
                  YouTube
                </span>
              </Label>
            </div>

            {/* Square - 1:1 */}
            <div>
              <RadioGroupItem 
                value="1:1" 
                id="1:1" 
                className="peer sr-only" 
              />
              <Label 
                htmlFor="1:1" 
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-24 h-24 bg-muted-foreground/20 rounded-sm mb-3" />
                <p className="font-medium">Square 1:1</p>
                <span className="text-xs text-muted-foreground">
                  Instagram, Twitter
                </span>
              </Label>
            </div>

            {/* Portrait - 9:16 */}
            <div>
              <RadioGroupItem 
                value="9:16" 
                id="9:16" 
                className="peer sr-only" 
              />
              <Label 
                htmlFor="9:16" 
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="w-16 h-28 bg-muted-foreground/20 rounded-sm mb-3" />
                <p className="font-medium">Portrait 9:16</p>
                <span className="text-xs text-muted-foreground">
                  TikTok, Reels
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Next Button */}
        <Button type="submit" className="w-full">
          Next Step
        </Button>
      </form>
    </div>
  )
}
