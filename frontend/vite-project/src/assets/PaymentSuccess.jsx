useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");

    if (!sessionId) {
      setMessage("Session ID missing! Redirecting...");
      setTimeout(() => navigate("/plans"), 3000);
      return;
    }

    // Backend से optional payment status check
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