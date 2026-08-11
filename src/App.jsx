import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
    const [status, setStatus] = useState("Checking backend...");

    useEffect(() => {
        api.get("/health")
            .then((response) => {
                setStatus(response.data.status);
            })
            .catch(() => {
                setStatus("Backend connection failed");
            });
    }, []);

    return (
        <div>
            <h1>URL Health Monitor</h1>
            <p>{status}</p>
        </div>
    );
}

export default App;