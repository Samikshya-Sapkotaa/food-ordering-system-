import { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export const ROLES = {
  SUPER_ADMIN: {
    label: "Super Admin (Full Access)",
    permissions: {
      overview: true,
      restaurants: true,
      customers: true,
      disputes: true,
      zones: true,
      reviews: true,
      team: true
    }
  },
  SUPPORT_AGENT: {
    label: "Support Agent",
    permissions: {
      overview: true,
      restaurants: false,
      customers: true,
      disputes: true,
      reviews: true,
      team: false
    }
  },
  FINANCE_ADMIN: {
    label: "Finance Admin",
    permissions: {
      overview: true,
      restaurants: true,
      customers: false,
      disputes: true,
      reviews: false,
      team: false
    }
  },
  OPS_MANAGER: {
    label: "Ops & Logistics Manager",
    permissions: {
      overview: true,
      restaurants: true,
      customers: false,
      disputes: false,
      reviews: false,
      team: false
    }
  }
};

const INITIAL_RESTAURANTS = [
  {
    id: 1,
    name: "Kathmandu MoMo Hub",
    city: "Kathmandu",
    status: "Active", // Pending | Active | Suspended
    rating: 4.8,
    ordersToday: 42,
    commissionPct: 10,
    documents: { dftqc: "DFTQC-KTM-99482103", vat: "VAT-601234567", bankAccount: "NABIL-0012XXXX89" },
    suspendReason: null,
    menuCount: 18
  },
  {
    id: 2,
    name: "Himalayan Java Coffee",
    city: "Kathmandu",
    status: "Active",
    rating: 4.7,
    ordersToday: 28,
    commissionPct: 12,
    documents: { dftqc: "DFTQC-KTM-88129034", vat: "VAT-602345678", bankAccount: "NIC-0023XXXX90" },
    suspendReason: null,
    menuCount: 24
  },
  {
    id: 3,
    name: "Newa Lahana Tandoori",
    city: "Lalitpur",
    status: "Pending", // Onboarding queue
    rating: 0,
    ordersToday: 0,
    commissionPct: 10,
    documents: { dftqc: "DFTQC-LTP-77234190", vat: "VAT-603456789", bankAccount: "GLOBAL-0034XXXX91" },
    suspendReason: null,
    menuCount: 12
  },
  {
    id: 4,
    name: "Thamel Burger Grill",
    city: "Kathmandu",
    status: "Suspended",
    rating: 3.2,
    ordersToday: 0,
    commissionPct: 15,
    documents: { dftqc: "DFTQC-KTM-66341289", vat: "VAT-604567890", bankAccount: "EBL-0045XXXX92" },
    suspendReason: "Repeated food hygiene complaints & slow order dispatch",
    menuCount: 15
  }
];


const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.s****@gmail.com", // Masked
    phone: "+977 9841****67", // Masked
    paymentMethodMasked: "UPI ****@nabilbank", // No raw credentials!
    orderCount: 14,
    totalSpent: 8900,
    refundHistory: [{ date: "2026-07-20", amount: 150, reason: "Spilled chutney item" }],
    flaggedSuspicious: false
  },
  {
    id: 2,
    name: "SpamClaimer User",
    email: "claim.user****@yahoo.com",
    phone: "+977 9818****32",
    paymentMethodMasked: "Card ending 4821",
    orderCount: 8,
    totalSpent: 4200,
    refundHistory: [
      { date: "2026-08-02", amount: 450, reason: "Claimed missing item" },
      { date: "2026-08-04", amount: 380, reason: "Claimed cold food" }
    ],
    flaggedSuspicious: true
  }
];

const INITIAL_DISPUTES = [
  {
    id: "DSP-901",
    orderId: "#ORD-8942",
    customerName: "Aarav S.",
    restaurantName: "Kathmandu MoMo Hub",
    deliveryContactName: "Ramesh T.",
    type: "Wrong Item Delivered",
    status: "Open", // Open | Investigating | Resolved
    placedAt: "2026-08-05 19:30",
    customerClaim: "Received Veg MoMo instead of Chicken Steamed MoMo ordered.",
    restaurantResponse: "Kitchen packed order #8942 as per ticket #2.",
    deliveryProof: "Proof photo uploaded at doorstep.",
    amountDisputed: 260,
    resolutionNote: null
  },
  {
    id: "DSP-902",
    orderId: "#ORD-9104",
    customerName: "SpamClaimer U.",
    restaurantName: "Himalayan Java Coffee",
    deliveryContactName: "Bikram K.",
    type: "Late Delivery / Cold Food",
    status: "Investigating",
    placedAt: "2026-08-05 20:15",
    customerClaim: "Coffee arrived cold 45 minutes after estimated time.",
    restaurantResponse: "Food handed to delivery team within 12 minutes of receipt.",
    deliveryProof: "Traffic jam delay recorded at Thamel crossing.",
    amountDisputed: 480,
    resolutionNote: null
  }
];

const INITIAL_COUPONS = [
  { code: "SWIGGY50", discountType: "Percentage", discountVal: 50, maxDiscount: 100, minOrder: 200, usageLimit: 1000, timesUsed: 420, active: true },
  { code: "KATHMANDU100", discountType: "Flat", discountVal: 100, maxDiscount: 100, minOrder: 500, usageLimit: 500, timesUsed: 180, active: true },
  { code: "FREESHIP", discountType: "Delivery", discountVal: 40, maxDiscount: 40, minOrder: 150, usageLimit: 2000, timesUsed: 1950, active: false }
];

