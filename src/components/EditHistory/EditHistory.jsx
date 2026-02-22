import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import './EditHistory.css';

export const EditHistory = ({ workoutHistory, onBack, onUpdateSession, onDeleteSession, onUpdateDate }) => {
    const [selectedSession, setSelectedSession] = useState(null);
    const [editedSets, setEditedSets] = useState({});
    const [editedDate, setEditedDate] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState(null);

    // Helper to parse date as local date (not UTC)
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        // Extract just the date part (YYYY-MM-DD)
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        // Parse as noon local time to avoid timezone shifts
        return new Date(datePart + 'T12:00:00');
    };

    const groupedSessions = workoutHistory.reduce((acc, session) => {
        const round = session.round || 1;
        const week = session.week || 1;
        const key = `R${round}-W${week}`;

        if (!acc[key]) {
            acc[key] = { round, week, sessions: [] };
        }
        acc[key].sessions.push(session);
        return acc;
    }, {});

    const sortedGroups = Object.entries(groupedSessions).sort((a, b) => {
        const [aRound, aWeek] = [a[1].round, a[1].week];
        const [bRound, bWeek] = [b[1].round, b[1].week];
        if (aRound !== bRound) return bRound - aRound;
        return bWeek - aWeek;
    });

    const handleEditSession = (session) => {
        setSelectedSession(session);
        // Extract date from session.date (handle both ISO strings and date-only strings)
        const dateStr = session.date.includes('T') ? session.date.split('T')[0] : session.date;
        setEditedDate(dateStr);
        
        const sets = {};
        session.exercises.forEach(ex => {
            const exerciseSets = {};
            Object.entries(ex.sets).forEach(([setIdx, set]) => {
                exerciseSets[setIdx] = {
                    weight: set.weight ?? '',
                    reps: set.reps ?? ''
                };
            });
            sets[ex.name] = exerciseSets;
        });
        setEditedSets(sets);
    };

    const handleSetChange = (exerciseName, setIdx, field, value) => {
        setEditedSets(prev => ({
            ...prev,
            [exerciseName]: {
                ...prev[exerciseName],
                [setIdx]: {
                    ...prev[exerciseName]?.[setIdx],
                    [field]: value
                }
            }
        }));
    };

    const handleSaveChanges = () => {
        setShowConfirmModal(true);
    };

    const confirmSave = () => {
        const updatedExercises = Object.entries(editedSets).map(([name, sets]) => ({
            name,
            sets
        }));

        onUpdateSession({
            ...selectedSession,
            exercises: updatedExercises,
            date: editedDate
        });

        setShowConfirmModal(false);
        setSelectedSession(null);
        setEditedSets({});
        setEditedDate('');
    };

    const handleDeleteClick = (session, e) => {
        e.stopPropagation(); // Prevent opening edit view
        setSessionToDelete(session);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (sessionToDelete) {
            onDeleteSession(sessionToDelete.id);
            setShowDeleteModal(false);
            setSessionToDelete(null);
        }
    };

    if (selectedSession) {
        return (
            <div className="app">
                <header className="header">
                    <h1>Edit Workout</h1>
                    <button className="back-btn" onClick={() => setSelectedSession(null)}>← Back</button>
                </header>

                <Modal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmSave}
                    title="Save Changes?"
                    message="This will update your workout history. Are you sure?"
                />

                <main className="content">
                    <div className="edit-session-header">
                        <h2>{selectedSession.day}</h2>
                        <div className="date-edit-row">
                            <label htmlFor="workout-date">Date:</label>
                            <input
                                id="workout-date"
                                type="date"
                                value={editedDate}
                                onChange={(e) => setEditedDate(e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <p className="session-meta">Round {selectedSession.round}, Week {selectedSession.week}</p>
                    </div>

                    <div className="edit-exercises">
                        {selectedSession.exercises.map((exercise, exIdx) => (
                            <div key={exIdx} className="edit-exercise-card">
                                <h3>{exercise.name}</h3>
                                <div className="edit-sets">
                                    {Object.entries(exercise.sets).map(([setIdx, set]) => (
                                        <div key={setIdx} className="edit-set-row">
                                            <span className="set-label">
                                                {setIdx.startsWith('warmup') ? `W${setIdx.split('-')[1]}` : `Set ${parseInt(setIdx) + 1}`}
                                            </span>
                                            <input
                                                type="number"
                                                value={editedSets[exercise.name]?.[setIdx]?.weight ?? ''}
                                                onChange={(e) => handleSetChange(exercise.name, setIdx, 'weight', e.target.value)}
                                                className="weight-input"
                                                placeholder="lbs"
                                            />
                                            <input
                                                type="number"
                                                value={editedSets[exercise.name]?.[setIdx]?.reps ?? ''}
                                                onChange={(e) => handleSetChange(exercise.name, setIdx, 'reps', e.target.value)}
                                                className="reps-input"
                                                placeholder="reps"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="save-changes-btn" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <header className="header">
                <h1>Edit History</h1>
                <button className="back-btn" onClick={onBack}>← Back</button>
            </header>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Workout?"
                message={`This will permanently delete the ${sessionToDelete?.day} workout from ${sessionToDelete ? parseLocalDate(sessionToDelete.date).toLocaleDateString() : ''}. This cannot be undone.`}
            />

            <main className="content">
                <div className="history-groups">
                    {sortedGroups.map(([key, group]) => (
                        <div key={key} className="history-group">
                            <h3 className="group-header">Round {group.round}, Week {group.week}</h3>
                            <div className="sessions-list">
                                {group.sessions
                                    .sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
                                    .map((session, idx) => (
                                        <div key={idx} className="session-item" onClick={() => handleEditSession(session)}>
                                            <div className="session-info">
                                                <strong>{session.day}</strong>
                                                <span className="session-date">
                                                    {parseLocalDate(session.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="session-exercises">
                                                {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="session-actions">
                                                <button
                                                    className="delete-icon-btn"
                                                    onClick={(e) => handleDeleteClick(session, e)}
                                                    title="Delete workout"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <span className="edit-icon">
                                                    <Edit3 size={18} />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};
