import React from "react";

export default function UploadPDF() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded mt-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">📄 Upload PDFs</h1>
      <p className="text-lg text-gray-700 mb-4">
        You will be able to upload and process PDFs here. This feature is coming soon!
      </p>
      <div className="text-center mt-4">
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Upload PDF (Coming Soon)
        </button>
      </div>
    </div>
  );
}