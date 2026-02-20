import './ExerciseInfo.css';

export const ExerciseInfo = ({ exercise }) => {
  return (
    <div className="exercise-info">
      <p><strong>RPE:</strong> {exercise.earlyRPE} → {exercise.lastRPE}</p>
      <p><strong>Rest:</strong> {exercise.rest}</p>
      {exercise.notes && <p className="notes">{exercise.notes}</p>}
    </div>
  );
};
