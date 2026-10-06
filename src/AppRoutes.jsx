import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { platform } from "./platform";

import Home from "./Home";
import Showcase from "./Showcase";
import ShowcaseUsed from "./ShowcaseUsed";
import ServiceBooking from "./ServiceBooking";
import UsedCarDetails from "./UsedCarDetails";
import NewCarDetails from "./NewCarDetails";
import NewsList from "./NewsList";
import OffersList from "./OffersList";
import OfferDetails from "./OfferDetails";
import Contacts from "./Contacts";
import BonusPage from "./BonusPage";
import ProfilePage from "./ProfilePage";
import SnakeGame from "./SnakeGame";
import TiresWheelsPage from "./TiresWheelsPage";

export default function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const startParam = platform.getStartParam();

    switch (startParam) {
      case "new-car":
        navigate("/showcase");
        break;
      case "used-car":
        navigate("/showcaseused");
        break;
      case "service":
        navigate("/ServiceBooking");
        break;
      case "offers":
        navigate("/offers");
        break;
      case "news":
        navigate("/NewsList");
        break;
      case "contacts":
        navigate("/contacts");
        break;
      case "bonus":
        navigate("/BonusPage");
        break;
      case "profile":
        navigate("/ProfilePage");
        break;
        case "snake":
        navigate("/snake");
        break;
        case "tires-wheels":
        navigate("/tires-wheels");
        break;
      default:
        break;
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="/showcaseused" element={<ShowcaseUsed />} />
      <Route path="/ServiceBooking" element={<ServiceBooking />} />

      <Route path="/UsedCarDetails" element={<UsedCarDetails />} />
      <Route path="/NewCarDetails" element={<NewCarDetails />} />
      <Route path="/NewsList" element={<NewsList />} />
      <Route path="/offers" element={<OffersList />} />
      <Route path="/offer/:id" element={<OfferDetails />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/BonusPage" element={<BonusPage />} />
      <Route path="/ProfilePage" element={<ProfilePage />} />
      <Route path="/snake" element={<SnakeGame />} />
      <Route path="/tires-wheels" element={<TiresWheelsPage />} />
    </Routes>
  );
}
