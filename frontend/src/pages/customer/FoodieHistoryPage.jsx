// import React, { useState } from "react";
// import { useCustomer } from "../../context/CustomerContext";

// function RatingModal({ isOpen, orderId, onClose }) {
//   const [foodRating, setFoodRating] = useState(5);
//   const [deliveryPartnerRating, setDeliveryPartnerRating] = useState(5);
//   const [comment, setComment] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmitted(true);
//     setTimeout(() => { setSubmitted(false); onClose(); }, 1400);
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={onClose}>
//       <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "460px", width: "100%", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
//           <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>⭐ Rate Your Order</h3>
//           <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>✕</button>
//         </div>

//         {submitted ? (
//           <div style={{ padding: "32px 0", textAlign: "center" }}>
//             <span style={{ fontSize: "52px", display: "block", marginBottom: "10px" }}>✅</span>
//             <strong style={{ fontSize: "16px", color: "#0f172a" }}>Thank you for your rating!</strong>
//             <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Your feedback helps us improve Foodie Corner.</p>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", marginBottom: "12px" }}>
//               <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>1. Rate Food & Restaurant</div>
//               <div style={{ display: "flex", gap: "6px" }}>
//                 {[1,2,3,4,5].map((s) => <span key={s} onClick={() => setFoodRating(s)} style={{ fontSize: "26px", cursor: "pointer", color: s <= foodRating ? "#f59e0b" : "#e2e8f0" }}>★</span>)}
//               </div>
//             </div>
//             <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", marginBottom: "14px" }}>
//               <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>2. Rate Delivery Partner</div>
//               <div style={{ display: "flex", gap: "6px" }}>
//                 {[1,2,3,4,5].map((s) => <span key={s} onClick={() => setDelivery PartnerRating(s)} style={{ fontSize: "26px", cursor: "pointer", color: s <= deliveryPartnerRating ? "#f59e0b" : "#e2e8f0" }}>★</span>)}
//               </div>
//             </div>
//             <textarea rows={3} placeholder="Great food! Arrived hot and fresh..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "16px", fontFamily: "inherit", resize: "none", outline: "none" }} />
//             <button type="submit" style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: "900", cursor: "pointer", fontFamily: "inherit" }}>
//               Submit Rating
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// function FoodieHistoryPage({ onNavigateTrack }) {
//   const { activeOrder } = useCustomer();
//   const [ratingOrderId, setRatingOrderId] = useState(null);

//   const orders = [
//     { orderId: "#ORD-9421", date: "2026-08-05", restaurant: "Kathmandu MoMo Hub", items: "2× Chicken Steamed MoMo, 1× Himalayan Iced Tea", total: 588, status: activeOrder?.status || "DELIVERED" },
//     { orderId: "#ORD-8812", date: "2026-08-01", restaurant: "Himalayan Java Coffee", items: "1× Caramel Macchiato, 1× Blueberry Cheesecake", total: 620, status: "DELIVERED" }
//   ];

//   return (
//     <div className="fc-page-content">
//       <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px" }}>📜 Order History</h1>
//       <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>View past orders, reorder favourites, and submit ratings.</p>

//       <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
//           <thead>
//             <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
//               {["Order & Date", "Restaurant", "Items", "Total", "Status", "Actions"].map((h) => (
//                 <th key={h} style={{ padding: "12px 18px", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((o) => (
//               <tr key={o.orderId} style={{ borderBottom: "1px solid #f1f5f9" }}>
//                 <td style={{ padding: "14px 18px" }}>
//                   <strong>{o.orderId}</strong>
//                   <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{o.date}</div>
//                 </td>
//                 <td style={{ padding: "14px 18px", fontWeight: "700" }}>{o.restaurant}</td>
//                 <td style={{ padding: "14px 18px", color: "#475569", maxWidth: "200px" }}>{o.items}</td>
//                 <td style={{ padding: "14px 18px", fontWeight: "800" }}>Rs. {o.total}</td>
//                 <td style={{ padding: "14px 18px" }}>
//                   <span style={{ background: o.status === "DELIVERED" ? "#dcfce7" : "#dbeafe", color: o.status === "DELIVERED" ? "#15803d" : "#1d4ed8", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
//                     {o.status}
//                   </span>
//                 </td>
//                 <td style={{ padding: "14px 18px" }}>
//                   <div style={{ display: "flex", gap: "6px" }}>
//                     {o.status !== "DELIVERED" ? (
//                       <button onClick={onNavigateTrack} style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
//                         Track Live
//                       </button>
//                     ) : (
//                       <>
//                         <button style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
//                           🔁 Reorder
//                         </button>
//                         <button onClick={() => setRatingOrderId(o.orderId)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
//                           ⭐ Rate
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <RatingModal isOpen={Boolean(ratingOrderId)} orderId={ratingOrderId} onClose={() => setRatingOrderId(null)} />
//     </div>
//   );
// }

// export default FoodieHistoryPage;



import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

