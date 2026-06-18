import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Weather History */}
        <Route
          path="/history"
          element={<History />}
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={<Home />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;