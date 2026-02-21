import { useEffect, useRef } from 'react';
import './DayTabs.css';

export const DayTabs = ({ days, currentDay, onDayChange }) => {
  const tabsRef = useRef(null);
  const activeTabRef = useRef(null);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const container = tabsRef.current;
      const activeTab = activeTabRef.current;
      const containerWidth = container.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      
      // Scroll to center the active tab
      container.scrollTo({
        left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [currentDay]);

  return (
    <div className="day-tabs" ref={tabsRef}>
      {days.map((d, i) => (
        <button
          key={i}
          ref={currentDay === i ? activeTabRef : null}
          className={`day-tab ${currentDay === i ? 'active' : ''}`}
          onClick={() => onDayChange(i)}
        >
          {d.day.split(' ')[0]}
        </button>
      ))}
    </div>
  );
};
