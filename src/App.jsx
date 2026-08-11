import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Urls from "./pages/Urls";
import AddUrl from "./pages/AddUrl";
import HealthDetails from "./pages/HealthDetails";
import EditUrl from "./pages/EditUrl";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/urls" element={<Urls />} />
                <Route path="/urls/new" element={<AddUrl />} />

                <Route
                    path="/urls/:id/health"
                    element={<HealthDetails />}
                />
                <Route
                    path="/urls/:id/edit"
                    element={<EditUrl />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;