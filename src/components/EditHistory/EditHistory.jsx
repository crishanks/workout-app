import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import './EditHistory.css';

export const EditHistory = ({ workoutHistory, onBack, onUpdateSession }) => {
    const [selectedSession, setSelectedSession] = useState(null);
    const [editedSets, setEditedSets] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        const sets = {};
        session.exercises.forEach(ex => {
            sets[ex.name] = { ...ex.sets };
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
            timestamp: new Date().toISOString()
        });

        setShowConfirmModal(false);
        setSelectedSession(null);
        setEditedSets({});
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
                        <p className="session-date">
                            {new Date(selectedSession.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
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
                                                value={editedSets[exercise.name]?.[setIdx]?.weight || set.weight}
                                                onChange={(e) => handleSetChange(exercise.name, setIdx, 'weight', e.target.value)}
                                                className="weight-input"
                                                placeholder="lbs"
                                            />
                                            <input
                                                type="number"
                                                value={editedSets[exercise.name]?.[setIdx]?.reps || set.reps}
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

            <main className="content">
                <div className="history-groups">
                    {sortedGroups.map(([key, group]) => (
                        <div key={key} className="history-group">
                            <h3 className="group-header">Round {group.round}, Week {group.week}</h3>
                            <div className="sessions-list">
                                {group.sessions
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((session, idx) => (
                                        <div key={idx} className="session-item" onClick={() => handleEditSession(session)}>
                                            <div className="session-info">
                                                <strong>{session.day}</strong>
                                                <span className="session-date">
                                                    {new Date(session.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="session-exercises">
                                                {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
                                            </div>
                                            <span className="edit-icon">
                                                <Edit3 size={18} />
                                            </span>
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
