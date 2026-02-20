import './Modal.css';

export const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};
