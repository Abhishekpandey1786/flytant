import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios"; 

export default function PaymentStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const payment_id = searchParams.get("payment_id");
      const payment_request_id = searchParams.get("payment_request_id");
      const userId = searchParams.get("userId");
      const planCode = searchParams.get("plan");

      if (payment_id && payment_request_id) {
        try {
        
          await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/instamojo/verify-status`, {
            payment_id,
            payment_request_id,
            userId,
            planCode
          });
          
          console.log("Payment Verified!");
        } catch (error) {
          console.error("Verification failed", error);
        }
      }
      setTimeout(() => {
        navigate("/my-orders");
      }, 3000);
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Processing Payment...</h1>
      <p>Please wait, verifying your transaction.</p>
    </div>
  );
}