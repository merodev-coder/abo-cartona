'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useUploadThing } from '@/utils/uploadthing';
import Icon from '@/components/ui/AppIcon';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const { startUpload, isUploading } = useUploadThing('productImages', {
    onClientUploadComplete: (res: any) => {
      if (res?.[0]?.url) {
        editor?.chain().focus().setImage({ src: res[0].url }).run();
      }
    },
    onUploadError: (err: Error) => {
      alert(`Upload failed: ${err.message}`);
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-border my-6 max-w-full h-auto shadow-2xl',
        },
      }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[250px] p-4 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        startUpload([file]);
      }
    },
    [startUpload]
  );

  if (!editor) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border bg-surface-secondary/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface-secondary/50">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon="icon-bold"
          label="Bold"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon="icon-italic"
          label="Italic"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon="icon-underline"
          label="Underline"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          icon="icon-h1"
          label="H1"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon="icon-h2"
          label="H2"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon="icon-list-bullet"
          label="List"
        />
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          icon="icon-align-left"
          label="Left"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          icon="icon-align-center"
          label="Center"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          icon="icon-align-right"
          label="Right"
        />
        <MenuButton
          onClick={() => {
            const url = window.prompt('URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')}
          icon="icon-link"
          label="Link"
        />
        <div className="w-px h-6 bg-border mx-1" />

        {/* Image Upload Button */}
        <label
          className={`p-2 rounded-lg hover:bg-surface-secondary cursor-pointer transition-all flex items-center justify-center ${isUploading ? 'opacity-50 animate-pulse' : ''}`}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Icon name="PhotoIcon" size={18} className="text-text-muted" />
        </label>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function MenuButton({
  onClick,
  active,
  icon,
  label,
}: {
  onClick: () => void;
  active: boolean;
  icon: string;
  label: string;
}) {
  // Mapping simple icon names to HeroIcons for now
  const iconMap: Record<string, any> = {
    'icon-bold': 'ChevronDownIcon', // Placeholder mapping
    'icon-italic': 'ChevronDownIcon',
    'icon-underline': 'ChevronDownIcon',
    'icon-h1': 'ChevronDownIcon',
    'icon-h2': 'ChevronDownIcon',
    'icon-list-bullet': 'ListBulletIcon',
    'icon-align-left': 'Bars3BottomLeftIcon',
    'icon-align-center': 'Bars3Icon',
    'icon-align-right': 'Bars3BottomRightIcon',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
        active
          ? 'bg-brand-500 text-text-dark-primary font-bold'
          : 'text-text-muted hover:bg-surface-secondary'
      }`}
      title={label}
    >
      {/* Fallback to text if icon not found */}
      <span className="text-[10px] uppercase font-black">{label[0]}</span>
    </button>
  );
}
