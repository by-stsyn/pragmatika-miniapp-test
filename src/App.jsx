import { platform } from "./platform";
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./AppRoutes";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  useEffect(() => {
    try {
      platform.init((user) => {
        if (user) {
          console.log("User ID:", user.id);
          console.log("User name:", user.firstName, user.lastName);
        }
      });
    } catch (e) {
      console.warn("Platform init error:", e);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
