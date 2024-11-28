import React, { useEffect, useState } from "react";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";

export default function Notes() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get("/api");
                setNotes(response.data); // Populate notes with data from the database
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };

        fetchNotes();
    }, []);

    async function addNewNote(newNote) {
        try {
            const response = await axios.post('/api/notes', newNote);
            setNotes((prevNotes) => [...prevNotes, response.data]); // Add new note to state
        } catch (error) {
            console.error("Error adding new note:", error);
        }
    }

    const deleteNote = async (id) => {
        try {
            await axios.delete(`/api/notes/${id}`);
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id)); // Remove note from state
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    const updateNote = (updatedNote) => {
        setNotes((prevNotes) =>
            prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
        ); // Update the note in the state
    };

    return (
        <div>
            <Header />
            <CreateArea onAdd={addNewNote} />
            <div className="main-content">
                {notes.map((note, index) => (
                    <Note
                        id={note.id}
                        key={note.id}
                        title={note.title}
                        content={note.content}
                        onDelete={deleteNote}
                        onUpdate={updateNote} // Pass update function
                    />
                ))}
            </div>
            <p className="gap"> </p>
            <Footer />
        </div>
    );
}
