/**
 * File Purpose: Audio Transcription and Video Generation Page
 * This file implements a React component that handles audio recording, transcription,
 * and generates a video with AI-generated images based on the transcribed text.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Livepeer } from "@livepeer/ai";
import { Player } from '@remotion/player';
import { AbsoluteFill, Img, Sequence, Audio, useVideoConfig } from 'remotion';

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
}

interface TranscriptionResponse {
  text: string;
  segments: Segment[];
}

/**
 * Livepeer AI client initialization
 * @todo Add your Livepeer API key
 */
const livepeerAI = new Livepeer({
  httpBearer: "",
});

/**
 * VideoComposition Component
 * Purpose: Renders a video composition with synchronized audio, images, and subtitles
 * @param segments - Array of transcript segments with timing and image information
 * @param audioUrl - URL of the recorded audio file
 */
const VideoComposition = ({ segments, audioUrl }: { segments: Segment[], audioUrl: string }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio src={audioUrl} />
      {segments.map((segment) => (
        <Sequence from={segment.start * fps} durationInFrames={(segment.end - segment.start) * fps} key={segment.id}>
          <AbsoluteFill>
            {segment.imageUrl && <Img src={segment.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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
  );
};

/**
 * TranscribePage Component
 * Main component handling the audio recording, transcription, and video generation workflow
 */
export default function TranscribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptionResponse | null>(null);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  /**
   * Starts audio recording using the browser's MediaRecorder API
   * Handles microphone access and initializes recording
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  /**
   * Stops the current recording and triggers the transcription process
   * Creates an audio blob from recorded chunks
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleRecordingComplete(audioBlob);
      };
    }
  };

  /**
   * Handles the recorded audio and initiates the transcription process
   * @param audioBlob - The recorded audio as a Blob
   */
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setAudioUrl(URL.createObjectURL(audioBlob));
    await sendAudioToWhisper(audioBlob);
  };

  /**
   * Sends the audio to OpenAI's Whisper API for transcription
   * @param audioBlob - The recorded audio as a Blob
   * @returns TranscriptionResponse with text and timing information
   */
  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    try {
      const response = await axios.post<TranscriptionResponse>(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTranscript(response.data);
      console.log('Transcription:', response.data);
      await generateImagePrompts(response.data);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  /**
   * Generates image prompts for each transcript segment using GPT-4
   * @param transcriptionData - The complete transcription data
   */
  const generateImagePrompts = async (transcriptionData: TranscriptionResponse) => {
    setIsGeneratingPrompts(true);
    const updatedSegments = [...transcriptionData.segments];
    
    for (const segment of updatedSegments) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an AI that generates image prompts based on text. First, analyze the text to identify characters, environment, and other important elements. Then, create a detailed image prompt for the text."
              },
              {
                role: "user",
                content: `Generate an image prompt for the following text: "${segment.text}"`
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        segment.imagePrompt = response.data.choices[0].message.content;
      } catch (error) {
        console.error('Error generating image prompt:', error);
        segment.imagePrompt = "Failed to generate image prompt.";
      }
    }

    setTranscript({ ...transcriptionData, segments: updatedSegments });
    setIsGeneratingPrompts(false);
    await generateImages(updatedSegments);
  };

  /**
   * Generates images for each segment using Livepeer AI
   * @param segments - Array of transcript segments with prompts
   */
  const generateImages = async (segments: Segment[]) => {
    setIsGeneratingImages(true);
    const updatedSegments = [...segments];

    for (const segment of updatedSegments) {
      if (segment.imagePrompt) {
        try {
          const result = await livepeerAI.generate.textToImage({
            prompt: segment.imagePrompt,
            modelId: "SG161222/RealVisXL_V4.0_Lightning",
            width: 1600,
            height: 600,
          });

          if (result.imageResponse?.images && result.imageResponse.images.length > 0) {
            segment.imageUrl = result.imageResponse.images[0].url;
          }
        } catch (error) {
          console.error('Error generating image:', error);
        }
      }
    }

    setTranscript(prev => prev ? { ...prev, segments: updatedSegments } : null);
    setIsGeneratingImages(false);
  };

  /**
   * Simulates video generation process
   * @todo Implement actual video rendering logic
   */
  const generateVideo = async () => {
    if (!transcript || !audioUrl) return;
    setIsGeneratingVideo(true);

    // In a real implementation, you would render the video server-side
    // For this example, we'll just simulate a delay and then set the video as ready
    await new Promise(resolve => setTimeout(resolve, 5000));

    setVideoReady(true);
    setIsGeneratingVideo(false);
  };

  /**
   * Effect hook to trigger video generation when all assets are ready
   */
  useEffect(() => {
    if (transcript && audioUrl && !isGeneratingImages && !isGeneratingPrompts) {
      generateVideo();
    }
  }, [transcript, audioUrl, isGeneratingImages, isGeneratingPrompts]);

  /**
   * Formats seconds into MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription, Image Prompts, and Video Generation</h1>
      <div className="mb-4">
        {isRecording ? (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={startRecording}
          >
            Start Recording
          </button>
        )}
      </div>
      {isGeneratingPrompts && (
        <div className="mb-4">
          <p className="text-yellow-600">Generating image prompts...</p>
        </div>
      )}
      {isGeneratingImages && (
        <div className="mb-4">
          <p className="text-yellow-600">Generating images...</p>
        </div>
      )}
      {isGeneratingVideo && (
        <div className="mb-4">
          <p className="text-yellow-600">Generating video...</p>
        </div>
      )}
      {transcript && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Transcript:</h2>
          <p className="whitespace-pre-wrap mb-4">{transcript.text}</p>
          <h3 className="text-lg font-semibold mb-2">Segments with Timestamps, Image Prompts, and Generated Images:</h3>
          {transcript.segments.map((segment) => (
            <div key={segment.id} className="mb-4 p-4 border rounded">
              <p className="mb-2">
                <span className="font-medium">{formatTime(segment.start)} - {formatTime(segment.end)}:</span> {segment.text}
              </p>
              {segment.imagePrompt && (
                <div className="mt-2">
                  <h4 className="font-medium">Image Prompt:</h4>
                  <p className="text-sm italic">{segment.imagePrompt}</p>
                </div>
              )}
              {segment.imageUrl && (
                <div className="mt-2">
                  <h4 className="font-medium">Generated Image:</h4>
                  <img src={segment.imageUrl} alt="Generated image" className="mt-2 max-w-full h-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {videoReady && transcript && audioUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Video:</h2>
          <Player
            component={VideoComposition}
            inputProps={{ segments: transcript.segments, audioUrl }}
            durationInFrames={Math.ceil(transcript.segments[transcript.segments.length - 1].end * 30)}
            fps={30}
            compositionWidth={1280}
            compositionHeight={720}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
            }}
            controls
          />
        </div>
      )}
    </div>
  );
}