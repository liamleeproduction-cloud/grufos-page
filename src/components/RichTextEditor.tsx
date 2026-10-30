/**
 * RichTextEditor.tsx
 * A Quill-based rich text editor for the bio/about field.
 * Loaded dynamically to avoid SSR issues (Quill needs `window`).
 */
import React, { useEffect, useRef, useState } from 'react';
import './RichTextEditor.scss';

// Toolbar configuration — minimal, photography-bio-appropriate
const TOOLBAR_OPTIONS = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'blockquote'],
  ['clean'],
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Dynamically import Quill so it never runs on the server
    let isMounted = true;

    import('quill').then(({ default: Quill }) => {
      if (!isMounted || !containerRef.current || quillRef.current) return;

      // Mount editor inside a child div to avoid Quill wiping the container
      const editorEl = document.createElement('div');
      containerRef.current.appendChild(editorEl);

      const quill = new Quill(editorEl, {
        theme: 'snow',
        placeholder: placeholder ?? 'Escribe tu historia, especialidad fotográfica...',
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });

      quillRef.current = quill;

      // Set initial HTML content
      if (value) {
        const delta = quill.clipboard.convert({ html: value });
        quill.setContents(delta, 'silent');
      }

      // Forward changes upward
      quill.on('text-change', () => {
        const html = quill.getSemanticHTML();
        onChange(html);
      });

      setReady(true);
    });

    return () => {
      isMounted = false;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g., initial load from localStorage)
  // but only when quill doesn't own the current focus
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || quill.hasFocus()) return;

    const currentHtml = quill.getSemanticHTML();
    // Avoid re-setting if content is the same to prevent cursor jumping
    if (currentHtml !== value) {
      const delta = quill.clipboard.convert({ html: value ?? '' });
      quill.setContents(delta, 'silent');
    }
  }, [value]);

  return (
    <div className={`rte-wrapper${ready ? ' rte-wrapper--ready' : ''}`}>
      <div ref={containerRef} className="rte-container" />
      {!ready && (
        <div className="rte-loading" aria-hidden="true">
          Cargando editor…
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
