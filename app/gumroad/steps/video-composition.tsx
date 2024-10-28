// File Purpose: Video composition component for Remotion
// Functionality: Renders the video with synchronized audio, images, and subtitles

import { AbsoluteFill, Img, Sequence, Audio, useCurrentFrame, useVideoConfig } from 'remotion'

interface Segment {
  id: number
  start: number
  end: number
  text: string
  imagePrompt?: string
  imageUrl?: string
}

export const VideoComposition = ({ segments, audioUrl }: { segments: Segment[], audioUrl: string }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill>
      <Audio src={audioUrl} />
      {segments.map((segment, index) => (
        <Sequence 
          from={segment.start * fps} 
          durationInFrames={(segment.end - segment.start) * fps} 
          key={segment.id}
        >
          <AbsoluteFill>
            {segment.imageUrl && (
              <Img 
                src={segment.imageUrl} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}
            <div style={{
              position: 'absolute',
              bottom: 50,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: '10px',
              fontSize: '24px',
              textAlign: 'center',
            }}>
              {segment.text}
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
