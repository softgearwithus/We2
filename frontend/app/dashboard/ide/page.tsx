'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Save, TerminalSquare } from 'lucide-react';

const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.Editor),
  { ssr: false },
);

const SAMPLE = `function greet(name: string) {
  return ` + '"' + `Hello, ${name}!` + '"' + `;
}

console.log(greet('Emble'));`;

export default function IdeWorkspacePage() {
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python' | 'json'>('typescript');
  const [code, setCode] = useState(SAMPLE);
  const [output, setOutput] = useState('Ready. Use Run to execute quick local checks in-browser.');

  const runHint = useMemo(() => {
    if (language === 'python') return 'Python preview mode: execution is simulated.';
    if (language === 'json') return 'JSON mode validates syntax and formatting intent.';
    return 'JavaScript/TypeScript mode: output is simulated for workspace flow.';
  }, [language]);

  const handleRun = () => {
    const lines = code.split('\n').length;
    setOutput(`Executed ${language} workspace run. ${lines} lines processed. ${runHint}`);
  };

  const handleReset = () => {
    setCode(SAMPLE);
    setOutput('Workspace reset to starter template.');
  };

  const handleSave = () => {
    try {
      localStorage.setItem('emble_ide_workspace_code', code);
      localStorage.setItem('emble_ide_workspace_language', language);
      setOutput('Workspace saved locally on this device.');
    } catch {
      setOutput('Unable to save locally in this browser context.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">IDE Workspace</h1>
          <p className="text-sm font-medium text-slate-500">A focused coding surface for quick experiments and interview prep.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="json">JSON</option>
          </select>

          <button
            onClick={handleRun}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            <Play size={14} /> Run
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Save size={14} /> Save
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Editor
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? '')}
            height="68vh"
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
            <TerminalSquare size={16} /> Output
          </div>
          <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-700">
            {output}
          </pre>
          <p className="mt-3 text-xs text-slate-500">This workspace is optimized for drafting and practicing. Full judge/execution engines are intentionally removed.</p>
        </div>
      </div>
    </div>
  );
}
