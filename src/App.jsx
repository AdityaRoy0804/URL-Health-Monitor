import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Urls from "./pages/Urls";
import AddUrl from "./pages/AddUrl";
import HealthDetails from "./pages/HealthDetails";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />

                <main className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/urls"
                            element={<Urls />}
                        />

                        <Route
                            path="/urls/new"
                            element={<AddUrl />}
                        />

                        <Route
                            path="/urls/:id/health"
                            element={<HealthDetails />}
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;