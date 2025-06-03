import React, { useState } from 'react';

export default function LibrarySection() {
  const [folders, setFolders] = useState([
    { name: 'My Grooves', ricks: ['Rick 1', 'Rick 2'] },
    { name: 'Practice Ideas', ricks: [] }
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sharedLink, setSharedLink] = useState('');

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      setFolders([...folders, { name: newFolderName.trim(), ricks: [] }]);
      setNewFolderName('');
    }
  };

  const handleShare = (folderName) => {
    const fakeLink = window.location.origin + "/shared/" + encodeURIComponent(folderName);
    navigator.clipboard.writeText(fakeLink);
    setSharedLink(fakeLink);
    alert(`Shared link copied: ${fakeLink}`);
  };

  const handleReceive = () => {
    const sharedFolder = prompt("Enter shared folder name:");
    if (sharedFolder) {
      setFolders([...folders, { name: sharedFolder + " (shared)", ricks: ['Rick A'] }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-center">My Rick Library</h2>

      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button onClick={handleAddFolder} className="bg-blue-500 text-white px-4 py-2 rounded">Add Folder</button>
        <button onClick={handleReceive} className="bg-green-500 text-white px-4 py-2 rounded">Receive Shared</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {folders.map((folder, idx) => (
          <div key={idx} className="border rounded p-4 shadow">
            <h3 className="text-lg font-semibold mb-2">{folder.name}</h3>
            <ul className="mb-2 list-disc list-inside text-gray-700">
              {folder.ricks.map((rick, i) => <li key={i}>{rick}</li>)}
              {folder.ricks.length === 0 && <li className="italic text-gray-400">Empty</li>}
            </ul>
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setSelectedFolder(folder)}
                className="text-sm text-blue-600 underline"
              >
                Open
              </button>
              <button
                onClick={() => handleShare(folder.name)}
                className="text-sm text-orange-600 underline"
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedFolder && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h4 className="text-xl font-bold mb-2">Folder: {selectedFolder.name}</h4>
          <p className="text-gray-600">You can show detailed rick entries and playback features here.</p>
        </div>
      )}
    </div>
  );
}
