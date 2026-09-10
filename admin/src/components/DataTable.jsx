//Lists such as Products, Categories, Services, Vehicles, FAQs, Gallery

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found.",
  onEdit,
  onDelete,
  deleteLabel = "Delete",
  editLabel = "Edit",
  getRowKey = (row) => row.id,
  renderActions,
}) => {
  // Render the loading state
  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-loading-spinner" />

          <span>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-scroll">
        <table className="admin-data-table">
          <thead>
            <tr>
              {columns.map(
                (column) => (
                  <th
                    key={
                      column.key
                    }
                    className={
                      column.className ||
                      ""
                    }
                  >
                    {column.label}
                  </th>
                )
              )}

              {(onEdit ||
                onDelete ||
                renderActions) && (
                <th className="admin-table-actions-header">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onEdit ||
                    onDelete ||
                    renderActions
                      ? 1
                      : 0)
                  }
                  className="admin-table-empty"
                >
                  <div className="admin-table-empty-content">
                    <span className="admin-table-empty-icon">
                      —
                    </span>

                    <p>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map(
                (row) => (
                  <tr
                    key={getRowKey(
                      row
                    )}
                  >
                    {columns.map(
                      (
                        column
                      ) => (
                        <td
                          key={
                            column.key
                          }
                          className={
                            column.className ||
                            ""
                          }
                        >
                          {column.render
                            ? column.render(
                                row[
                                  column.key
                                ],
                                row
                              )
                            : row[
                                column.key
                              ] ??
                              "—"}
                        </td>
                      )
                    )}

                    {(onEdit ||
                      onDelete ||
                      renderActions) && (
                      <td className="admin-table-actions">
                        {renderActions &&
                          renderActions(
                            row
                          )}

                        {onEdit && (
                          <button
                            type="button"
                            className="admin-table-action admin-table-edit"
                            onClick={() =>
                              onEdit(
                                row
                              )
                            }
                          >
                            {editLabel}
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            className="admin-table-action admin-table-delete"
                            onClick={() =>
                              onDelete(
                                row
                              )
                            }
                          >
                            {deleteLabel}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;