import React, { useEffect, useState } from "react";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// =========================================================
// VALID PUBLIC HASHES
// =========================================================

const VALID_HASHES = [
  "home",
  "about",
  "services",
  "advantages",
  "products",
  "vehicles",
  "gallery",
  "faq",
  "contact",
];

function App() {
  // Forces the Home page to remount and fetch the latest data
  // whenever the user returns to the Client tab after making
  // changes from the Admin panel
  const [refreshKey, setRefreshKey] = useState(0);

  // Store the current hash
  const [currentHash, setCurrentHash] = useState(
    window.location.hash.replace("#", "")
  );

  // =========================================================
  // HANDLE HASH CHANGES
  // =========================================================

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash.replace("#", ""));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // =========================================================
  // REFRESH HOME WHEN TAB BECOMES VISIBLE
  // =========================================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      // When the Client tab becomes visible again,
      // remount Home so all sections fetch fresh data
      // from the backend without requiring a browser refresh
      if (document.visibilityState === "visible") {
        setRefreshKey((current) => current + 1);
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // =========================================================
  // CHECK WHETHER THE HASH IS VALID
  // =========================================================

  const isValidHash =
    currentHash === "" || VALID_HASHES.includes(currentHash);

  // =========================================================
  // SHOW 404 PAGE FOR INVALID HASHES
  // =========================================================

  if (!isValidHash) {
    return <NotFound />;
  }

  // =========================================================
  // SHOW NORMAL WEBSITE
  // =========================================================

  return <Home key={refreshKey} />;
}

export default App;