// File Purpose: Second step of video creation process - theme selection
// Functionality: Displays a grid of art style options with visual previews and descriptions

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Paintbrush2, Pencil, Palette, Frame, Brush, Camera } from "lucide-react"

// Define theme options with their details
const themes = [
  {
    id: "anime",
    title: "Anime Style",
    description: "Japanese animation inspired artwork with bold lines and expressive characters",
    icon: Paintbrush2,
    preview: "/placeholder.svg?height=100&width=180"
  },
  {
    id: "sketch",
    title: "Hand Drawn Sketch",
    description: "Natural pencil sketch style with organic lines and textures",
    icon: Pencil,
    preview: "/placeholder.svg?height=100&width=180"
  },
  {
    id: "watercolor",
    title: "Watercolor",
    description: "Soft, artistic style with flowing colors and gentle transitions",
    icon: Palette,
    preview: "/placeholder.svg?height=100&width=180"
  },
  {
    id: "minimal",
    title: "Minimalist",
    description: "Clean, simple designs with essential elements only",
    icon: Frame,
    preview: "/placeholder.svg?height=100&width=180"
  },
  {
    id: "3d",
    title: "3D Animation",
    description: "Modern 3D rendered style with depth and dimension",
    icon: Brush,
    preview: "/placeholder.svg?height=100&width=180"
  },
  {
    id: "realistic",
    title: "Realistic",
    description: "Photo-realistic style with detailed textures and lighting",
    icon: Camera,
    preview: "/placeholder.svg?height=100&width=180"
  }
]

export default function Step2Component({ 
  onSubmit 
}: { 
  onSubmit: (e: React.FormEvent) => void 
}) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Choose Your Art Style</h2>
          <p className="text-muted-foreground text-center">
            Select a visual theme for your video animation
          </p>
        </div>

        <RadioGroup defaultValue="anime" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="relative">
              <RadioGroupItem
                value={theme.id}
                id={theme.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={theme.id}
                className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-primary/5 rounded-md">
                    <theme.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{theme.title}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
                <div className="relative rounded-md overflow-hidden bg-muted">
                  <img
                    src={theme.preview}
                    alt={`Preview of ${theme.title} style`}
                    className="w-full h-[100px] object-cover"
                  />
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button type="submit" className="w-full">
          Next Step
        </Button>
      </form>
    </div>
  )
}

