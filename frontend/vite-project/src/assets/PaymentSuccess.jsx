import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentStatus() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/my-orders");
    }, 3000); 
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Processing Payment...</h1>
      <p>Please wait, don't close this page.</p>
    </div>
  );
}
