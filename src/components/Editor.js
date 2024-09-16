// src/components/Editor.js
import React, { useEffect, useState } from 'react';
import { database, ref, set, onValue } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import { useParams } from 'react-router-dom';

const Editor = () => {
  const { fileId } = useParams(); // Get fileId from URL parameters
  const [content, setContent] = useState('');

  useEffect(() => {
    if (fileId) {
      const fileRef = ref(database, `files/${fileId}`);
      onValue(fileRef, (snapshot) => {
        if (snapshot.exists()) {
          setContent(snapshot.val().content || '');
        } else {
          console.log('No data available');
        }
      });
    }
  }, [fileId]);

  const handleSave = async () => {
    if (fileId) {
      try {
        await set(ref(database, `files/${fileId}`), {
          content: content,
        });
        console.log('Data saved successfully');
      } catch (error) {
        console.error('Error writing data:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center">Rich Text Editor</h2>
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={Editor.modules}
            formats={Editor.formats}
          />
          <button className="btn btn-primary mt-3" onClick={handleSave}>Save Content</button>
        </div>
      </div>
    </div>
  );
};

// Configure modules and formats as needed
Editor.modules = {
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

Editor.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
  'color', 'background',
  'align'
];

export default Editor;
