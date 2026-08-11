import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Urls from "./pages/Urls";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/urls" element={<Urls />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;