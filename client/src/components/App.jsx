// imports
import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";

export default function App() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get("/api");
                console.log(response.data);
                setNotes(response.data); // Populate notes with data from the database
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };

        fetchNotes();
    }, []);

    async function addNewNote(newNote) {
        try {
            // Send POST request to backend to add the new note
            const response = await axios.post('/api/notes', newNote);
            console.log("Response after adding new note:", response.data);
            // Update state only if the POST request is successful
            setNotes((prevNotes) => [...prevNotes, response.data]);
        } catch (error) {
            console.error("Error adding new note:", error);
        }
    }

    const deleteNote = async (id) => {
        try {
            // Send DELETE request to backend with the unique note id
            await axios.delete(`/api/notes/${id}`);

            // Update state to remove the deleted note by id
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
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
                    />
                ))}
            </div>
            <p> </p>
            <Footer />
        </div>
    );
} 