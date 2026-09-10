//Delete confirmations for Products, Categories, Vehicles, Gallery, etc.

import { useEffect } from "react";

const ConfirmDialog = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) => {
  // Close the dialog with Escape
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    loading,
    onCancel,
  ]);

  // Do not render the dialog when closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="admin-dialog-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onCancel();
        }
      }}
    >
      <div
        className="admin-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div
          className={`admin-confirm-icon ${
            danger
              ? "admin-confirm-icon-danger"
              : "admin-confirm-icon-default"
          }`}
        >
          !
        </div>

        <div className="admin-confirm-content">
          <h2 id="confirm-dialog-title">
            {title}
          </h2>

          <p>
            {message}
          </p>
        </div>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={
              danger
                ? "admin-danger-button"
                : "admin-primary-button"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;