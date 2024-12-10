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
    <div className="text-editor" style={{ width: '350px' }}>
      <CKEditor
        editor={ClassicEditor}
        data={editorData}
        onChange={handleEditorChange}
        config={{
          width: '350px', // Set width to 400px
          toolbar: {
            items: [
              'undo',
              'redo',
              '|',
              'italic',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'subscript',
              'superscript',
              'numberedList',
              'bulletedList',
              'link',
              'insertTable',
              'todoList',
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
            Bold,
          ],
        }}
      />
    </div>
  );
};

export default TextEditor;
