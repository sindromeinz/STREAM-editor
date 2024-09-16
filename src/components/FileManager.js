// src/components/FileManager.js
import React, { useState, useEffect } from 'react';
import { database, ref, set, onValue } from '../firebase';
import { useNavigate } from 'react-router-dom';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [newFileName, setNewFileName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const filesRef = ref(database, 'files/');
    const unsubscribe = onValue(filesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFiles(Object.keys(data).map(key => ({ id: key, name: data[key].name })));
      } else {
        setFiles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateFile = async () => {
    if (newFileName) {
      const newFileRef = ref(database, `files/${newFileName}`);
      await set(newFileRef, { name: newFileName, content: '' }); // Initialize with empty content
      setNewFileName("");
    }
  };

  const handleOpenFile = (id) => {
    navigate(`/editor/${id}`);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center">File Manager</h2>
          <input
            type="text"
            className="form-control"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="New file name"
          />
          <button className="btn btn-primary mt-2" onClick={handleCreateFile}>Create File</button>
          <ul className="list-group mt-3">
            {files.map(file => (
              <li key={file.id} className="list-group-item">
                <span>{file.name}</span>
                <button className="btn btn-secondary btn-sm float-end" onClick={() => handleOpenFile(file.id)}>Edit</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
