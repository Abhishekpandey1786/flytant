import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("Processing Payment...");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");

    if (!sessionId) {
      setMessage("Session ID missing! Redirecting...");
      setTimeout(() => navigate("/plans"), 3000);
      return;
    }

    // Optional: Backend से payment status check करना
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/checkout-session/${sessionId}`)
      .then(res => {
        if (res.data.payment_status === "paid") {
          setMessage("Payment Successful! Redirecting to your orders...");
        } else {
          setMessage("Payment not completed. Redirecting...");
        }
        setTimeout(() => navigate("/my-orders"), 3000);
      })
      .catch(err => {
        setMessage("Error checking payment. Redirecting...");
        setTimeout(() => navigate("/plans"), 3000);
      });
  }, [location.search, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>{message}</h1>
      <p>Please wait, don't close this page.</p>
    </div>
  );
}