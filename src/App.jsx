import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Edit3 } from 'lucide-react';
import { workoutProgram } from './data/workoutData';
import { useSupabaseWorkoutHistory } from './hooks/useSupabaseWorkoutHistory';
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
import { HelpSection } from './components/HelpSection/HelpSection';
import './App.css';

function App() {
  const [currentDay, setCurrentDay] = useState(0);
  const [showExercise, setShowExercise] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [historyRound, setHistoryRound] = useState(null);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { logSet, getLastWorkout, getCurrentLog, getAllRounds, workoutHistory, clearRoundData, updateSession, deleteSession, getLastPerformedExercise, loading } = useSupabaseWorkoutHistory();
  const { exerciseVariants, getActiveExercise, setExerciseVariant } = useExerciseVariants();
  const stats = useStats(workoutHistory);
  const roundManager = useRoundManager();

  const currentRound = roundManager.getCurrentRound();
  const currentWeek = roundManager.getCurrentWeekInRound();
  const hasActiveRound = roundManager.hasActiveRound();
  const isComplete = roundManager.isRoundComplete();
  const roundLoading = roundManager.loading;

  const programWeek = currentWeek ? ((currentWeek - 1) % 12) + 1 : 1;
  const week = workoutProgram.weeks.find(w => w.week === programWeek);
  const day = week?.days[currentDay];
  const dayName = day?.day;

  const getExerciseKey = (exerciseIdx) => `${dayName}-ex${exerciseIdx}`;

  // Auto-select last performed exercise variants when day changes
  useEffect(() => {
    if (dayName && day?.exercises) {
      const lastPerformed = getLastPerformedExercise(dayName);
      if (lastPerformed) {
        day.exercises.forEach((exercise, idx) => {
          const exerciseKey = getExerciseKey(idx);
          const variants = [exercise.name, exercise.sub1, exercise.sub2].filter(Boolean);

          // Find which variant was last performed
          const lastVariantIdx = variants.findIndex(v => lastPerformed.includes(v));

          // Only set if we found a match and it's different from current
          if (lastVariantIdx >= 0 && exerciseVariants[exerciseKey] !== lastVariantIdx) {
            setExerciseVariant(exerciseKey, lastVariantIdx);
          }
        });
      }
    }
  }, [dayName, currentDay]);

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

  // Show loading state while round data is being fetched
  if (roundLoading || loading) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

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
        onDeleteSession={deleteSession}
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
        onHelpClick={() => setShowHelp(true)}
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

      <main className={`content ${showExercise !== null ? 'has-expanded-exercise' : ''}`}>
        {day?.exercises.length === 0 ? (
          <RestDay />
        ) : (
          <>
            <div className="day-header">
              <h2 className="day-title">{day?.day}</h2>
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
                    getCurrentLog={(name, setIdx) => {
                      const absoluteWeek = (currentRound - 1) * 12 + currentWeek;
                      return getCurrentLog(dayName, name, setIdx, absoluteWeek, currentRound);
                    }}
                  />
                );
              })}
            </div>
            <div className="header-actions">
              <button className="history-btn" onClick={() => setShowHistory(true)} title="View History">
                <Clock size={22} strokeWidth={2} />
              </button>
              <button className="stats-btn" onClick={() => setShowStats(true)} title="View Stats">
                <TrendingUp size={22} strokeWidth={2} />
              </button>
              <button className="edit-btn" onClick={() => setShowEditHistory(true)} title="Edit History">
                <Edit3 size={22} strokeWidth={2} />
              </button>
            </div>
          </>
        )}
      </main>

      <HelpSection isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;
