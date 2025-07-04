import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  AutoLink,
  Link,
  List,
  TodoList,
  Table,
  TableToolbar,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import { useState, useEffect } from 'react';

const TextEditor = ({ initialValue, onChange }) => {
  const [editorData, setEditorData] = useState(initialValue || '');

  useEffect(() => {
    setEditorData(initialValue || '');
  }, [initialValue]);

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
    onChange(data);
  };

  return (
    <div className="text-editor w-full">
      <style>
        {`
          .ck-editor {
            width: 100% !important;
          }
          
          .ck-editor__main > .ck-editor__editable {
            width: 100% !important;
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
          }
          
          .ck-content {
            width: 100% !important;
          }
          
          /* Dark mode styles */
          .dark .ck-editor__editable,
          .dark .ck.ck-editor__main > .ck-editor__editable.ck-rounded-corners {
            background-color: rgb(55 65 81) !important;
            color: rgb(243 244 246) !important;
            border-color: rgb(75 85 99) !important;
          }
          
          .dark .ck.ck-toolbar {
            background-color: rgb(31 41 55) !important;
            border-color: rgb(75 85 99) !important;
          }
          
          .dark .ck.ck-toolbar .ck-toolbar__item > .ck-button {
            color: rgb(243 244 246) !important;
          }
          
          .dark .ck.ck-toolbar .ck-toolbar__item > .ck-button:hover {
            background-color: rgb(55 65 81) !important;
          }
          
          .dark .ck.ck-toolbar .ck-toolbar__item > .ck-button.ck-on {
            background-color: rgb(59 130 246) !important;
            color: white !important;
          }
          
          .dark .ck.ck-editor {
            border-color: rgb(75 85 99) !important;
          }
          
          /* Focus styles for dark mode */
          .dark .ck-editor__editable:focus {
            border-color: rgb(59 130 246) !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          }
          
          /* Placeholder text in dark mode */
          .dark .ck-editor__editable.ck-placeholder::before {
            color: rgb(156 163 175) !important;
          }
        `}
      </style>
      <CKEditor
        editor={ClassicEditor}
        data={editorData}
        onChange={handleEditorChange}
        config={{
          toolbar: {
            items: [
              'undo',
              'redo',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'subscript',
              'superscript',
              '|',
              'numberedList',
              'bulletedList',
              'todoList',
              '|',
              'link',
              '|',
              'insertTable',
            ],
          },
          plugins: [
            Bold,
            Italic,
            Strikethrough,
            Subscript,
            Superscript,
            Underline,
            Essentials,
            Mention,
            Paragraph,
            Undo,
            AutoLink,
            Link,
            List,
            TodoList,
            Table,
            TableToolbar,
          ],
          placeholder: 'Describe your property in detail...',
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
        }}
      />
    </div>
  );
};

export default TextEditor;
