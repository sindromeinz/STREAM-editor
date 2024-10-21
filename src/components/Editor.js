import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [versionHistory, setVersionHistory] = useState([]); 
  const [showVersionHistory, setShowVersionHistory] = useState(false); 
  const previousContentRef = useRef(''); 
  const [restoringVersion, setRestoringVersion] = useState(false); 
  const chatBotRef = useRef(null); 
  const saveTimeoutRef = useRef(null); 

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
            previousContentRef.current = fileData.content || '';
            setVersionHistory(fileData.versionHistory || []);
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

  const saveContentToFirebase = useCallback((newContent) => {
    if (fileId && allowed && !restoringVersion) {
      clearTimeout(saveTimeoutRef.current); 
      saveTimeoutRef.current = setTimeout(async () => { 
        try {
          await update(ref(database, `files/${fileId}`), {
            content: newContent,
          });

          previousContentRef.current = newContent;
          console.log('Content updated successfully without creating a new version');
        } catch (error) {
          console.error('Error updating content:', error);
        }
      }, 150); 
    }
  }, [fileId, allowed, restoringVersion]);

  const handleContentChange = (newContent) => {
    if (restoringVersion) return;

    setContent(newContent);
    saveContentToFirebase(newContent);
  };

  const handleCreateVersion = async () => {
    const newVersion = {
      timestamp: Date.now(),
      content: content,
    };

    try {
      await update(ref(database, `files/${fileId}`), {
        versionHistory: [newVersion, ...versionHistory],
      });
      console.log('New version created successfully');
    } catch (error) {
      console.error('Error creating version:', error);
    }
  };

  const handleVersionSelect = (version) => {
    console.log("Restoring version:", version);
    setRestoringVersion(true);

    const restoredContent = version.content;
    setContent(restoredContent);
    previousContentRef.current = restoredContent;

    console.log("Version successfully restored.");
    setRestoringVersion(false);
  };

  const toggleChatBot = () => {
    setShowChatBot((prev) => !prev);
  };

  const handleSummarize = () => {
    setShowChatBot(true);
    if (chatBotRef.current) {
      chatBotRef.current.handleCommand(`summarise ${content}`);
    }
  };

  const toggleVersionHistory = () => {
    setShowVersionHistory((prev) => !prev);
    console.log("Version History Toggle:", !showVersionHistory);
  };

  return (
    <div className="container my-5 d-flex">
      <div className="sidebar-wrapper">
        <div className="sidebar-content">
          <button className="sidebar-button" onClick={toggleChatBot}>
            <span className="button-text">
              {showChatBot ? 'Hide ChatBot' : 'Show ChatBot'}
            </span>
          </button>
          <button className="sidebar-button" onClick={handleSummarize}>
            Summarize Content
          </button>
          <button className="sidebar-button" onClick={handleCreateVersion}>
            Create Version
          </button>
          <button className="sidebar-button" onClick={toggleVersionHistory}>
            {showVersionHistory ? 'Hide Version History' : 'Show Version History'}
          </button>
          {showVersionHistory && (
            <div className="version-list">
              {versionHistory.length === 0 ? (
                <p>No versions available.</p>
              ) : (
                versionHistory.map((version, index) => (
                  <button key={index} onClick={() => handleVersionSelect(version)}>
                    Version {versionHistory.length - index} - {new Date(version.timestamp).toLocaleString()}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="editor-container flex-grow-1">
        {allowed ? (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="text-center">STREAM Editor</h2>
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
          <p className="text-center text-danger">File does not exist or you do not have access to this file</p>
        )}

        <div className={`chatbot-container ${showChatBot ? 'visible' : 'hidden'}`}>
          <ChatBot ref={chatBotRef} />
        </div>
      </div>
    </div>
  );
};

const styles = `
.hidden {
  display: none; 
}

.visible {
  display: block; 
}

.version-list {
  max-height: 600px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  margin-top: 10px;
  background-color: #f9f9f9;
}

.version-list button {
  display: block;
  margin: 5px 0;
  padding: 5px 10px;
  width: 100%;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.version-list button:hover {
  background-color: #0056b3;
}
`;

const styleElement = document.createElement("style");
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

Editor.modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    [{ 'align': [] }],
    ['color', 'background'],
    ['font'],
  ],
};

Editor.formats = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'indent',
  'link', 'image', 'color', 'background', 'font',
  'align'
];

export default Editor;
