import { createContext, useContext, useState } from "react";

const CustomerContext = createContext();

export const MOCK_CUSTOMER_RESTAURANTS = [
  {
    id: 1,
    name: "Kathmandu MoMo Hub",
    cuisine: "Nepali, MoMo, Asian",
    rating: 4.8,
    ratingCount: "1.2k+",
    deliveryTime: "20-25 min",
    costForTwo: "Rs. 400 for two",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
    closed: false,
    vegOnly: false,
    address: "Durbar Marg, Kathmandu 44600"
  },
  {
    id: 2,
    name: "Himalayan Java Coffee",
    cuisine: "Coffee, Bakery, Cafe, Desserts",
    rating: 4.7,
    ratingCount: "950+",
    deliveryTime: "15-20 min",
    costForTwo: "Rs. 600 for two",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    closed: false,
    vegOnly: true,
    address: "Thamel Marg, Kathmandu 44600"
  },
  {
    id: 3,
    name: "Newa Lahana Tandoori",
    cuisine: "Newari, Indian, Tandoor",
    rating: 4.5,
    ratingCount: "600+",
    deliveryTime: "30-35 min",
    costForTwo: "Rs. 700 for two",
    distance: "3.4 km",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
    closed: false,
    vegOnly: false,
    address: "Kirtipur, Kathmandu"
  },
  {
    id: 4,
    name: "Thamel Burger & Grill",
    cuisine: "Burgers, Fast Food, American",
    rating: 4.4,
    ratingCount: "480+",
    deliveryTime: "25-30 min",
    costForTwo: "Rs. 550 for two",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    closed: false,
    vegOnly: false,
    address: "Mandala Street, Thamel, Kathmandu"
  }
];

