import './DayTabs.css';

export const DayTabs = ({ days, currentDay, onDayChange }) => {
  return (
    <div className="day-tabs">
      {days.map((d, i) => (
        <button
          key={i}
          className={`day-tab ${currentDay === i ? 'active' : ''}`}
          onClick={() => onDayChange(i)}
        >
          {d.day.split(' ')[0]}
        </button>
      ))}
    </div>
  );
};
