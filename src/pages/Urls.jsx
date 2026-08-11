import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Urls() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

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

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this URL?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);

            await api.delete(`/delete/${id}`);

            setUrls((currentUrls) =>
                currentUrls.filter((url) => url.id !== id)
            );
        } catch (err) {
            console.error("Failed to delete URL:", err);

            setError("Failed to delete URL.");
        } finally {
            setDeletingId(null);
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

    if (error && urls.length === 0) {
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

            {error && (
                <section>
                    <p>{error}</p>
                </section>
            )}

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

                            <div>
                                <Link
                                    to={`/urls/${url.id}/health`}
                                >
                                    View Health
                                </Link>

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/urls/${url.id}/edit`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(url.id)
                                    }
                                    disabled={
                                        deletingId === url.id
                                    }
                                >
                                    {deletingId === url.id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Urls;