export const MOCK_MENU_CATEGORIES = [
  {
    name: "Steamed & Fried MoMo",
    items: [
      {
        id: 101,
        name: "Chicken Steamed MoMo",
        price: 220,
        veg: false,
        rating: 4.8,
        description: "Juicy minced chicken enclosed in delicate steamed flour wrapper served with spicy tomato sesame chutney.",
        customizable: true,
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80"
      },
      {
        id: 102,
        name: "Buff C-MoMo (Chilli)",
        price: 260,
        veg: false,
        rating: 4.9,
        description: "Fried buff momo tossed in spicy schezwan chilli sauce with capsicum, onion, and fresh coriander.",
        customizable: true,
        image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=300&auto=format&fit=crop&q=80"
      },
      {
        id: 103,
        name: "Paneer Cheese MoMo (Veg)",
        price: 240,
        veg: true,
        rating: 4.6,
        description: "Fresh cottage cheese and mozzarella herb filling steamed to perfection.",
        customizable: true,
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    name: "Biryani & Rice Bowls",
    items: [
      {
        id: 104,
        name: "Hyderabadi Chicken Biryani",
        price: 380,
        veg: false,
        rating: 4.7,
        description: "Slow-cooked dum biryani rice infused with aromatic saffron, whole spices, and tender chicken thighs.",
        customizable: true,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80"
      },
      {
        id: 105,
        name: "Special Veg Dum Biryani",
        price: 310,
        veg: true,
        rating: 4.5,
        description: "Basmati rice layered with garden fresh vegetables, mint, and fried onions served with pomegranate raita.",
        customizable: false,
        image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    name: "Beverages & Desserts",
    items: [
      {
        id: 106,
        name: "Himalayan Iced Tea",
        price: 110,
        veg: true,
        rating: 4.8,
        description: "Chilled black tea infused with fresh lemon mint leaves and Himalayan rock sugar.",
        customizable: false,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80"
      },
      {
        id: 107,
        name: "Gulab Jamun (2 pcs)",
        price: 120,
        veg: true,
        rating: 4.9,
        description: "Warm golden milk dumplings soaked in cardamom rose syrup.",
        customizable: false,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80"
      }
    ]
  }
];

export function CustomerProvider({ children }) {
  // Saved addresses
  const [addresses, setAddresses] = useState([
    { id: 1, type: "Home", text: "Flat 4B, Durbar Marg Apartment, Near Annapurna Hotel, Kathmandu", isDefault: true },
    { id: 2, type: "Work", text: "Tech Hub Tower, 3rd Floor, Jhamsikhel, Lalitpur", isDefault: false }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState(1);

  // Cart state
  const [cart, setCart] = useState([
    {
      id: 101,
      restaurantId: 1,
      name: "Chicken Steamed MoMo",
      price: 220,
      qty: 2,
      veg: false,
      customization: { size: "Full (10 pcs)", spice: "Medium Spicy" }
    },
    {
      id: 106,
      restaurantId: 1,
      name: "Himalayan Iced Tea",
      price: 110,
      qty: 1,
      veg: true,
      customization: null
    }
  ]);
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

 
  // Active Order Tracking State
  const [activeOrder, setActiveOrder] = useState({
    orderId: "#ORD-9421",
    status: "OUT_FOR_DELIVERY", // PLACED | ACCEPTED | PREPARING | OUT_FOR_DELIVERY | OUT_FOR_DELIVERY | OUT_FOR_DELIVERY | DELIVERED
    stepIndex: 3, // 0 to 6
    placedAt: "2026-08-05 20:10",
    restaurant: MOCK_CUSTOMER_RESTAURANTS[0],
    items: [
      { name: "Chicken Steamed MoMo", qty: 2, price: 220 },
      { name: "Himalayan Iced Tea", qty: 1, price: 110 }
    ],
    billSummary: { itemTotal: 550, deliveryFee: 35, packagingFee: 25, tax: 28, discount: 50, finalTotal: 588 },
    deliveryAddress: "Flat 4B, Durbar Marg Apartment, Kathmandu",
    deliveryPartner: {
      name: "Ramesh Thapa",
      phone: "+977 9841****67", // Masked
      rating: 4.9,
      vehicle: "BA-1-PA-9948 (Honda Shine)",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    }
  });

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TICK-402",
      orderId: "#ORD-8812",
      category: "Food Quality",
      description: "Chutney was spilled inside the bag.",
      status: "Resolved",
      resolution: "Rs. 150 wallet credit issued by support admin."
    }
  ]);

  /**
   * Cart Functions
   */
  const addToCart = (item, customization = null) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      }
      return [...prev, { ...item, qty: 1, customization }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const applyCoupon = (couponCode) => {
    const code = couponCode.toUpperCase();
    if (code === "FC50" || code === "SWIGGY50") {
      setAppliedCoupon({ code: "FC50", discount: 50 });
      return { success: true, message: "Rs. 50 Coupon Discount Applied!" };
    }
    if (code === "FC100") {
      setAppliedCoupon({ code: "FC100", discount: 100 });
      return { success: true, message: "Rs. 100 Coupon Discount Applied!" };
    }
    if (code === "FREESHIP") {
      setAppliedCoupon({ code: "FREESHIP", discount: 35 });
      return { success: true, message: "Free Delivery Coupon Applied!" };
    }
    return { success: false, message: "Invalid coupon code. Try FC50, FC100 or FREESHIP" };
  };

  /**
   * Place Order & Start Tracking
   */
  const placeOrder = (deliveryAddress, paymentMethod, tipAmount = 0, notes = "") => {
    const itemTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = Math.max(0, itemTotal + 35 + 25 + 28 + tipAmount - discount);

    const newOrder = {
      orderId: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "PLACED",
      stepIndex: 0,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      restaurant: MOCK_CUSTOMER_RESTAURANTS[0],
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      billSummary: { itemTotal, deliveryFee: 35, packagingFee: 25, tax: 28, discount, finalTotal },
      deliveryAddress: deliveryAddress || addresses[0].text,
      deliveryPartner: null
    };

    setActiveOrder(newOrder);
    setCart([]);
    setAppliedCoupon(null);
    return newOrder.orderId;
  };

  /**
   * Simulate Tracking Progression
   */
  const simulateOrderStep = () => {
    const steps = [
      "PLACED",
      "ACCEPTED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELIVERED"
    ];

    setActiveOrder((prev) => {
      const nextIdx = Math.min(steps.length - 1, prev.stepIndex + 1);
      const nextStatus = steps[nextIdx];

      return {
        ...prev,
        stepIndex: nextIdx,
        status: nextStatus,
        deliveryInfo: nextIdx >= 3 ? (prev.deliveryInfo || {
          name: "Ramesh Thapa",
          phone: "+977 9841****67",
          rating: 4.9,
          vehicle: "BA-1-PA-9948",
          photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        }) : null
      };
    });
  };

  /**
   * Address Functions
   */
  const addAddress = (type, text) => {
    const newAddr = { id: Date.now(), type, text, isDefault: false };
    setAddresses((prev) => [...prev, newAddr]);
  };

  /**
   * Support Ticket Submission
   */
  const submitSupportTicket = (orderId, category, description) => {
    const newTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      category,
      description,
      status: "Submitted",
      resolution: null
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <CustomerContext.Provider
      value={{
        restaurants: MOCK_CUSTOMER_RESTAURANTS,
        menuCategories: MOCK_MENU_CATEGORIES,
        cart,
        cartOpen,
        setCartOpen,
        appliedCoupon,
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        activeOrder,
        supportTickets,
        addToCart,
        updateCartQty,
        applyCoupon,
        placeOrder,
        simulateOrderStep,
        addAddress,
        submitSupportTicket
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
