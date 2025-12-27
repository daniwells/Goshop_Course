"use client";

import JoditEditor from "jodit-react";
import { useMemo, useRef } from "react";

interface JoditFieldProps {
  value: string;
  onBlur: (value: string) => void;
}

export function JoditField({ value, onBlur }: JoditFieldProps) {
  const editorRef = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      minHeight: 300,
      spellcheck: true,
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      style: {
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
      },
    }),
    []
  );

  return (
    <JoditEditor
      ref={editorRef}
      config={config}
      onBlur={(content) => {
        onBlur(content);
      }}
    />
  );
}