import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Urls() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/view");

            setUrls(response.data);
        } catch (err) {
            console.error("Failed to fetch URLs:", err);
            setError("Failed to load URLs.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main>
                <h1>URLs</h1>
                <p>Loading URLs...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <h1>URLs</h1>
                <p>{error}</p>
                <button onClick={fetchUrls}>
                    Try Again
                </button>
            </main>
        );
    }

    return (
        <main>
            <section>
                <h1>URLs</h1>

                <Link to="/urls/new">
                    Add URL
                </Link>
            </section>

            {urls.length === 0 ? (
                <section>
                    <p>No URLs registered yet.</p>

                    <Link to="/urls/new">
                        Add your first URL
                    </Link>
                </section>
            ) : (
                <section>
                    {urls.map((url) => (
                        <article key={url.id}>
                            <h2>{url.name}</h2>

                            <p>{url.url}</p>

                            <p>
                                Status:{" "}
                                {url.enabled
                                    ? "Enabled"
                                    : "Disabled"}
                            </p>

                            <Link
                                to={`/urls/${url.id}/health`}
                            >
                                View Health
                            </Link>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Urls;