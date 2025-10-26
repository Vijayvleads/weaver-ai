// FIX: Added import for React to resolve type inconsistencies for React.FC.
import type React from 'react';
import type { JSONSchema } from '@google/genai';

export interface TemplateInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[];
}

export interface Template {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  premium: boolean;
  inputs: TemplateInput[];
  systemInstruction: string;
  responseSchema: JSONSchema;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface BlogPostSection {
    heading: string;
    content: string;
}

export interface BreakdownSection {
    heading: string;
    points: string[];
}

export interface GenerationBreakdown {
    title: string;
    sections: BreakdownSection[];
}

export interface BlogPost {
    title: string;
    introduction: string;
    sections: BlogPostSection[];
    conclusion: string;
    imagePrompt: string;
    breakdown: GenerationBreakdown;
}

export interface EvaluationCriterion {
    parameter: string;
    weight: number;
    score: number;
    max_points: number;
    reasoning: string;
}

export interface ArticleEvaluation {
    publishability_score: number;
    criteria: EvaluationCriterion[];
}