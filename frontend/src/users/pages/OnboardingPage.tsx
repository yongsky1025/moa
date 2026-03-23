import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/users/energy-test?mode=onboarding", { replace: true });
  }, [navigate]);

  return null;
}
