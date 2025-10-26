import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { Spinner } from './common/Spinner';

export const Photosonic: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err: any)
    {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white">AI Image Generation</h1>
      <p className="mt-2 text-lg text-slate-400 mb-6">Generate high-quality images from a text prompt.</p>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A futuristic cityscape with flying cars, cinematic lighting"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-md p-3 text-white focus:ring-teal-500 focus:border-teal-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt}
          className="px-5 py-3 flex justify-center items-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <Spinner /> : 'Generate'}
        </button>
      </form>
      
      {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">{error}</div>}

      <div className="mt-8">
        {isLoading && (
          <div className="w-full aspect-square bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="text-slate-400 mt-2">Generating image... this can take a moment.</p>
            </div>
          </div>
        )}
        {imageUrl && (
          <div className="w-full aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};