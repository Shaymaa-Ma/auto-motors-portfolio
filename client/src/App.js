import React, { useEffect, useState } from "react";

import Home from "./pages/Home";

function App() {
  // Forces the Home page to remount and fetch the latest data
  // whenever the user returns to the Client tab after making
  // changes from the Admin panel
  const [refreshKey, setRefreshKey] = useState(0);

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

  return <Home key={refreshKey} />;
}

export default App;
