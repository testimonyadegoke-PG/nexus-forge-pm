import React from 'react';

export interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, label }) => {
  return (
    <div className="my-2">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <textarea
        className="w-full min-h-[120px] p-2 rounded border border-gray-300 focus:outline-none focus:ring"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Supports Markdown'}
        aria-label={label || 'Markdown editor'}
      />
      <div className="text-xs text-muted-foreground mt-1">Supports basic Markdown formatting. Preview coming soon.</div>
    </div>
  );
};
