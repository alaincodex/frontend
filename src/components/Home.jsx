import React from 'react';

function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      //style={{ backgroundImage: "url('/sunset.jpg')" }}
    >
      <div className="bg-red bg-opacity-100 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center max-w-xl mx-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-1100">
          * HOME PAGE IS IN PROGRESS 
          
         Welcome to Smart Study Tool
        </h1>
        <p className="text-lg text-gray-700">
          Upload PDFs, generate flashcards, and learn faster with AI!
        </p>
      </div>
    </div>
  );
}

export default Home;
