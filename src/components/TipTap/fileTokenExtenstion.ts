import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FileTokenComponent from './FileToken'; // React component for file tokens

export const FileTokenNode = Node.create({
  name: 'fileToken',
  group: 'inline', // Set this to inline so that the token appears inline with text
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      fileName: {
        default: 'Untitled File',
      },
      placeholderId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'file-token',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['file-token', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileTokenComponent); // Render the React component
  },
});
