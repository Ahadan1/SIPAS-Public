'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

export const TiptapEditor = ({
  content,
  onUpdate,
  isEditable = true,
}: {
  content: string;
  onUpdate: (value: string) => void;
  isEditable?: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editable: isEditable,
    // Add this line to fix the SSR hydration error
    immediatelyRender: false,
  });

  return (
    <div className="border rounded-md">
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px]" />
    </div>
  );
};