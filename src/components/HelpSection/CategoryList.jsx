import { BookOpen, Dumbbell, Calendar } from 'lucide-react';
import './CategoryList.css';

// Map icon names to lucide-react components
const iconMap = {
  BookOpen,
  Dumbbell,
  Calendar
};

export const CategoryList = ({ categories, selectedCategory, onCategorySelect }) => {
  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
  };

  return (
    <div className="category-list-container">
      <div className="category-list">
        {/* "All" option */}
        <button
          className={`category-chip ${selectedCategory === null || selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
          aria-label="Show all categories"
          aria-pressed={selectedCategory === null || selectedCategory === 'all'}
        >
          <span className="category-chip-text">All</span>
        </button>

        {/* Category-specific chips */}
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon];
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              aria-label={`Filter by ${category.name}`}
              aria-pressed={isActive}
            >
              {IconComponent && <IconComponent size={18} className="category-chip-icon" />}
              <span className="category-chip-text">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
