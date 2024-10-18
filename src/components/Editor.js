import React, { useEffect, useState, useRef } from 'react';
import { database, ref, update, onValue } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom'; 
import { auth } from '../firebase'; 
import ChatBot from './ChatBot'; // Import the ChatBot component
import './Editor.css';

const Editor = () => {
  const { fileId } = useParams();
  const [content, setContent] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false); // State for sidebar visibility
  const [isUpdating, setIsUpdating] = useState(false); // Track if an update is in progress
  const saveTimeoutRef = useRef(null); // Use useRef to hold the timeout

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

  // Debounced save function
  const saveContentToFirebase = async (newContent) => {
    if (fileId && allowed && !isUpdating) {
      setIsUpdating(true); // Prevent multiple updates
      try {
        await update(ref(database, `files/${fileId}`), {
          content: newContent,
        });
        console.log('Content updated successfully');
      } catch (error) {
        console.error('Error updating content:', error);
      } finally {
        setIsUpdating(false); // Reset update state
      }
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent); // Update local state

    // Debounce the save operation
    if (newContent !== content) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); // Clear previous timeout
      saveTimeoutRef.current = setTimeout(() => {
        saveContentToFirebase(newContent);
      }, 500); // Delay in milliseconds
    }
  };

  const toggleChatBot = () => {
    setShowChatBot((prev) => !prev); // Toggle sidebar visibility
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
                onChange={handleContentChange} // Update the handler
                modules={Editor.modules}
                formats={Editor.formats}
              />
              {/* Removed the Save Content button */}
              {/* Moved ChatBot toggle button here */}
              <button className="btn btn-secondary mt-3" onClick={toggleChatBot}>
                {showChatBot ? 'Hide ChatBot' : 'Show ChatBot'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-danger">You do not have access to this file.</p>
      )}

      {showChatBot && (
        <div className="chatbot-sidebar">
          <ChatBot />
        </div>
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