function RatingModal({ isOpen, orderId, onClose }) {
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryPartnerRating, setDeliveryPartnerRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      orderId,
      foodRating,
      deliveryPartnerRating,
      comment
    });

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "28px",
          maxWidth: "460px",
          width: "100%",
          boxShadow: "0 24px 50px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "18px"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#0f172a",
              margin: 0
            }}
          >
            ⭐ Rate Your Order
          </h3>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "#64748b"
            }}
          >
            ✕
          </button>
        </div>


        {submitted ? (

          <div
            style={{
              padding: "32px 0",
              textAlign: "center"
            }}
          >
            <span
              style={{
                fontSize: "52px",
                display: "block",
                marginBottom: "10px"
              }}
            >
              ✅
            </span>

            <strong>
              Thank you for your rating!
            </strong>

            <p
              style={{
                color:"#64748b",
                fontSize:"12px"
              }}
            >
              Your feedback helps us improve Foodie Corner.
            </p>

          </div>

        ) : (

          <form onSubmit={handleSubmit}>

            <div
              style={{
                background:"#f8fafc",
                padding:"14px",
                borderRadius:"12px",
                marginBottom:"12px"
              }}
            >

              <div
                style={{
                  fontSize:"13px",
                  fontWeight:"800",
                  marginBottom:"8px"
                }}
              >
                1. Rate Food & Restaurant
              </div>


              <div style={{display:"flex",gap:"6px"}}>

                {[1,2,3,4,5].map((s)=>(
                  <span
                    key={s}
                    onClick={()=>setFoodRating(s)}
                    style={{
                      fontSize:"26px",
                      cursor:"pointer",
                      color:s <= foodRating ? "#f59e0b":"#e2e8f0"
                    }}
                  >
                    ★
                  </span>
                ))}

              </div>

            </div>



            <div
              style={{
                background:"#f8fafc",
                padding:"14px",
                borderRadius:"12px",
                marginBottom:"14px"
              }}
            >

              <div
                style={{
                  fontSize:"13px",
                  fontWeight:"800",
                  marginBottom:"8px"
                }}
              >
                2. Rate Delivery Partner
              </div>


              <div style={{display:"flex",gap:"6px"}}>

                {[1,2,3,4,5].map((s)=>(
                  <span
                    key={s}
                    onClick={()=>setDeliveryPartnerRating(s)}
                    style={{
                      fontSize:"26px",
                      cursor:"pointer",
                      color:s <= deliveryPartnerRating ? "#f59e0b":"#e2e8f0"
                    }}
                  >
                    ★
                  </span>
                ))}

              </div>

            </div>


            <textarea
              rows="3"
              placeholder="Great food! Arrived hot and fresh..."
              value={comment}
              onChange={(e)=>setComment(e.target.value)}
              style={{
                width:"100%",
                padding:"10px",
                borderRadius:"9px",
                border:"1px solid #cbd5e1",
                marginBottom:"16px",
                resize:"none"
              }}
            />


            <button
              type="submit"
              style={{
                width:"100%",
                background:"#ea580c",
                color:"#fff",
                border:"none",
                borderRadius:"12px",
                padding:"14px",
                fontWeight:"900",
                cursor:"pointer"
              }}
            >
              Submit Rating
            </button>

          </form>

        )}

      </div>
    </div>
  );
}



function FoodieHistoryPage({ onNavigateTrack }) {

  const { activeOrder } = useCustomer();
  const [ratingOrderId, setRatingOrderId] = useState(null);


  const orders = [
    {
      orderId:"#ORD-9421",
      date:"2026-08-05",
      restaurant:"Kathmandu MoMo Hub",
      items:"2× Chicken Steamed MoMo, 1× Himalayan Iced Tea",
      total:588,
      status: activeOrder?.status || "DELIVERED"
    },

    {
      orderId:"#ORD-8812",
      date:"2026-08-01",
      restaurant:"Himalayan Java Coffee",
      items:"1× Caramel Macchiato, 1× Blueberry Cheesecake",
      total:620,
      status:"DELIVERED"
    }
  ];


  return (

    <div className="fc-page-content">

      <h1
        style={{
          fontSize:"24px",
          fontWeight:"900",
          color:"#0f172a",
          margin:"0 0 6px"
        }}
      >
        📜 Order History
      </h1>


      <p
        style={{
          fontSize:"13px",
          color:"#64748b",
          marginBottom:"22px"
        }}
      >
        View past orders, reorder favourites, and submit ratings.
      </p>



      <div
        style={{
          background:"#fff",
          border:"1px solid #e2e8f0",
          borderRadius:"16px",
          overflow:"hidden"
        }}
      >

        <table
          style={{
            width:"100%",
            borderCollapse:"collapse",
            fontSize:"13px"
          }}
        >

          <thead>

            <tr style={{background:"#f8fafc"}}>

              {[
                "Order & Date",
                "Restaurant",
                "Items",
                "Total",
                "Status",
                "Actions"
              ].map((h)=>(
                <th
                  key={h}
                  style={{
                    padding:"12px 18px",
                    textAlign:"left"
                  }}
                >
                  {h}
                </th>
              ))}

            </tr>

          </thead>


          <tbody>

          {orders.map((o)=>(

            <tr key={o.orderId}>

              <td style={{padding:"14px 18px"}}>
                <strong>{o.orderId}</strong>
                <div>{o.date}</div>
              </td>


              <td style={{padding:"14px 18px"}}>
                {o.restaurant}
              </td>


              <td style={{padding:"14px 18px"}}>
                {o.items}
              </td>


              <td style={{padding:"14px 18px"}}>
                Rs. {o.total}
              </td>


              <td style={{padding:"14px 18px"}}>

                <span
                  style={{
                    background:o.status==="DELIVERED"
                    ? "#dcfce7"
                    : "#dbeafe",
                    padding:"4px 8px",
                    borderRadius:"6px"
                  }}
                >
                  {o.status}
                </span>

              </td>


              <td style={{padding:"14px 18px"}}>

                {
                o.status !== "DELIVERED"
                ?
                <button onClick={onNavigateTrack}>
                  Track Live
                </button>
                :
                <button
                  onClick={()=>setRatingOrderId(o.orderId)}
                >
                  ⭐ Rate
                </button>
                }

              </td>


            </tr>

          ))}

          </tbody>

        </table>

      </div>


      <RatingModal
        isOpen={Boolean(ratingOrderId)}
        orderId={ratingOrderId}
        onClose={()=>setRatingOrderId(null)}
      />

    </div>

  );

}


export default FoodieHistoryPage;