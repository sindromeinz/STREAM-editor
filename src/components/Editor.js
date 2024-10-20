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
  const [content, setContent] = useState(''); // Editor content
  const [allowed, setAllowed] = useState(false); // Whether the user is allowed to edit
  const [showChatBot, setShowChatBot] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]); // Stores version history
  const [showVersionHistory, setShowVersionHistory] = useState(false); // Toggles version history display
  const previousContentRef = useRef(''); // Stores previous content for diff comparison
  const saveTimeoutRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false); // Prevents saving while updating
  const [restoringVersion, setRestoringVersion] = useState(false); // Track when a version is being restored
  const chatBotRef = useRef(null); // Declare the chatBotRef here

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
            previousContentRef.current = fileData.content || ''; // Set previous content
            setVersionHistory(fileData.versionHistory || []); // Load version history
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
    if (fileId && allowed && !isUpdating && !restoringVersion) { // Skip saving when restoring a version
      setIsUpdating(true);
      try {
        // Save the current content as a new version only if there's a significant change
        const newVersion = {
          timestamp: Date.now(),
          content: newContent, // Save the full content of the document
        };

        // Update the content and version history in Firebase
        await update(ref(database, `files/${fileId}`), {
          content: newContent,
          versionHistory: [newVersion, ...versionHistory], // Add new version at the beginning
        });

        // Update the previous content reference
        previousContentRef.current = newContent;

        console.log('Content updated successfully with version history');
      } catch (error) {
        console.error('Error updating content:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleContentChange = (newContent) => {
    // Skip content changes and save when restoring a version
    if (restoringVersion) return;

    setContent(newContent);

    if (hasSignificantChange(newContent)) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveContentToFirebase(newContent);
      }, 500);
    }
  };

  const hasSignificantChange = (newContent) => {
    const cleanedPrevious = cleanContent(previousContentRef.current);
    const cleanedNew = cleanContent(newContent);

    // Return true if content is different after trimming unnecessary whitespace, tabs, new lines
    return cleanedPrevious !== cleanedNew;
  };

  const cleanContent = (content) => {
    // Remove all non-visible characters like spaces, tabs, newlines, and normalize content
    return content
      .replace(/[\t\n\r]+/g, ' ') // Replace tabs, newlines, and carriage returns with a space
      .replace(/ {2,}/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Remove leading and trailing spaces
  };

  const toggleChatBot = () => {
    setShowChatBot((prev) => !prev);
  };

  const handleSummarize = () => {
    if (chatBotRef.current) {
      chatBotRef.current.handleCommand(`summarise ${content}`);
    }
  };

  const handleVersionSelect = (version) => {
    console.log("Restoring version:", version);

    // Set restoringVersion to true to prevent automatic save
    setRestoringVersion(true);

    // Replace current content with the selected version's content
    const restoredContent = version.content;
    setContent(restoredContent);

    // Set previous content to the restored version
    previousContentRef.current = restoredContent;

    console.log("Version successfully restored.");

    // Reset restoringVersion to false after restoring
    setRestoringVersion(false);
  };

  const toggleVersionHistory = () => {
    setShowVersionHistory((prev) => !prev);
    console.log("Version History Toggle:", !showVersionHistory);
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
            Summarize Content
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

// CSS for visibility and scrollable version list
const styles = `
.hidden {
  display: none; /* Hides the ChatBot */
}

.visible {
  display: block; /* Shows the ChatBot */
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

// Add the styles to the document
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
