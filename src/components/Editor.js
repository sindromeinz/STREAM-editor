import React, { useEffect, useState } from 'react';
import { database, ref, update, onValue } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom';
import { auth } from '../firebase'; // For accessing the current user's UID
import './Editor.css'

const Editor = () => {
  const { fileId } = useParams();
  const [content, setContent] = useState('');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (fileId) {
      const fileRef = ref(database, `files/${fileId}`);
      onValue(fileRef, (snapshot) => {
        if (snapshot.exists()) {
          const fileData = snapshot.val();
          const currentUserEmail = auth.currentUser?.email;

          if (fileData.allowedUsers.includes(currentUserEmail)) {
            setAllowed(true);
            setContent(fileData.content || '');
          } else {
            setAllowed(false);
            console.log('Access denied: You are not allowed to edit this file.');
          }
        } else {
          console.log('No data available');
        }
      });
    }
  }, [fileId]);

  const handleSave = async () => {
    if (fileId && allowed) {
      try {
        await update(ref(database, `files/${fileId}`), {
          content: content,
        });
        console.log('Content updated successfully');
      } catch (error) {
        console.error('Error updating content:', error);
      }
    }
  };

  return (
    <div className="container my-5">
      {allowed ? (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <h2 className="text-center">Rich Text Editor</h2>
            <div className="quill-container">
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
      ) : (
        <p className="text-center text-danger">You do not have access to this file.</p>
      )}
    </div>
  );
};

Editor.modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
  'align',
];

export default Editor;
