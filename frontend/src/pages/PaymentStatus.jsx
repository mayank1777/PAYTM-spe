import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const sentiment = searchParams.get("sentiment"); // Get sentiment
  const feedback = searchParams.get("feedback"); // Get feedback
  const navigate = useNavigate();

  useEffect(() => {
    const userToken = localStorage.getItem("token");

    // Check if token exists in local storage
    if (!userToken) {
      navigate("/signin"); // Redirect to sign-in page if token doesn't exist
    } else {
      // Redirect to dashboard after a delay
      const t = setTimeout(() => {
        navigate("/dashboard");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div
        className={`md:w-1/4 text-center py-10 px-5 m-4 font-bold text-3xl ${
          sentiment === "Positive"
            ? "bg-green-300 text-green-900"
            : sentiment === "Negative"
            ? "bg-red-300 text-red-900"
            : "bg-yellow-300 text-yellow-900"
        }`}
      >
        <div>{message}</div> {/* Display the message */}
        <div className="text-center text-black text-xl font-semibold py-4">
          Sentiment: {sentiment}
        </div>
        <div className="text-center text-black text-md font-semibold py-4">
          Feedback: {feedback} {/* Display feedback */}
        </div>
        <div className="text-center text-black text-sm font-semibold py-4">
          Redirecting to Dashboard in 5 seconds.
        </div>
      </div>
    </div>
  );
};
