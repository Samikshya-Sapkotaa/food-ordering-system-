import React, { useState } from "react";
import { CustomerProvider, useCustomer } from "../context/CustomerContext";
import FoodieTopNav from "../components/customer/FoodieTopNav";
import FoodieCartDrawer from "../components/customer/FoodieCartDrawer";

import FoodieHomePage from "./customer/FoodieHomePage";
import FoodieMenuPage from "./customer/FoodieMenuPage";
import FoodieCheckoutPage from "./customer/FoodieCheckoutPage";
import FoodieTrackingPage from "./customer/FoodieTrackingPage";
import FoodieHistoryPage from "./customer/FoodieHistoryPage";
import FoodieSupportPage from "./customer/FoodieSupportPage";
import FoodieProfilePage from "./customer/FoodieProfilePage";

import "../components/customer/foodie-desktop.css";

function FoodieCustomerContent() {
  const [activePage, setActivePage] = useState("home"); // home | menu | checkout | track | history | support | profile | wallet
  const { restaurants } = useCustomer();
  const [selectedRest, setSelectedRest] = useState(restaurants[0]);

  const handleSelectRestaurant = (rest) => {
    setSelectedRest(rest);
    setActivePage("menu");
  };

  const renderCurrentPage = () => {
    switch (activePage) {
      case "menu":
        return (
          <FoodieMenuPage
            restaurant={selectedRest}
            onProceedCheckout={() => setActivePage("checkout")}
          />
        );
      case "checkout":
        return (
          <FoodieCheckoutPage
            onOrderPlaced={() => setActivePage("track")}
          />
        );
      case "track":
        return (
          <FoodieTrackingPage
            onNavigateSupport={() => setActivePage("support")}
          />
        );
      case "history":
        return (
          <FoodieHistoryPage
            onNavigateTrack={() => setActivePage("track")}
          />
        );
      case "support":
        return <FoodieSupportPage />;
      case "profile":
        return <FoodieProfilePage onNavigateSection={(sec) => setActivePage(sec)} />;
           case "home":
      default:
        return <FoodieHomePage onSelectRestaurant={handleSelectRestaurant} />;
    }
  };

  return (
    <div className="fc-desktop-app">
      {/* Persistent Top Navigation Bar */}
      <FoodieTopNav activePage={activePage} onNavigate={(pg) => setActivePage(pg)} />

      {/* Main Page Router */}
      <main>{renderCurrentPage()}</main>

      {/* Persistent Side Cart Drawer */}
      <FoodieCartDrawer onProceedCheckout={() => setActivePage("checkout")} />
    </div>
  );
}

function FoodieCustomerApp() {
  return (
    <CustomerProvider>
      <FoodieCustomerContent />
    </CustomerProvider>
  );
}

export default FoodieCustomerApp;
