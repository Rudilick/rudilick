import React from 'react';

export default function AccountSection() {
  const user = {
    name: "John Doe",
    email: "john.drummer@example.com",
    joined: "2024-12-01",
    uploads: 7,
    sharedByMe: 3,
    sharedByOthers: 14,
    views: 420
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 py-6 bg-gray-900 text-white rounded-xl shadow border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">My Account</h2>

      <div className="space-y-3 mb-6">
        <div className="text-lg"><strong>Name:</strong> {user.name}</div>
        <div className="text-lg"><strong>Email:</strong> {user.email}</div>
        <div className="text-lg"><strong>Joined:</strong> {user.joined}</div>
      </div>

      <div className="border-t pt-4 text-gray-300">
        <h3 className="text-xl font-semibold mb-3">Activity Summary</h3>
        <ul className="space-y-2">
          <li>📝 Total Ricks Created: <strong>{user.uploads}</strong></li>
          <li>📤 Shared by Me: <strong>{user.sharedByMe}</strong></li>
          <li>📡 Shared by Others: <strong>{user.sharedByOthers}</strong></li>
          <li>👀 Total Views: <strong>{user.views}</strong></li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded">
          Log Out
        </button>
      </div>
    </div>
  );
}