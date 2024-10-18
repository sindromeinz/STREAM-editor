import React, { useEffect, useState, useRef } from 'react';
import { database, ref, update, onValue } from '../firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams } from 'react-router-dom'; 
import { auth } from '../firebase'; 
import ChatBot from './ChatBot'; 
import './Editor.css';

const Editor = () => {
  const { fileId } = useParams();
  const [content, setContent] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const saveTimeoutRef = useRef(null);
  
  // Create a ref for the ChatBot
  const chatBotRef = useRef();

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

  const saveContentToFirebase = async (newContent) => {
    if (fileId && allowed && !isUpdating) {
      setIsUpdating(true); 
      try {
        await update(ref(database, `files/${fileId}`), {
          content: newContent,
        });
        console.log('Content updated successfully');
      } catch (error) {
        console.error('Error updating content:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    if (newContent !== content) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveContentToFirebase(newContent);
      }, 500);
    }
  };

  const toggleChatBot = () => {
    setShowChatBot((prev) => !prev);
  };

  const handleSummarize = () => {
    if (chatBotRef.current) {
      chatBotRef.current.handleCommand(`summarise ${content}`);
    }
  };

  return (
    <div className="container my-5 d-flex">
      {/* Sliding sidebar */}
      <div className="sidebar-wrapper">
        <div className="sidebar-content">
          <button className="sidebar-button" onClick={toggleChatBot}>
            <span className="button-text">
              {showChatBot ? 'Hide ChatBot' : 'Show ChatBot'}
            </span>
          </button>
          <button className="sidebar-button" onClick={handleSummarize}>
            Summarise Content
          </button>
        </div>
      </div>

      <div className="editor-container flex-grow-1">
        {allowed ? (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="text-center">Rich Text Editor</h2>
              <div className="quill-container">
                <ReactQuill
                  value={content}
                  onChange={handleContentChange}
                  modules={Editor.modules}
                  formats={Editor.formats}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-danger">You do not have access to this file.</p>
        )}

        {/* Keep ChatBot always mounted, just toggle visibility */}
        <div className={`chatbot-container ${showChatBot ? 'visible' : 'hidden'}`}>
          <ChatBot ref={chatBotRef} />
        </div>
      </div>
    </div>
  );
};

// CSS for visibility
const styles = `
.hidden {
  display: none; /* Hides the ChatBot */
}

.visible {
  display: block; /* Shows the ChatBot */
}
`;

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

// Add the styles to the document
const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default Editor;
