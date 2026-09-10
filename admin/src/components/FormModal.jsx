//Add/Edit forms where a modal makes sense

import { useEffect } from "react";

const FormModal = ({
  isOpen,
  title = "Form",
  children,
  onSubmit,
  onClose,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "medium",
}) => {
  // Prevent background scrolling while the modal is open
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  // Close the modal with Escape
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onClose();
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
    onClose,
  ]);

  // Do not render the modal when closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        className={`admin-form-modal admin-form-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="admin-form-modal-header">
          <div>
            <h2 id="form-modal-title">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="admin-form-modal-form"
        >
          <div className="admin-form-modal-body">
            {children}
          </div>

          <div className="admin-form-modal-footer">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;