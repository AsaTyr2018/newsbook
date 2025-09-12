import { useEffect, useRef } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface EditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
}

const Editor = ({ data, onChange }: EditorProps) => {
  const editorRef = useRef<EditorJS | null>(null);
  const hasRendered = useRef(false);

  // Initialize editor once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const Editor = (await import('@editorjs/editorjs')).default;
      if (!isMounted) return;
      const editor = new Editor({
        holder: 'editorjs',
        data,
        async onChange(api) {
          const content = await api.saver.save();
          onChange(content);
        },
      });
      editorRef.current = editor;
    })();

    return () => {
      isMounted = false;
      editorRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && data && !hasRendered.current) {
      editorRef.current.render(data);
      hasRendered.current = true;
    }
  }, [data]);

  return <div id="editorjs" className="border p-2" />;
};

export default Editor;

