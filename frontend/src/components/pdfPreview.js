import { useEffect, useState } from 'react';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export function usePdfDocument(file) {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let stopped = false, task;
    setDoc(null); setError('');
    if (!file) return;
    (async () => {
      const pdf = await import('pdfjs-dist/build/pdf.mjs');
      pdf.GlobalWorkerOptions.workerSrc = workerUrl;
      const data = new Uint8Array(await file.arrayBuffer());
      if (stopped) return;
      task = pdf.getDocument({ data });
      const opened = await task.promise;
      if (stopped) { await opened.destroy(); return; }
      setDoc(opened);
    })().catch(e => { if (!stopped) setError(e.name === 'PasswordException' ? 'PDF berkunci. Buka kunci PDF dahulu.' : 'PDF tidak dapat dibuka. Pilih fail PDF yang sah.'); });
    return () => { stopped = true; task?.destroy().catch(() => {}); };
  }, [file]);
  return { doc, error };
}
