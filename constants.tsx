import React from 'react';
import type { Template } from './types';
import { Type } from '@google/genai';

import {
  SparklesIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  CodeBracketSquareIcon,
  MegaphoneIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
  GlobeAltIcon,
} from './components/icons/Icons';

export const TEMPLATES: Template[] = [
  {
    id: 'google-ads-full',
    category: 'Advertising & Marketing',
    name: 'Google Ads (Full)',
    description: 'Generate 3 complete, unique ad variations for Google Ads.',
    icon: MegaphoneIcon,
    premium: false,
    inputs: [
      { name: 'productName', label: 'Product/Service Name', type: 'text', placeholder: 'e.g., QuantumLeap CRM', required: true },
      { name: 'features', label: 'Key Features/Benefits (comma-separated)', type: 'textarea', placeholder: 'e.g., AI-powered, Automated workflows, 24/7 support', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Small business owners', required: true },
      // FIX: Added missing 'placeholder' property.
      { name: 'tone', label: 'Tone of Voice', type: 'select', placeholder: 'Select a tone', options: ['Professional', 'Friendly', 'Witty', 'Urgent', 'Inspirational'], required: true },
    ],
    systemInstruction: "You are a world-class Google Ads copywriter. Your task is to generate 3 unique and compelling ad variations based on the user's input. Each ad must have a headline 1, headline 2, and a description. Focus on creating high-converting copy that grabs attention and encourages clicks.",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        ads: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline_1: { type: Type.STRING, description: 'The primary headline (max 30 characters).' },
              headline_2: { type: Type.STRING, description: 'The secondary headline (max 30 characters).' },
              description: { type: Type.STRING, description: 'The ad description (max 90 characters).' },
            },
            required: ['headline_1', 'headline_2', 'description'],
          },
        },
      },
      required: ['ads'],
    },
  },
  {
    id: 'article-summarizer',
    category: 'General Writing & Utility',
    name: 'Article Summarizer',
    description: 'Summarize long-form text into key points and a concise paragraph.',
    icon: NewspaperIcon,
    premium: true,
    inputs: [
      { name: 'textToSummarize', label: 'Article Text (up to 10,000 words)', type: 'textarea', placeholder: 'Paste the full article text here...', required: true },
    ],
    systemInstruction: "You are a professional summarizer. Your goal is to condense the provided text into a concise summary. The output must be structured with a single summary paragraph followed by 3-5 key bullet points that capture the main ideas of the text.",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        summary_paragraph: { type: Type.STRING, description: 'A single, concise paragraph summarizing the entire text.' },
        key_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3-5 key bullet points from the text.' },
      },
      required: ['summary_paragraph', 'key_points'],
    },
  },
  {
    id: 'seo-meta-tags',
    category: 'Website & SEO Copy',
    name: 'SEO Meta Tags',
    description: 'Generate SEO-optimized title, description, and keywords for a webpage.',
    icon: LinkIcon,
    premium: false,
    inputs: [
        { name: 'pageTopic', label: 'Webpage Topic/Title', type: 'text', placeholder: 'e.g., The Ultimate Guide to React Hooks', required: true },
        { name: 'keywords', label: 'Main Keywords (comma-separated)', type: 'text', placeholder: 'e.g., React, Hooks, useState, useEffect', required: true },
    ],
    systemInstruction: "You are an SEO expert. Generate an SEO-optimized title tag (50-60 chars), meta description (150-160 chars), and a list of 5-7 relevant keywords for the given topic. The title and description should be compelling and click-worthy for search engine users.",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'The SEO-optimized title tag.' },
        description: { type: Type.STRING, description: 'The SEO-optimized meta description.' },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant keywords.' },
      },
      required: ['title', 'description', 'keywords'],
    },
  },
   {
    id: 'quora-answers',
    category: 'General Writing & Utility',
    name: 'Quora Answers',
    description: 'Generate helpful and comprehensive answers for Quora questions.',
    icon: QuestionMarkCircleIcon,
    premium: false,
    inputs: [
        { name: 'question', label: 'Quora Question', type: 'text', placeholder: 'e.g., What are the best ways to learn programming in 2025?', required: true },
        { name: 'points', label: 'Key points to include (optional)', type: 'textarea', placeholder: 'e.g., Focus on a niche, build projects, contribute to open source...', required: false },
    ],
    systemInstruction: "You are a helpful expert who provides clear, well-structured, and insightful answers on Quora. Based on the user's question, write a comprehensive answer that is easy to read, informative, and directly addresses the query. Start with a direct answer and then elaborate.",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        answer: { type: Type.STRING, description: 'A full, well-structured answer to the Quora question.' },
      },
      required: ['answer'],
    },
  },
  {
    id: 'website-seo-audit',
    category: 'Website & SEO Copy',
    name: 'Website SEO Audit',
    description: 'Generate a basic SEO audit for a URL with actionable recommendations.',
    icon: GlobeAltIcon,
    premium: true,
    inputs: [
        { name: 'url', label: 'Website URL to Audit', type: 'text', placeholder: 'e.g., https://example.com/services', required: true },
    ],
    systemInstruction: "You are an expert SEO auditor. For the provided URL, generate a concise report. The report must include a suggested SEO title, a suggested meta description, an analysis of the page's H1 tag, and three actionable on-page SEO recommendations to improve its search ranking. Do not attempt to access the URL; base your audit on the URL's path and assumed topic.",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        suggested_title: { type: Type.STRING, description: 'An optimized title tag (50-60 characters).' },
        suggested_description: { type: Type.STRING, description: 'An optimized meta description (150-160 characters).' },
        h1_analysis: { type: Type.STRING, description: 'A brief analysis of the likely H1 tag and its effectiveness.' },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3 actionable on-page SEO recommendations.' },
      },
      required: ['suggested_title', 'suggested_description', 'h1_analysis', 'recommendations'],
    },
  },
];