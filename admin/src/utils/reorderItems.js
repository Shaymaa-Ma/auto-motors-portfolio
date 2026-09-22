/*
 * LEGACY REORDER UTILITY
 *
 * Products and other migrated admin sections now use
 * backend reorder endpoints instead of this utility.
 *
 * Example backend API:
 *
 * productsApi.reorder(id, desiredOrder)
 * categoriesApi.reorder(id, desiredOrder)
 *
 * This file is kept temporarily so other sections that
 * have not yet been migrated do not break.
 *
 * IMPORTANT:
 * Do NOT use this utility for server-side paginated
 * sections because `items` may contain only the current
 * page, which means items on other pages cannot be
 * reordered correctly.
 */

/*
 * Reorders items that are already available in memory.
 *
 * WARNING:
 * This is only safe when `items` contains the COMPLETE
 * list of records.
 *
 * For server-side paginated sections, use the backend
 * reorder endpoint instead.
 */
export const reorderItems = async ({
  api,
  items,
  itemId,
  desiredOrder,
}) => {
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    itemId == null
  ) {
    return;
  }

  // Sort according to the current display order.
  const sortedItems = [...items].sort(
    (a, b) => {
      const orderA =
        Number(a.display_order) || 0;

      const orderB =
        Number(b.display_order) || 0;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (
        Number(a.id) - Number(b.id)
      );
    }
  );

  // Find the item being moved.
  const targetItem =
    sortedItems.find(
      (item) =>
        Number(item.id) ===
        Number(itemId)
    );

  if (!targetItem) {
    return;
  }

  // Orders are 1-based.
  const requestedOrder =
    Number(desiredOrder) || 1;

  const targetIndex = Math.min(
    Math.max(
      requestedOrder - 1,
      0
    ),
    sortedItems.length - 1
  );

  // Remove the target item.
  const remainingItems =
    sortedItems.filter(
      (item) =>
        Number(item.id) !==
        Number(itemId)
    );

  // Insert it at the requested position.
  remainingItems.splice(
    targetIndex,
    0,
    targetItem
  );

  // Calculate the final order.
  const updates = remainingItems
    .map((item, index) => ({
      item,
      newOrder: index + 1,
    }))
    .filter(
      ({ item, newOrder }) =>
        Number(item.display_order) !==
        newOrder
    );

  if (updates.length === 0) {
    return;
  }

  /*
   * Use temporary values first.
   *
   * This prevents conflicts if display_order
   * has a UNIQUE constraint.
   */
  const currentMaximum = Math.max(
    sortedItems.length,
    ...sortedItems.map(
      (item) =>
        Number(item.display_order) || 0
    )
  );

  const temporaryBase =
    currentMaximum + 1000;

  // Move changed records temporarily.
  await Promise.all(
    updates.map(
      ({ item }, index) =>
        api.update(item.id, {
          display_order:
            temporaryBase + index,
        })
    )
  );

  // Write the final sequential orders.
  await Promise.all(
    updates.map(
      ({ item, newOrder }) =>
        api.update(item.id, {
          display_order: newOrder,
        })
    )
  );
};

/*
 * LEGACY NORMALIZATION UTILITY
 *
 * Only use this when `items` contains the COMPLETE
 * collection.
 *
 * Server-side paginated sections should instead call
 * the backend normalize endpoint.
 */
export const normalizeItemOrders =
  async ({
    api,
    items,
  }) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return;
    }

    const sortedItems = [...items].sort(
      (a, b) => {
        const orderA =
          Number(a.display_order) || 0;

        const orderB =
          Number(b.display_order) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return (
          Number(a.id) -
          Number(b.id)
        );
      }
    );

    const updates = sortedItems
      .map((item, index) => ({
        item,
        newOrder: index + 1,
      }))
      .filter(
        ({ item, newOrder }) =>
          Number(
            item.display_order
          ) !== newOrder
      );

    if (updates.length === 0) {
      return;
    }

    const currentMaximum =
      Math.max(
        sortedItems.length,
        ...sortedItems.map(
          (item) =>
            Number(
              item.display_order
            ) || 0
        )
      );

    const temporaryBase =
      currentMaximum + 1000;

    // Move changed records temporarily.
    await Promise.all(
      updates.map(
        ({ item }, index) =>
          api.update(item.id, {
            display_order:
              temporaryBase + index,
          })
      )
    );

    // Give them their final positions.
    await Promise.all(
      updates.map(
        ({
          item,
          newOrder,
        }) =>
          api.update(item.id, {
            display_order:
              newOrder,
          })
      )
    );
  };