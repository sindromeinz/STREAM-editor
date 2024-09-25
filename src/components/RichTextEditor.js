import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ content, setContent }) => {
  return (
    <div className="editor-container">
      <ReactQuill 
        value={content} 
        onChange={setContent} 
        modules={RichTextEditor.modules} 
        formats={RichTextEditor.formats}
        className="mb-3"
      />
    </div>
  );
};

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
