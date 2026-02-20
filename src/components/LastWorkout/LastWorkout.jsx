import './LastWorkout.css';

export const LastWorkout = ({ lastWorkout }) => {
  return (
    <div className="last-workout">
      <strong>Last time:</strong>
      <div className="last-sets">
        {Object.entries(lastWorkout.sets).map(([setIdx, data]) => (
          <span key={setIdx} className="last-set">
            {data.weight}lbs × {data.reps}
          </span>
        ))}
      </div>
    </div>
  );
};
