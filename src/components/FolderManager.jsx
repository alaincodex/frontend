// src/components/FolderManager.jsx
import React, { useState, useEffect } from "react";

export default function FolderManager({ onSelectFolderPath }) {
  const [folders, setFolders] = useState({});
  const [path, setPath] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("nestedFolders");
    if (stored) setFolders(JSON.parse(stored));
  }, []);

  const saveFolders = (data) => {
    localStorage.setItem("nestedFolders", JSON.stringify(data));
    setFolders(data);
  };

  const getCurrentLevel = () => {
    return path.reduce((acc, key) => acc[key]?.subfolders || {}, folders);
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const updated = { ...folders };
    let level = updated;
    path.forEach((key) => {
      level = level[key].subfolders;
    });
    level[newFolderName] = { subfolders: {}, flashcards: [] };
    saveFolders(updated);
    setNewFolderName("");
  };

  const goToFolder = (key) => {
    setPath([...path, key]);
  };

  const goBack = (index) => {
    setPath(path.slice(0, index + 1));
  };

  const selectCurrent = () => {
    const currentPath = [...path];
    onSelectFolderPath(currentPath);
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="font-bold mb-2">📁 Folder Navigation</h3>

      <div className="text-sm text-gray-600 mb-2">
        Path: {path.length ? path.map((p, i) => (
          <span
            key={i}
            className="cursor-pointer text-blue-500"
            onClick={() => goBack(i)}
          >
            {p} / 
          </span>
        )) : "root/"}
      </div>

      <ul className="mb-4">
        {Object.keys(currentLevel).map((key) => (
          <li key={key} className="cursor-pointer hover:text-blue-500" onClick={() => goToFolder(key)}>
            📁 {key}
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="New folder name"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        className="border p-1 mr-2"
      />
      <button onClick={addFolder} className="bg-blue-600 text-white px-2 py-1 rounded">Add Folder</button>

      <div className="mt-4">
        <button onClick={selectCurrent} className="bg-green-600 text-white px-4 py-1 rounded">
          ✅ Select This Folder
        </button>
      </div>
    </div>
  );
}
