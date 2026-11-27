import React from "react";

function VegNonVegIcon({ isVeg = true }) {
  return isVeg ? (
    <span className="sw-veg-icon" title="Pure Vegetarian">
      <span className="sw-veg-dot" />
    </span>
  ) : (
    <span className="sw-nonveg-icon" title="Non-Vegetarian">
      <span className="sw-nonveg-dot" />
    </span>
  );
}

export default VegNonVegIcon;
