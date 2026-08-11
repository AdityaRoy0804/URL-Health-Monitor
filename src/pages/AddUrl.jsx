import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddUrl() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enabled, setEnabled] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await api.post("/new", {
                name,
                url,
                enabled,
            });

            navigate("/urls");
        } catch (err) {
            console.error("Failed to create URL:", err);

            setError(
                err.response?.data?.message ||
                "Failed to register URL."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Add URL</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Google"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="url">
                        URL
                    </label>

                    <input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(event) =>
                            setUrl(event.target.value)
                        }
                        placeholder="https://www.google.com"
                        required
                    />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(event) =>
                                setEnabled(event.target.checked)
                            }
                        />

                        Enabled
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add URL"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/urls")}
                >
                    Cancel
                </button>
            </form>
        </main>
    );
}

export default AddUrl;