import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
    window.location.hash = "todo-list";
  }, [navigate]);

  return null;
}
