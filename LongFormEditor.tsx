import React, { useState, useCallback } from 'react';
import { paraphraseText, generateArticleOutline } from '../services/geminiService';
import { Spinner } from './common/Spinner';

const EditorButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; }> = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-3 py-1.5 bg-teal-600 text-white text-sm font-semibold rounded-md hover:bg-teal-700 disabled:bg-teal-600/50 disabled:cursor-not-allowed transition"
    >
        {children}
    </button>
);

export const LongFormEditor: React.FC = () => {
    const [articleTopic, setArticleTopic] = useState('');
    const [outline, setOutline] = useState<any>(null);
    const [editorText, setEditorText] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [isLoadingOutline, setIsLoadingOutline] = useState(false);
    const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateOutline = useCallback(async () => {
        if (!articleTopic) return;
        setIsLoadingOutline(true);
        setError(null);
        setOutline(null);
        try {
            const result = await generateArticleOutline(articleTopic);
            setOutline(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingOutline(false);
        }
    }, [articleTopic]);

    const handleParaphrase = useCallback(async () => {
        if (!selectedText) return;
        setIsLoadingParaphrase(true);
        setError(null);
        try {
            const paraphrased = await paraphraseText(selectedText);
            setEditorText(editorText.replace(selectedText, paraphrased));
            setSelectedText('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoadingParaphrase(false);
        }
    }, [selectedText, editorText]);
    
    const handleSelectionChange = () => {
        const text = window.getSelection()?.toString() ?? '';
        setSelectedText(text);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Instant Article Writer */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-2">Instant Article Writer</h2>
                <p className="text-slate-400 mb-4">Generate a full article outline in one click. (Step 1 of 3)</p>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={articleTopic}
                        onChange={(e) => setArticleTopic(e.target.value)}
                        placeholder="Enter your article topic..."
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-md p-2 text-white focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                    <button
                        onClick={handleGenerateOutline}
                        disabled={isLoadingOutline || !articleTopic}
                        className="px-4 py-2 flex justify-center items-center bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isLoadingOutline ? <Spinner /> : "Generate Outline"}
                    </button>
                </div>
                {outline && (
                    <div className="mt-6 bg-slate-800 p-4 rounded-md border border-slate-600">
                        <h3 className="text-xl font-bold text-teal-400 mb-3">{outline.title}</h3>
                        <div className="space-y-3">
                            {(outline.sections || []).map((section: any, index: number) => (
                                <div key={index}>
                                    <h4 className="font-semibold text-white">{section.heading}</h4>
                                    <ul className="list-disc list-inside pl-4 text-slate-300">
                                        {(section.subheadings || []).map((sub: string, i: number) => <li key={i}>{sub}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sonic Editor Commands */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-2">Editor AI Commands</h2>
                <p className="text-slate-400 mb-4">Highlight text in the editor below to use AI commands.</p>
                <div className="flex items-center space-x-2 mb-4 p-2 bg-slate-800 rounded-md">
                     <EditorButton onClick={handleParaphrase} disabled={!selectedText || isLoadingParaphrase}>
                        {isLoadingParaphrase ? <Spinner/> : "Paraphrase"}
                    </EditorButton>
                    <EditorButton onClick={() => {}} disabled={true}>Expand (soon)</EditorButton>
                    <EditorButton onClick={() => {}} disabled={true}>Shorten (soon)</EditorButton>
                </div>
                <textarea
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    onSelect={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onKeyUp={handleSelectionChange}
                    placeholder="Start writing or paste your text here... Then highlight a portion to enable AI commands."
                    className="w-full h-64 bg-slate-900 border border-slate-600 rounded-md p-4 text-slate-200 focus:ring-teal-500 focus:border-teal-500 transition"
                />
            </div>
             {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">{error}</div>}
        </div>
    );
};