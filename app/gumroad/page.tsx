// File Purpose: A component that displays a step-by-step flow for video creation process
// Functionality: Shows 5 steps with visual indicators of progress and step descriptions

'use client'

import { Check, Video, Palette, Mic, Clapperboard, FileVideo } from "lucide-react"
import { useState } from "react"
import Step1Component from "./steps/step1"
import Step2Component from "./steps/step2"
import Step3Component from "./steps/step3"
import Step4Component from "./steps/step4"
import Step5Component from "./steps/step5"

export default function Component() {
  // Add state for current step
  const [currentStep, setCurrentStep] = useState(1)

  // Add state for audio data
  const [audioData, setAudioData] = useState<{url: string, blob: Blob} | null>(null)

  // Define the steps data for easy maintenance
  const steps = [
    {
      title: "Video Details",
      icon: Video,
      description: "Enter your video information"
    },
    {
      title: "Select Theme",
      icon: Palette,
      description: "Choose your video style and appearance"
    },
    {
      title: "Record Audio",
      icon: Mic,
      description: "Record or upload your voice narration"
    },
    {
      title: "Video Generation",
      icon: Clapperboard,
      description: "AI processes and creates your video"
    },
    {
      title: "Video Result",
      icon: FileVideo,
      description: "Preview and download your finished video"
    }
  ]

  // Handle next step navigation
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Component onSubmit={handleNextStep} />
      case 2:
        return <Step2Component onSubmit={handleNextStep} />
      case 3:
        return <Step3Component 
          onSubmit={(e, audioUrl: string, audioBlob: Blob) => {
            setAudioData({ url: audioUrl, blob: audioBlob })
            handleNextStep(e)
          }} 
        />
      case 4:
        return audioData ? (
          <Step4Component 
            onComplete={handleNextStep}
            audioURL={audioData.url}
            audioBlob={audioData.blob}
          />
        ) : null
      case 5:
        return <Step5Component />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header with steps */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
        <div className="w-full max-w-5xl mx-auto p-6">
          {/* Steps container */}
          <div className="relative flex justify-between px-8">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300 ease-in-out" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center z-10">
                {/* Step circle */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${index + 1 < currentStep 
                      ? 'bg-primary' 
                      : index + 1 === currentStep 
                        ? 'bg-primary' 
                        : 'bg-muted'}`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${index + 1 === currentStep ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  )}
                </div>
                
                {/* Step content */}
                <div className="mt-4 text-center">
                  <h3 className={`font-semibold ${index + 1 === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[150px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </main>
    </div>
  )
}
