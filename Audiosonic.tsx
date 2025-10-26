import React, { useState, useCallback, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { Spinner } from './common/Spinner';

// Audio decoding helpers
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const Audiosonic: React.FC = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref for AudioContext to avoid re-creation on re-renders
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  
  useEffect(() => {
     // Initialize AudioContext on client-side after mount
     if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
     }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !audioCtxRef.current) return;

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const base64Audio = await generateSpeech(text);
      const rawAudio = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(rawAudio, audioCtxRef.current, 24000, 1);
      
      // Create a WAV file in memory to play in the <audio> tag
      const wavBlob = bufferToWave(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  // Helper to convert AudioBuffer to a WAV Blob
  const bufferToWave = (abuffer: AudioBuffer) => {
    let numOfChan = abuffer.numberOfChannels,
        length = abuffer.length * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit
    
    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    
    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++;                                     // next source sample
    }

    return new Blob([buffer], {type: "audio/wav"});
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white">Text-to-Speech</h1>
      <p className="mt-2 text-lg text-slate-400 mb-6">Convert text into natural-sounding speech.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-40 bg-slate-800 border border-slate-600 rounded-md p-3 text-white focus:ring-teal-500 focus:border-teal-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !text}
          className="w-full px-5 py-3 flex justify-center items-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <><Spinner/> Generating Audio...</> : 'Generate Audio'}
        </button>
      </form>
      
      {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">{error}</div>}

      <div className="mt-8">
        {isLoading && <p className="text-slate-400">Processing audio...</p>}
        {audioUrl && (
          <audio controls src={audioUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    </div>
  );
};