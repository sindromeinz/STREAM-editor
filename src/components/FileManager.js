import React, { useEffect, useState } from 'react';
import { database, ref, set, onValue, push, update, remove } from '../firebase';
import { auth } from '../firebase'; // For accessing the current user's UID and email
import { Link } from 'react-router-dom';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileAllowedUsers, setNewFileAllowedUsers] = useState('');

  const currentUserEmail = auth.currentUser?.email;
  
  // Fetch the files where the current user has access (as creator or in the allowed users list)
  useEffect(() => {
    if (currentUserEmail) {
      const filesRef = ref(database, `files`);
      onValue(filesRef, (snapshot) => {
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
              creator: data[key].creator, // Store creator email
              ...data[key]
            }));
          setFiles(accessibleFiles);
        }
      });
    }
  }, [currentUserEmail]);

  // Create a new file and automatically add the creator's email to the allowed users
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
      allowedUsers: [...allowedUsers, currentUserEmail] // Always add the creator's email
    });
    setNewFileName('');
    setNewFileAllowedUsers('');
  };

  // Add or remove access for users from the file
  const handleUpdateAllowedUsers = async (fileId, updatedAllowedUsers) => {
    const fileRef = ref(database, `files/${fileId}`);
    await update(fileRef, { allowedUsers: updatedAllowedUsers });
  };

  const handleDeleteFile = async (fileId) => {
    const fileRef = ref(database, `files/${fileId}`);
    await remove(fileRef);
  };

  return (
    <div className="container">
      <h2 className="text-center">File Manager</h2>
      <div>
        <input
          type="text"
          placeholder="New File Name"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Allowed User Emails (comma separated)"
          value={newFileAllowedUsers}
          onChange={(e) => setNewFileAllowedUsers(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateFile}>Create New File</button>
      </div>

      <ul>
        {files.map(file => (
          <li key={file.id}>
            <Link to={`/editor/${file.id}`}>{file.fileName}</Link>
            <span className="ml-2">(Created by: {file.creator})</span>
            {file.creator === currentUserEmail && (
              <div>
                <input
                  type="text"
                  defaultValue={file.allowedUsers.join(', ')}
                  onBlur={(e) => handleUpdateAllowedUsers(file.id, e.target.value.split(',').map(email => email.trim()))}
                  placeholder="Update Allowed Users"
                />
                <button className="btn btn-danger" onClick={() => handleDeleteFile(file.id)}>Delete File</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileManager;
