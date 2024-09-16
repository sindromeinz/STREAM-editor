// src/components/RichTextEditor.js
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import { database, ref, onValue, set } from '../firebase';
import { useParams } from 'react-router-dom';

const RichTextEditor = () => {
  const { fileId } = useParams();
  const [editorHtml, setEditorHtml] = useState('');

  useEffect(() => {
    const fileRef = ref(database, `files/${fileId}`);
    const unsubscribe = onValue(fileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEditorHtml(data.content || '');
      }
    });

    return () => unsubscribe();
  }, [fileId]);

  const handleChange = (html) => {
    setEditorHtml(html);
    set(ref(database, `files/${fileId}`), { content: html });
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center">Rich Text Editor</h2>
          <ReactQuill
            value={editorHtml}
            onChange={handleChange}
            modules={RichTextEditor.modules}
            formats={RichTextEditor.formats}
          />
        </div>
      </div>
    </div>
  );
};

// Configure modules and formats as needed
RichTextEditor.modules = {
  toolbar: [
    [{ 'header': '1'}, { 'header': '2' }],
    ['bold', 'italic', 'underline'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
  ],
};

RichTextEditor.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
  'color', 'background',
  'align'
];

export default RichTextEditor;
