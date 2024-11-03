import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

function Note({ id, title, content, onDelete, onUpdate }) {
    const noteRef = useRef(null);
    const titleRef = useRef(null);
    const contentRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedNote, setEditedNote] = useState({ title, content });

    // Handle clicks outside the note to save changes
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (noteRef.current && !noteRef.current.contains(event.target) && isEditing) {
                handleSubmitEdit(); // Submit edit on outside click
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing, editedNote]);

    // Adjust textarea height to fit content
    const adjustTextareaHeight = () => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
        }
    };

    // Adjust height on editing start and after each content change
    useEffect(() => {
        if (isEditing) {
            adjustTextareaHeight();
        }
    }, [isEditing, editedNote.content]);

    const handleEditClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedNote((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitEdit = async () => {
        if (editedNote.title.trim() === '' && editedNote.content.trim() === '') {
            setIsEditing(false);
            return; // Prevent submitting empty notes
        }
        try {
            const response = await axios.put(`/api/notes/${id}`, editedNote);
            onUpdate(response.data); // Update notes list in parent component
            setIsEditing(false); // Exit edit mode
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div className="note" ref={noteRef} onClick={handleEditClick}>
            {isEditing ? (
                <input
                    ref={titleRef}
                    name="title"
                    value={editedNote.title}
                    onChange={handleInputChange}
                    className="note-title-input"
                    placeholder="Title"
                />
            ) : (
                <h1>{title}</h1>
            )}

            {isEditing ? (
                <textarea
                    ref={contentRef}
                    name="content"
                    value={editedNote.content}
                    onChange={(e) => {
                        handleInputChange(e);
                        adjustTextareaHeight();
                    }}
                    className="note-content-input"
                    placeholder="Content"
                />
            ) : (
                <p>{content}</p>
            )}

            <button
                onClick={isEditing ? handleSubmitEdit : handleDeleteClick}
                className="note-action-btn"
            >
                {isEditing ? <CheckIcon /> : <DeleteIcon />}
            </button>
        </div>
    );
}

export default Note;
 