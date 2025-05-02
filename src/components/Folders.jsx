import React, { useState, useEffect } from "react";

export default function Folders() {
  const [folders, setFolders] = useState({});
  const [folderName, setFolderName] = useState("");
  const [selectedParent, setSelectedParent] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("studyAppFolders")) || {};
    setFolders(stored);
  }, []);

  const saveToStorage = (newData) => {
    localStorage.setItem("studyAppFolders", JSON.stringify(newData));
    setFolders(newData);
  };

  const createFolder = () => {
    if (!folderName.trim()) return;

    const path = selectedParent ? selectedParent.split("/") : [];
    let pointer = folders;

    for (const part of path) {
      if (!pointer[part]) pointer[part] = { subfolders: {} };
      pointer = pointer[part].subfolders;
    }

    pointer[folderName] = { subfolders: {} };
    saveToStorage({ ...folders });
    setFolderName("");
  };

  const deleteFolder = (path) => {
    const parts = path.split("/");
    let pointer = folders;

    for (let i = 0; i < parts.length - 1; i++) {
      pointer = pointer[parts[i]].subfolders;
    }

    delete pointer[parts[parts.length - 1]];
    saveToStorage({ ...folders });
  };

  const renderTree = (obj, basePath = "") =>
    Object.entries(obj).map(([name, data]) => {
      const currentPath = basePath ? `${basePath}/${name}` : name;
      return (
        <div key={currentPath} className="ml-4 mt-2 bg-white p-2 rounded shadow-sm">
          <div className="flex justify-between items-center">
            <span>📁 {name}</span>
            <button
              className="text-sm text-red-500 ml-2"
              onClick={() => deleteFolder(currentPath)}
            >
              Delete
            </button>
          </div>
          {data.subfolders && renderTree(data.subfolders, currentPath)}
        </div>
      );
    });

  const folderOptions = (obj, base = "") => {
    return Object.entries(obj).flatMap(([name, data]) => {
      const fullPath = base ? `${base}/${name}` : name;
      return [
        <option key={fullPath} value={fullPath}>
          {fullPath}
        </option>,
        ...folderOptions(data.subfolders || {}, fullPath),
      ];
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">📁 Folder Manager</h2>
      <label className="block mb-2">New Folder Name:</label>
      <input
        type="text"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-2">Parent Folder:</label>
      <select
        value={selectedParent}
        onChange={(e) => setSelectedParent(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">None (Top-Level)</option>
        {folderOptions(folders)}
      </select>

      <button
        onClick={createFolder}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ➕ Create Folder
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">🗂️ Folder Structure</h3>
        {renderTree(folders)}
      </div>
    </div>
  );
}
