import { platform } from "./platform";
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect } from "react";
import AppRoutes from "./AppRoutes";

function App() {
  useEffect(() => {
    platform.init((user) => {
      if (user) {
        console.log("User ID:", user.id);
        console.log("User name:", user.firstName, user.lastName);
      } else {
        console.log("User data not available yet");
      }
    });

// Проверяем, где мы находимся и какие данные пришли

    console.log("initDataUnsafe:", window.WebApp?.initDataUnsafe);

    
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