const INITIAL_ZONES = [
  { id: 1, name: "Kathmandu Central (Durbar Marg/Thamel)", activeDeliveries: 18, pendingOrders: 4, surgeMultiplier: 1.0, serviceable: true },
  { id: 2, name: "Lalitpur North (Jhamsikhel/Sanepa)", activeDeliveries: 12, pendingOrders: 9, surgeMultiplier: 1.3, serviceable: true },
  { id: 3, name: "Bhaktapur East", activeDeliveries: 2, pendingOrders: 8, surgeMultiplier: 1.8, serviceable: false }
];

const INITIAL_FLAGGED_REVIEWS = [
  {
    id: 401,
    restaurantName: "Kathmandu MoMo Hub",
    customerName: "SpamUser X.",
    rating: 1,
    reviewText: "Fake review promotional text promoting external spam website www.spam.com",
    flaggedBy: "Kathmandu MoMo Hub",
    status: "Pending Moderation" // Pending Moderation | Kept | Removed | Warned
  }
];

const INITIAL_AUDIT_LOGS = [
  { adminId: "ADM-01", adminName: "Super Admin", action: "SUSPEND_RESTAURANT", target: "Thamel Burger Grill", reason: "Hygiene complaints", timestamp: "2026-08-04 14:22" },
  { adminId: "ADM-01", adminName: "Super Admin", action: "ISSUE_REFUND", target: "Aarav Sharma (Rs 150)", reason: "Spilled chutney item", timestamp: "2026-08-04 16:45" }
];

export function AdminProvider({ children }) {
  const [currentRoleKey, setCurrentRoleKey] = useState("SUPER_ADMIN");
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [flaggedReviews, setFlaggedReviews] = useState(INITIAL_FLAGGED_REVIEWS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [defaultCommission, setDefaultCommission] = useState(10);

  const currentRole = ROLES[currentRoleKey] || ROLES.SUPER_ADMIN;

  /**
   * Record immutable audit log entry
   */
  const logAudit = (action, target, reason) => {
    const newEntry = {
      adminId: "ADM-01",
      adminName: currentRole.label.split(" ")[0],
      action,
      target,
      reason,
      timestamp: new Date().toLocaleString()
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  /**
   * Restaurant Actions
   */
  const approveRestaurant = (id) => {
    const rest = restaurants.find((r) => r.id === id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Active" } : r)));
    logAudit("APPROVE_RESTAURANT", rest?.name || `ID ${id}`, "Documentation & FSSAI verified");
  };

  const suspendRestaurant = (id, reason) => {
    const rest = restaurants.find((r) => r.id === id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Suspended", suspendReason: reason } : r)));
    logAudit("SUSPEND_RESTAURANT", rest?.name || `ID ${id}`, reason);
  };

  const updateCommission = (id, newCommissionPct) => {
    const rest = restaurants.find((r) => r.id === id);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, commissionPct: Number(newCommissionPct) } : r)));
    logAudit("UPDATE_COMMISSION", `${rest?.name} (${newCommissionPct}%)`, "Commission tier adjusted");
  };

  /**
   * Customer Support Actions
   */
  const issueRefund = (customerId, amount, reason) => {
    const cust = customers.find((c) => c.id === customerId);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              refundHistory: [{ date: new Date().toLocaleDateString(), amount, reason }, ...c.refundHistory]
            }
          : c
      )
    );
    logAudit("ISSUE_REFUND", `${cust?.name} (Rs ${amount})`, reason);
  };

  const flagCustomerAccount = (customerId, reason) => {
    const cust = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, flaggedSuspicious: true } : c)));
    logAudit("FLAG_CUSTOMER", cust?.name || `ID ${customerId}`, reason);
  };

  /**
   * Dispute Resolution Actions
   */
  const resolveDispute = (disputeId, actionType, note) => {
    const dsp = disputes.find((d) => d.id === disputeId);
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: "Resolved", resolutionNote: `${actionType}: ${note}` }
          : d
      )
    );
    logAudit("RESOLVE_DISPUTE", `${disputeId} (${actionType})`, note);
  };

  /**
   * Pricing & Coupon Actions
   */
  const createCoupon = (newCoupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    logAudit("CREATE_COUPON", `Code ${newCoupon.code}`, `Discount ${newCoupon.discountVal}`);
  };

  /**
   * Zone Management
   */
  const toggleZoneServiceability = (zoneId, reason) => {
    const zn = zones.find((z) => z.id === zoneId);
    const newServiceable = !zn.serviceable;
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, serviceable: newServiceable } : z)));
    logAudit("TOGGLE_ZONE", `${zn?.name} (${newServiceable ? "Serviceable" : "Unserviceable"})`, reason);
  };

  /**
   * Moderation Actions
   */
  const moderateReview = (reviewId, decision, reason) => {
    const rev = flaggedReviews.find((r) => r.id === reviewId);
    setFlaggedReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: decision } : r)));
    logAudit("MODERATE_REVIEW", `${rev?.restaurantName} review`, `${decision}: ${reason}`);
  };

  return (
    <AdminContext.Provider
      value={{
        currentRoleKey,
        setCurrentRoleKey,
        currentRole,
        restaurants,
        customers,
        disputes,
        coupons,
        zones,
        flaggedReviews,
        auditLogs,
        defaultCommission,
        setDefaultCommission,
        approveRestaurant,
        suspendRestaurant,
        updateCommission,
        issueRefund,
        flagCustomerAccount,
        resolveDispute,
        createCoupon,
        toggleZoneServiceability,
        moderateReview
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
