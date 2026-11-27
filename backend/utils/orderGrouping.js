function groupCartItemsByRestaurant(cartItems) {
  const groups = new Map();

  for (const item of cartItems) {
    const restaurantId = item.restaurant_id ?? null;
    if (!groups.has(restaurantId)) {
      groups.set(restaurantId, {
        restaurant_id: restaurantId,
        items: [],
      });
    }

    groups.get(restaurantId).items.push(item);
  }

  return Array.from(groups.values()).map((group) => ({
    restaurant_id: group.restaurant_id,
    items: group.items,
    total: group.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
  }));
}

module.exports = {
  groupCartItemsByRestaurant,
};
