import { useState, useEffect } from 'react';
import { workoutProgram } from './data/workoutData';
import { useWorkoutHistory } from './hooks/useWorkoutHistory';
import { useExerciseVariants } from './hooks/useExerciseVariants';
import { useStats } from './hooks/useStats';
import { useRoundManager } from './hooks/useRoundManager';
import { Header } from './components/Header/Header';
import { DayTabs } from './components/DayTabs/DayTabs';
import { RestDay } from './components/RestDay/RestDay';
import { ExerciseCard } from './components/ExerciseCard/ExerciseCard';
import { WorkoutHistory } from './components/WorkoutHistory/WorkoutHistory';
import { Stats } from './components/Stats/Stats';
import { RoundStart } from './components/RoundStart/RoundStart';
import { RoundComplete } from './components/RoundComplete/RoundComplete';
import { EditHistory } from './components/EditHistory/EditHistory';
import { Modal } from './components/Modal/Modal';
import './App.css';

function App() {
  const [currentDay, setCurrentDay] = useState(0);
  const [showExercise, setShowExercise] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [historyRound, setHistoryRound] = useState(null);
  const [showRestartModal, setShowRestartModal] = useState(false);

  const { logSet, getLastWorkout, getCurrentLog, getAllRounds, workoutHistory, clearRoundData, updateSession } = useWorkoutHistory();
  const { exerciseVariants, getActiveExercise, setExerciseVariant } = useExerciseVariants();
  const stats = useStats(workoutHistory);
  const roundManager = useRoundManager();

  const currentRound = roundManager.getCurrentRound();
  const currentWeek = roundManager.getCurrentWeekInRound();
  const hasActiveRound = roundManager.hasActiveRound();
  const isComplete = roundManager.isRoundComplete();

  // Reset expanded exercise when day changes
  useEffect(() => {
    setShowExercise(null);
  }, [currentDay]);

  useEffect(() => {
    if (isComplete) {
      roundManager.endRound();
    }
  }, [isComplete]);

  const handleStartRound = () => {
    const roundToStart = currentRound || 1;
    roundManager.startRound(roundToStart);
  };

  const handleRestartRound = () => {
    clearRoundData(currentRound);
    roundManager.restartCurrentRound();
    setShowRestartModal(false);
  };

  const programWeek = currentWeek ? ((currentWeek - 1) % 12) + 1 : 1;
  const week = workoutProgram.weeks.find(w => w.week === programWeek);
  const day = week?.days[currentDay];
  const dayName = day?.day;

  const getExerciseKey = (exerciseIdx) => `${dayName}-ex${exerciseIdx}`;

  if (!hasActiveRound) {
    return <RoundStart roundNumber={currentRound || 1} onStart={handleStartRound} />;
  }

  if (isComplete) {
    return (
      <RoundComplete 
        roundNumber={currentRound} 
        stats={stats} 
        onStartNext={() => {
          roundManager.startRound(currentRound + 1);
        }} 
      />
    );
  }

  if (showEditHistory) {
    return (
      <EditHistory 
        workoutHistory={workoutHistory}
        onBack={() => setShowEditHistory(false)}
        onUpdateSession={updateSession}
      />
    );
  }

  if (showStats) {
    return <Stats stats={stats} onBack={() => setShowStats(false)} />;
  }

  if (showHistory) {
    const rounds = getAllRounds(dayName);
    return (
      <WorkoutHistory 
        dayName={dayName} 
        rounds={rounds}
        selectedRound={historyRound}
        onRoundSelect={setHistoryRound}
        onBack={() => {
          setShowHistory(false);
          setHistoryRound(null);
        }} 
      />
    );
  }

  return (
    <div className="app">
      <Header 
        currentWeek={currentWeek} 
        currentRound={currentRound}
        programWeek={programWeek}
        onRestart={() => setShowRestartModal(true)}
        canRestart={roundManager.canRestart()}
      />
      <DayTabs days={week?.days || []} currentDay={currentDay} onDayChange={setCurrentDay} />

      <Modal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={handleRestartRound}
        title="Restart Round?"
        message={`This will restart Round ${currentRound} from Week 1. Your workout history will be preserved, but the timer will reset. Are you sure?`}
      />

      <main className="content">
        {day?.exercises.length === 0 ? (
          <RestDay />
        ) : (
          <>
            <div className="day-header">
              <h2 className="day-title">{day?.day}</h2>
              <div className="header-actions">
                <button className="history-btn" onClick={() => setShowHistory(true)} title="View History">
                  📊
                </button>
                <button className="stats-btn" onClick={() => setShowStats(true)} title="View Stats">
                  📈
                </button>
                <button className="edit-btn" onClick={() => setShowEditHistory(true)} title="Edit History">
                  ✏️
                </button>
              </div>
            </div>
            <div className="exercises">
              {day?.exercises.map((exercise, idx) => {
                const exerciseKey = getExerciseKey(idx);
                const activeExerciseName = getActiveExercise(exercise, exerciseKey);
                const lastWorkout = getLastWorkout(dayName, activeExerciseName);
                const variants = [exercise.name, exercise.sub1, exercise.sub2].filter(Boolean);
                const selectedVariantIdx = exerciseVariants[exerciseKey] || 0;

                return (
                  <ExerciseCard
                    key={idx}
                    exercise={exercise}
                    exerciseIdx={idx}
                    activeExerciseName={activeExerciseName}
                    isExpanded={showExercise === idx}
                    onToggle={() => setShowExercise(showExercise === idx ? null : idx)}
                    variants={variants}
                    selectedVariantIdx={selectedVariantIdx}
                    onVariantChange={(vIdx) => setExerciseVariant(exerciseKey, vIdx)}
                    lastWorkout={lastWorkout}
                    onLogSet={(name, setIdx, weight, reps) => {
                      const absoluteWeek = (currentRound - 1) * 12 + currentWeek;
                      logSet(dayName, absoluteWeek, currentRound, name, setIdx, weight, reps);
                    }}
                    getCurrentLog={(name, setIdx) => getCurrentLog(dayName, name, setIdx)}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
