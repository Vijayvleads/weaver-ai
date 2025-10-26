
import React, { useState, useCallback } from 'react';
import { generateBlogPost, generateImage, evaluateArticle } from '../services/geminiService';
import type { BlogPost, ArticleEvaluation, BlogPostSection } from '../types';
import { Spinner } from './common/Spinner';
import { PaperClipIcon, ClipboardDocumentCheckIcon, LightBulbIcon, DocumentArrowDownIcon } from './icons/Icons';

export const BlogWeaver: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [tone, setTone] = useState('Professional');
    const [keywords, setKeywords] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [clientContext, setClientContext] = useState('');
    const [fileName, setFileName] = useState('');

    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [evaluation, setEvaluation] = useState<ArticleEvaluation | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationStep, setGenerationStep] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(false);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setClientContext(text);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };
    
    const clearFile = () => {
        setClientContext('');
        setFileName('');
        // Reset file input value
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleGenerateContent = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setBlogPost(null);
        setImageUrl(null);
        setEvaluation(null);
        setShowBreakdown(false);


        try {
            // Step 1: Generate Blog Post
            setGenerationStep('Generating article...');
            const post = await generateBlogPost(topic, targetAudience, tone, keywords, websiteUrl, clientContext);
            setBlogPost(post);

            // Step 2: Generate Image
            setGenerationStep('Generating featured image...');
            const url = await generateImage(post.imagePrompt);
            setImageUrl(url);

            // Step 3: Evaluate Article
            setGenerationStep('Evaluating content...');
            const fullArticle = [
                `<h1>${post.title}</h1>`,
                post.introduction,
                ...(post.sections || []).map(s => `<h2>${s.heading}</h2>\n${s.content}`),
                post.conclusion
            ].join('\n\n');
            const evalResult = await evaluateArticle(fullArticle);
            setEvaluation(evalResult);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setGenerationStep('');
        }
    }, [topic, targetAudience, tone, keywords, websiteUrl, clientContext]);

    const handleContentChange = useCallback((field: keyof Omit<BlogPost, 'sections' | 'breakdown' | 'imagePrompt'>, value: string) => {
        setBlogPost(prev => prev ? { ...prev, [field]: value } : null);
    }, []);

    const handleSectionChange = useCallback((index: number, field: keyof BlogPostSection, value: string) => {
        setBlogPost(prev => {
            if (!prev) return null;
            const newSections = [...prev.sections];
            newSections[index] = { ...newSections[index], [field]: value };
            return { ...prev, sections: newSections };
        });
    }, []);
    
    const handleExport = () => {
        if (!blogPost || !imageUrl) return;

        const formatTextForHtml = (text: string) => {
             return text.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('');
        };

        const htmlBody = `
            <h1>${blogPost.title}</h1>
            <img src="${imageUrl}" alt="${blogPost.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />
            ${formatTextForHtml(blogPost.introduction)}
            ${blogPost.sections.map(s => `
                <h2>${s.heading}</h2>
                ${formatTextForHtml(s.content)}
            `).join('')}
            <h2>Conclusion</h2>
            ${formatTextForHtml(blogPost.conclusion)}
        `;

        const sourceHTML = `
            <!DOCTYPE html>
            <html lang="en" xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="UTF-8">
                <title>${blogPost.title}</title>
                 <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    h1 { color: #111; }
                    h2 { color: #222; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                </style>
            </head>
            <body>${htmlBody}</body>
            </html>
        `;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        const filename = blogPost.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        fileDownload.download = `${filename}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const isFormValid = topic && targetAudience && tone && keywords;
    
    const renderResults = () => (
        <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Generated Content</h2>
                <p className="text-sm text-slate-400">Tip: Click on any text below to edit it directly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-800 p-6 rounded-md border border-slate-700 max-h-[70vh] overflow-y-auto">
                        {imageUrl && <img src={imageUrl} alt={blogPost?.title} className="w-full h-auto rounded-lg object-cover mb-6 shadow-lg" />}
                        <h1 
                            contentEditable 
                            suppressContentEditableWarning 
                            onBlur={(e) => handleContentChange('title', e.currentTarget.innerText)} 
                            className="text-3xl font-bold text-teal-400 mb-4 outline-none focus:ring-2 focus:ring-teal-500 rounded-sm p-1"
                        >
                            {blogPost?.title}
                        </h1>
                        <div className="prose prose-invert prose-slate max-w-none">
                             <p 
                                contentEditable 
                                suppressContentEditableWarning 
                                onBlur={(e) => handleContentChange('introduction', e.currentTarget.innerText)} 
                                className="lead whitespace-pre-wrap outline-none focus:ring-2 focus:ring-teal-500 rounded-sm p-1"
                            >
                                {blogPost?.introduction}
                            </p>
                            {(blogPost?.sections || []).map((s, i) => (
                                <div key={i} className="mb-4">
                                     <h2 
                                        contentEditable 
                                        suppressContentEditableWarning 
                                        onBlur={(e) => handleSectionChange(i, 'heading', e.currentTarget.innerText)} 
                                        className="text-xl font-semibold mb-2 outline-none focus:ring-2 focus:ring-teal-500 rounded-sm p-1"
                                    >
                                        {s.heading}
                                    </h2>
                                    <p 
                                        contentEditable 
                                        suppressContentEditableWarning 
                                        onBlur={(e) => handleSectionChange(i, 'content', e.currentTarget.innerText)} 
                                        className="whitespace-pre-wrap text-slate-300 outline-none focus:ring-2 focus:ring-teal-500 rounded-sm p-1"
                                    >
                                        {s.content}
                                    </p>
                                </div>
                            ))}
                            <h2 className="text-xl font-semibold mb-2">Conclusion</h2>
                             <p 
                                contentEditable 
                                suppressContentEditableWarning 
                                onBlur={(e) => handleContentChange('conclusion', e.currentTarget.innerText)} 
                                className="whitespace-pre-wrap text-slate-300 outline-none focus:ring-2 focus:ring-teal-500 rounded-sm p-1"
                            >
                                {blogPost?.conclusion}
                            </p>
                        </div>
                    </div>
                     {/* Generation Breakdown */}
                    {blogPost?.breakdown && (
                        <div className="bg-slate-800 rounded-lg border border-slate-700">
                             <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-700/50">
                                <div className="flex items-center">
                                    <LightBulbIcon className="h-6 w-6 mr-3 text-teal-400"/>
                                    <h3 className="text-lg font-semibold text-white">Generation Breakdown</h3>
                                </div>
                                <span className={`transform transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                           {showBreakdown && (
                               <div className="p-6 border-t border-slate-700 space-y-4">
                                   <h4 className="font-semibold text-teal-400">{blogPost.breakdown.title}</h4>
                                   {(blogPost.breakdown.sections || []).map((section, i) => (
                                       <div key={i}>
                                           <h5 className="font-semibold text-white mt-2">{section.heading}</h5>
                                           <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 mt-1">
                                               {(section.points || []).map((point, j) => <li key={j}>{point}</li>)}
                                           </ul>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                    )}
                </div>
                {/* Sidebar Column */}
                <div className="space-y-4">
                    <button
                        onClick={handleExport}
                        className="w-full flex justify-center items-center px-4 py-2.5 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition"
                    >
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Export as .doc
                    </button>
                    {evaluation && (
                        <>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 text-center">
                                <p className="text-slate-400 text-sm flex items-center justify-center"><ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />Publishability Score</p>
                                <p className="text-5xl font-bold text-teal-400">{evaluation.publishability_score}<span className="text-2xl text-slate-400">/100</span></p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 space-y-3">
                                {(evaluation.criteria || []).map((c, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-semibold text-white">{c.parameter}</p>
                                            <p className="text-sm font-bold text-slate-300">{c.score}/{c.max_points}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 italic">"{c.reasoning}"</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white">Article Weaver</h1>
                <p className="mt-2 text-lg text-slate-400">Your all-in-one tool for creating context-aware, evaluated blog content.</p>
            </div>

            <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                {!blogPost && (
                    <form onSubmit={handleGenerateContent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-1">Article Topic</label>
                                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Future of Renewable Energy" className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white" required/>
                            </div>
                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                                <input id="audience" type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Tech enthusiasts and investors" className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white" required/>
                            </div>
                            <div>
                                <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-1">Tone of Voice</label>
                                <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white" required>
                                    <option>Professional</option>
                                    <option>Friendly</option>
                                    <option>Witty</option>
                                    <option>Authoritative</option>
                                    <option>Inspirational</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-1">Primary Keywords (comma-separated)</label>
                                <input id="keywords" type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., solar power, wind energy, battery storage" className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white" required/>
                            </div>
                            <div>
                                <label htmlFor="websiteUrl" className="block text-sm font-medium text-slate-300 mb-1">Website URL for Additional Context (Optional)</label>
                                <input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white"/>
                                <p className="text-xs text-slate-500 mt-1">The AI will analyze this URL for brand voice, services, and keywords.</p>
                            </div>
                             <div>
                                <label htmlFor="file-upload" className="block text-sm font-medium text-slate-300 mb-1">Attach Client Context (Optional)</label>
                                <div className="flex items-center">
                                     <label htmlFor="file-upload" className="cursor-pointer flex items-center px-3 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600">
                                         <PaperClipIcon className="h-5 w-5 mr-2" />
                                         <span>{fileName ? 'Change File' : 'Upload File'}</span>
                                     </label>
                                     <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md" />
                                     {fileName && (
                                         <div className="ml-3 flex items-center text-sm">
                                             <span className="text-slate-400">{fileName}</span>
                                             <button type="button" onClick={clearFile} className="ml-2 text-red-400 hover:text-red-300">&times;</button>
                                         </div>
                                     )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Upload a .txt or .md file with brand guidelines.</p>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                             <button type="submit" disabled={isLoading || !isFormValid} className="w-full mt-4 flex justify-center items-center px-4 py-3 bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                {isLoading ? <><Spinner /> {generationStep}</> : 'Generate Content'}
                            </button>
                        </div>
                    </form>
                )}
                {isLoading && !blogPost && (
                    <div className="flex flex-col items-center justify-center h-64">
                         <Spinner size="lg" />
                         <p className="mt-4 text-slate-300">{generationStep}</p>
                    </div>
                )}
                {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md">{error}</div>}
            </div>
            
            {blogPost && evaluation && renderResults()}
            
        </div>
    );
};
