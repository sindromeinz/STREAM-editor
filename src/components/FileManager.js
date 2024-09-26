import React, { useEffect, useState } from 'react';
import { database, ref, push, set, onValue, remove } from '../firebase';
import { auth } from '../firebase'; 
import { Link } from 'react-router-dom';
import './FileManager.css'; // Custom styles

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileAllowedUsers, setNewFileAllowedUsers] = useState('');
  const currentUserEmail = auth.currentUser?.email;

  useEffect(() => {
    const filesRef = ref(database, `files`);

    const unsubscribe = onValue(filesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const accessibleFiles = Object.keys(data)
          .filter(key => 
            data[key].creator === currentUserEmail || 
            (Array.isArray(data[key].allowedUsers) && data[key].allowedUsers.includes(currentUserEmail))
          )
          .map(key => ({
            id: key,
            fileName: data[key].fileName || 'Untitled',
            creator: data[key].creator,
            ...data[key]
          }));
        setFiles(accessibleFiles);
      } else {
        setFiles([]);
      }
    });

    return () => unsubscribe();
  }, [currentUserEmail]);

  const handleCreateFile = async () => {
    if (newFileName.trim() === "") {
      alert("File name cannot be empty");
      return;
    }

    const allowedUsers = newFileAllowedUsers
      ? newFileAllowedUsers.split(',').map(email => email.trim())
      : [];

    const newFileRef = push(ref(database, `files`));
    await set(newFileRef, {
      fileName: newFileName,
      content: '',
      creator: currentUserEmail,
      allowedUsers: [...allowedUsers, currentUserEmail]
    });

    setNewFileName('');
    setNewFileAllowedUsers('');
  };

  const handleDeleteFile = async (fileId) => {
    const fileRef = ref(database, `files/${fileId}`);
    await remove(fileRef);
  };

  return (
    <div className="glass-container">
      <h2>File Manager</h2>
      <div className="input-section">
        <input
          type="text"
          placeholder="New file name"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Allowed users (comma-separated)"
          value={newFileAllowedUsers}
          onChange={(e) => setNewFileAllowedUsers(e.target.value)}
        />
        <button onClick={handleCreateFile}>Create File</button>
      </div>
      <table className="glass-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Creator</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.length > 0 ? (
            files.map(file => (
              <tr key={file.id}>
                <td>{file.fileName}</td>
                <td>{file.creator}</td>
                <td>
                  <Link to={`/editor/${file.id}`} className="edit-btn">Edit</Link>
                  <button className="delete-btn" onClick={() => handleDeleteFile(file.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No files available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FileManager;
