import React, { useEffect, useState } from 'react';
import { database, ref, push, set, onValue, remove, update, get } from '../firebase';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import './FileManager.css'; 

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileAllowedUsers, setNewFileAllowedUsers] = useState('');
  const [editUsersFileId, setEditUsersFileId] = useState(null); // To track which file's users are being edited
  const [newUserEmail, setNewUserEmail] = useState('');
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

  const handleAddUser = async (fileId) => {
    if (newUserEmail.trim() === "") return;

    const fileRef = ref(database, `files/${fileId}`);
    const fileSnapshot = await get(fileRef);  // Using 'get' to retrieve data
    const fileData = fileSnapshot.val();

    if (fileData) {
      const updatedUsers = [...fileData.allowedUsers, newUserEmail.trim()];
      await update(fileRef, { allowedUsers: updatedUsers });
      setNewUserEmail('');  // Clear input after adding
    }
  };

  const handleRemoveUser = async (fileId, userEmail) => {
    const fileRef = ref(database, `files/${fileId}`);
    const fileSnapshot = await get(fileRef);  
    const fileData = fileSnapshot.val();

    if (fileData) {
      const updatedUsers = fileData.allowedUsers.filter(user => user !== userEmail);
      await update(fileRef, { allowedUsers: updatedUsers });
    }
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
                  {file.creator === currentUserEmail && (
                    <button className="delete-btn" onClick={() => handleDeleteFile(file.id)}>Delete</button>
                  )}
                  {(
                    <button className="edit-btn" onClick={() => setEditUsersFileId(editUsersFileId === file.id ? null : file.id)}>
                    {editUsersFileId === file.id ? "Hide Users" : (file.creator === currentUserEmail ? "Manage Users" : "List Users")}
                    </button>                 
                  )}
                  {editUsersFileId === file.id && (
                    <div className="user-management">
                      <ul>
                        {file.allowedUsers.map(userEmail => (
                          <li key={userEmail} style={{ display: 'flex', alignItems: 'center' }}>
                          {userEmail === file.creator && (
                            <img
                              src = "https://cdn-icons-png.flaticon.com/256/6941/6941697.png"
                              alt = 'creator'
                              style={{ width: '20px', height: '20px', marginRight: '8px' }}
                            />
                          )}
                          {userEmail} 
                          {userEmail !== file.creator && file.creator === currentUserEmail && (
                            <button className="remove-user-btn" onClick={() => handleRemoveUser(file.id, userEmail)}>
                              Remove
                            </button>
                          )}
                         </li>
                        ))}
                      </ul>                     
                      <div className="add-user-section">
                      {file.creator === currentUserEmail && (
                        <input
                          type="text"
                          placeholder="Add new user email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          style={{
                            color: 'white',
                            fontSize: '20px'
                          }}
                        />
                      )}
                        {file.creator === currentUserEmail && (
                        <button onClick={() => handleAddUser(file.id)}>Add User</button>
                        )}
                      </div>
                    </div>
                  )}
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
