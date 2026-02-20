import './VariantChips.css';

export const VariantChips = ({ variants, selectedIdx, onSelect }) => {
  return (
    <div className="variant-chips">
      {variants.map((variant, vIdx) => (
        <button
          key={vIdx}
          className={`variant-chip ${selectedIdx === vIdx ? 'active' : ''}`}
          onClick={() => onSelect(vIdx)}
        >
          {variant}
        </button>
      ))}
    </div>
  );
};
