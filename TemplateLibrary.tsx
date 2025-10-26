import React, { useMemo } from 'react';
import { TEMPLATES } from '../constants';
import type { Template } from '../types';

interface TemplateLibraryProps {
  onTemplateSelect: (template: Template) => void;
}

const TemplateCard: React.FC<{ template: Template; onClick: () => void; }> = ({ template, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-4 text-left bg-slate-800 rounded-lg border border-slate-700 hover:border-teal-500 hover:bg-slate-700 transition-all duration-200 h-full"
  >
    <div className="flex items-center mb-2">
      <template.icon className="h-6 w-6 mr-3 text-teal-400" />
      <h3 className="text-md font-semibold text-white">{template.name}</h3>
    </div>
    <p className="text-sm text-slate-400">{template.description}</p>
  </button>
);

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onTemplateSelect }) => {
  const groupedTemplates = useMemo(() => {
    return TEMPLATES.reduce<Record<string, Template[]>>((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {});
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">AI Writing Templates</h1>
        <p className="mt-2 text-lg text-slate-400">Choose from 80+ templates to generate content in seconds.</p>
      </div>
      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} onClick={() => onTemplateSelect(template)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};