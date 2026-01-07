
const Modal = ({ isOpen, onClose, hideHeader, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        {!hideHeader && (
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Modal Header</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
export default Modal