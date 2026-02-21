import { VariantChips } from '../VariantChips/VariantChips';
import { ExerciseInfo } from '../ExerciseInfo/ExerciseInfo';
import { LastWorkout } from '../LastWorkout/LastWorkout';
import { SetsTracker } from '../SetsTracker/SetsTracker';
import './ExerciseCard.css';

export const ExerciseCard = ({
  exercise,
  exerciseIdx,
  activeExerciseName,
  isExpanded,
  onToggle,
  variants,
  selectedVariantIdx,
  onVariantChange,
  lastWorkout,
  onLogSet,
  getCurrentLog
}) => {
  const hasVariants = variants.length > 1;

  return (
    <div className={`exercise-card ${isExpanded ? 'expanded' : ''}`}>
      <div className={`exercise-header ${isExpanded ? 'expanded' : ''}`} onClick={onToggle}>
        <h3>{activeExerciseName}</h3>
        <span className="exercise-meta">
          {exercise.sets} × {exercise.reps}
        </span>
      </div>

      {isExpanded && (
        <div className="exercise-details">
          {hasVariants && (
            <VariantChips
              variants={variants}
              selectedIdx={selectedVariantIdx}
              onSelect={onVariantChange}
            />
          )}

          <ExerciseInfo exercise={exercise} />

          {lastWorkout && <LastWorkout lastWorkout={lastWorkout} />}

          <SetsTracker
            sets={exercise.sets}
            warmupSets={exercise.warmupSets}
            warmupReps={exercise.warmupReps}
            repRange={exercise.reps}
            exerciseName={activeExerciseName}
            lastWorkout={lastWorkout}
            onLogSet={onLogSet}
            getCurrentLog={getCurrentLog}
          />
        </div>
      )}
    </div>
  );
};
