import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon, DownloadIcon, PreviewIcon } from './icons';

interface CodeBlockProps {
  code: string;
  language: string;
}

const languageExtensions: { [key: string]: string } = {
  javascript: 'js',
  python: 'py',
  html: 'html',
  css: 'css',
  jsx: 'jsx',
  tsx: 'tsx',
  json: 'json',
  shell: 'sh',
  bash: 'sh',
  typescript: 'ts',
};

const PreviewableLanguages = ['html'];

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [code]);

  const handleDownload = useCallback(() => {
    const extension = languageExtensions[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: `text/${extension}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, language]);
  
  const isPreviewable = PreviewableLanguages.includes(language.toLowerCase());

  const togglePreview = () => {
      if(isPreviewable) {
          setShowPreview(prev => !prev);
      }
  }

  const previewUrl = isPreviewable ? URL.createObjectURL(new Blob([code], { type: 'text/html' })) : '';

  return (
    <div className="bg-gray-900 rounded-lg my-4 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-950 text-gray-400 text-xs">
        <span>{language}</span>
        <div className="flex items-center space-x-2">
          {isPreviewable && (
             <button onClick={togglePreview} className="p-1.5 hover:bg-gray-700 rounded-md focus:outline-none">
                <PreviewIcon className="w-4 h-4" />
             </button>
          )}
          <button onClick={handleDownload} className="p-1.5 hover:bg-gray-700 rounded-md focus:outline-none">
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button onClick={handleCopy} className="p-1.5 hover:bg-gray-700 rounded-md focus:outline-none">
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className={`language-${language} text-white`}>{code}</code>
      </pre>
      {showPreview && isPreviewable && (
          <div className='p-4 border-t-2 border-gray-700'>
              <h3 className='text-white mb-2 font-semibold'>Preview</h3>
               <iframe 
                src={previewUrl}
                title="Code Preview"
                className="w-full h-64 bg-white rounded-md"
                sandbox="allow-scripts"
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />
          </div>
      )}
    </div>
  );
};

export default CodeBlock;
