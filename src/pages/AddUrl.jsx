import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddUrl() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        url: "",
        enabled: true,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!formData.url.trim()) {
            setError("URL is required.");
            return;
        }

        if (
            !formData.url.startsWith("http://") &&
            !formData.url.startsWith("https://")
        ) {
            setError("URL must start with http:// or https://");
            return;
        }

        try {
            setLoading(true);

            await api.post("/new", {
                name: formData.name.trim(),
                url: formData.url.trim(),
                enabled: formData.enabled,
            });

            navigate("/urls");
        } catch (err) {
            console.error("Failed to create URL:", err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to register URL.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <section>
                <h1>Add URL</h1>
                <p>Register a new URL to monitor.</p>
            </section>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Google"
                    />
                </div>

                <div>
                    <label htmlFor="url">
                        URL
                    </label>

                    <input
                        id="url"
                        name="url"
                        type="url"
                        value={formData.url}
                        onChange={handleChange}
                        placeholder="https://example.com"
                    />
                </div>

                <div>
                    <label>
                        <input
                            name="enabled"
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={handleChange}
                        />

                        Enable monitoring
                    </label>
                </div>

                {error && (
                    <p>
                        {error}
                    </p>
                )}

                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/urls")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Registering..."
                            : "Register URL"}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default AddUrl;