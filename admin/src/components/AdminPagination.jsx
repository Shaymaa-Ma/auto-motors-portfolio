import { useMemo } from "react";

const AdminPagination = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  const pages = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const result = [];

    result.push(1);

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    if (start > 2) {
      result.push("ellipsis-start");
    }

    for (
      let page = start;
      page <= end;
      page += 1
    ) {
      result.push(page);
    }

    if (end < totalPages - 1) {
      result.push("ellipsis-end");
    }

    result.push(totalPages);

    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="admin-pagination">
      <button
        type="button"
        className="admin-pagination-arrow"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <div className="admin-pagination-pages">
        {pages.map((page) => {
          if (
            page === "ellipsis-start" ||
            page === "ellipsis-end"
          ) {
            return (
              <span
                key={page}
                className="admin-pagination-ellipsis"
              >
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={page}
              className={`admin-pagination-number ${
                currentPage === page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onPageChange(page)
              }
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="admin-pagination-arrow"
        onClick={handleNext}
        disabled={
          currentPage === totalPages
        }
        aria-label="Next page"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};

export default AdminPagination;