import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./FlashcardList.css"; // NEW import for background and box

export default function FlashcardList() {
  const [folders, setFolders] = useState({});
  const [selectedFolder, setSelectedFolder] = useState("");
  const [flashcardsByFolder, setFlashcardsByFolder] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewStats, setReviewStats] = useState({ known: 0, again: 0, timeExpired: false });
  const [reviewComplete, setReviewComplete] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const folders = JSON.parse(localStorage.getItem("studyAppFolders") || "{}");
    const cards = JSON.parse(localStorage.getItem("flashcardsByFolder") || "{}");
    setFolders(folders);
    setFlashcardsByFolder(cards);
    const current = cards[selectedFolder] || [];
    setFlashcards(current);
  }, [selectedFolder]);

  useEffect(() => {
    if (reviewMode && !reviewComplete && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    if (timeLeft === 0 && reviewMode && !reviewComplete) {
      setReviewComplete(true);
      setReviewStats(prev => ({ ...prev, timeExpired: true }));
    }
  }, [reviewMode, timeLeft, reviewComplete]);

  const handleAddFlashcard = () => {
    if (!newQuestion || !newAnswer || !selectedFolder) return;
    const updated = [...flashcards, { question: newQuestion, answer: newAnswer }];
    updateFolderCards(updated);
    setNewQuestion("");
    setNewAnswer("");
  };

  const updateFolderCards = (updated) => {
    const updatedByFolder = { ...flashcardsByFolder, [selectedFolder]: updated };
    setFlashcards(updated);
    setFlashcardsByFolder(updatedByFolder);
    localStorage.setItem("flashcardsByFolder", JSON.stringify(updatedByFolder));
  };

  const handleDelete = (index) => {
    const updated = [...flashcards];
    updated.splice(index, 1);
    updateFolderCards(updated);
  };

  const handleExport = async (type) => {
    if (!selectedFolder) return alert("Select a folder");
    const filename = `${selectedFolder.replace(/\//g, "_")}.${type}`;
    if (type === "txt") {
      const content = flashcards.map(c => `Q: ${c.question}\nA: ${c.answer}`).join("\n\n");
      const blob = new Blob([content], { type: "text/plain" });
      downloadBlob(blob, filename);
    } else if (type === "docx") {
      const doc = new Document({
        sections: [{
          children: flashcards.flatMap(card => [
            new Paragraph({ children: [new TextRun({ text: `Q: ${card.question}`, bold: true })] }),
            new Paragraph({ children: [new TextRun(`A: ${card.answer}`)] }),
            new Paragraph("")
          ])
        }]
      });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, filename);
    } else if (type === "pdf") {
      const doc = new jsPDF();
      let y = 10;
      flashcards.forEach((card, i) => {
        doc.text(`Q${i + 1}: ${card.question}`, 10, y);
        y += 8;
        doc.text(`A${i + 1}: ${card.answer}`, 10, y);
        y += 12;
      });
      doc.save(filename);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(flashcards);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    updateFolderCards(reordered);
  };

  const markReview = (type) => {
    if (type !== "skip") {
      setReviewStats(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
    const next = reviewIndex + 1;
    if (next >= flashcards.length) {
      setReviewComplete(true);
    } else {
      setReviewIndex(next);
      setReviewFlipped(false);
    }
  };

  const previousReview = () => {
    const prev = reviewIndex - 1;
    if (prev >= 0) {
      setReviewIndex(prev);
      setReviewFlipped(false);
    }
  };

  const resetReview = (minutes = studyMinutes) => {
    setReviewIndex(0);
    setReviewStats({ known: 0, again: 0, timeExpired: false });
    setReviewComplete(false);
    setReviewFlipped(false);
    setTimeLeft(minutes * 60);
  };

  return (
    <div className="flashcard-background">
      <div className="flashcard-box">
        <h2 className="text-2xl font-bold mb-4"> Flashcards by Folder</h2>

        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select Folder --</option>
          {Object.entries(folders).map(([name]) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <div className="flex gap-4 items-center mb-4">
          <label className="text-sm font-medium">⏳ Study time:</label>
          <select value={studyMinutes} onChange={(e) => setStudyMinutes(Number(e.target.value))} className="border p-1 rounded">
            <option value={1}>1 min</option>
            <option value={3}>3 min</option>
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
          </select>
        </div>

        {flashcards.length > 0 && (
          <button onClick={() => { setReviewMode(true); resetReview(); }} className="bg-indigo-600 text-white px-3 py-2 rounded mb-6">
            ▶️ Start Review Mode
          </button>
        )}

        {/* Review Mode */}
        {reviewMode ? (
          reviewComplete ? (
            <div className="text-center bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-4">✅ Review Complete!</h3>
              {reviewStats.timeExpired ? (
                <p className="text-red-600 font-semibold mt-2">⏰ Time’s up! Review session ended.</p>
              ) : (
                <>
                  <p>👍 Got it: {reviewStats.known}</p>
                  <p>🔁 Review Again: {reviewStats.again}</p>
                </>
              )}
              <button onClick={() => resetReview()} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">🔁 Restart Review</button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded shadow text-center p-8">
              <div onClick={() => setReviewFlipped(!reviewFlipped)} className="w-full max-w-md h-64 flex items-center justify-center cursor-pointer border border-gray-300 rounded-xl text-xl font-semibold">
                {reviewFlipped ? flashcards[reviewIndex].answer : flashcards[reviewIndex].question || "No Card"}
              </div>
              <div className="flex flex-col items-center gap-1 mt-4">
                <span className="text-sm text-gray-600">Card {reviewIndex + 1} of {flashcards.length}</span>
                <span className="text-sm text-gray-600">⏱️ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</span>
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={previousReview} className="bg-gray-400 text-white px-4 py-1 rounded">⬅️ Previous</button>
                <button onClick={() => markReview("known")} className="bg-green-600 text-white px-4 py-1 rounded">✅ Got it</button>
                <button onClick={() => markReview("again")} className="bg-yellow-500 text-white px-4 py-1 rounded">🔁 Review Again</button>
                <button onClick={() => markReview("skip")} className="bg-gray-500 text-white px-4 py-1 rounded">➡️ Next</button>
              </div>
            </div>
          )
        ) : (
          <>
            <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Enter question" className="w-full border p-2 rounded mb-2 h-20 resize-none" />
            <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} placeholder="Enter answer" className="w-full border p-2 rounded mb-4 h-16 resize-none" />
            <button onClick={handleAddFlashcard} className="w-full bg-green-600 text-white py-2 rounded mb-6">➕ Add Flashcard</button>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="flashcards">
                {(provided) => (
                  <ul className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                    {flashcards.map((card, i) => (
                      <Draggable key={i} draggableId={`card-${i}`} index={i}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded shadow relative cursor-pointer"
                            onClick={() => setFlippedIndex(flippedIndex === i ? null : i)}
                          >
                            <strong>Q:</strong> {card.question}
                            {flippedIndex === i ? (
                              <p className="mt-2 text-blue-700"><strong>A:</strong> {card.answer}</p>
                            ) : (
                              <p className="text-sm text-gray-500">(Click to view answer)</p>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                              className="absolute top-2 right-2 text-red-500 text-sm"
                            >🗑️</button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>

            <div className="flex gap-2 mt-8">
              <button onClick={() => handleExport("txt")} className="bg-gray-700 text-white px-3 py-1 rounded shadow">📄 TXT</button>
              <button onClick={() => handleExport("docx")} className="bg-blue-700 text-white px-3 py-1 rounded shadow">📝 Word</button>
              <button onClick={() => handleExport("pdf")} className="bg-red-600 text-white px-3 py-1 rounded shadow">🖨️ PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
