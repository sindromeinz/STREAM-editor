import React, { useEffect, useState } from 'react';
import { database, ref, set, onValue, push, update, remove } from '../firebase';
import { auth } from '../firebase'; // For accessing the current user's UID and email
import { Link } from 'react-router-dom';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileAllowedUsers, setNewFileAllowedUsers] = useState('');

  const currentUserEmail = auth.currentUser?.email;
  
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
              creator: data[key].creator,
              ...data[key]
            }));
          setFiles(accessibleFiles);
        }
      });
    }
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
      allowedUsers: [...allowedUsers, currentUserEmail] // Always add the creator's email
    });
    setNewFileName('');
    setNewFileAllowedUsers('');
  };

  const handleUpdateAllowedUsers = async (fileId, updatedAllowedUsers) => {
    const fileRef = ref(database, `files/${fileId}`);
    await update(fileRef, { allowedUsers: updatedAllowedUsers });
  };

  const handleDeleteFile = async (fileId) => {
    const fileRef = ref(database, `files/${fileId}`);
    await remove(fileRef);
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">File Manager</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="New file name"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
        />
        <input
          type="text"
          className="form-control mt-2"
          placeholder="Allowed users (comma-separated)"
          value={newFileAllowedUsers}
          onChange={(e) => setNewFileAllowedUsers(e.target.value)}
        />
        <button className="btn btn-success mt-2" onClick={handleCreateFile}>Create File</button>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Creator</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id}>
              <td>{file.fileName}</td>
              <td>{file.creator}</td>
              <td>
                <Link to={`/editor/${file.id}`} className="btn btn-info me-2">Edit</Link>
                <button className="btn btn-danger" onClick={() => handleDeleteFile(file.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileManager;
