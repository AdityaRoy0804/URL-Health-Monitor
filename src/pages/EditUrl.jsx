import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditUrl() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        url: "",
        enabled: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUrl();
    }, [id]);

    const fetchUrl = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/view/${id}`);

            setFormData({
                name: response.data.name ?? "",
                url: response.data.url ?? "",
                enabled: response.data.enabled ?? true,
            });
        } catch (err) {
            console.error("Failed to fetch URL:", err);
            setError("Failed to load URL.");
        } finally {
            setLoading(false);
        }
    };

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
            setError(
                "URL must start with http:// or https://"
            );
            return;
        }

        try {
            setSaving(true);

            await api.put(`/edit/${id}`, {
                name: formData.name.trim(),
                url: formData.url.trim(),
                enabled: formData.enabled,
            });

            navigate("/urls");
        } catch (err) {
            console.error("Failed to update URL:", err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to update URL.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main>
                <h1>Edit URL</h1>
                <p>Loading URL...</p>
            </main>
        );
    }

    if (error && !formData.name && !formData.url) {
        return (
            <main>
                <h1>Edit URL</h1>

                <p>{error}</p>

                <button onClick={fetchUrl}>
                    Try Again
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/urls")}
                >
                    Back to URLs
                </button>
            </main>
        );
    }

    return (
        <main>
            <section>
                <h1>Edit URL</h1>
                <p>Update the monitored URL.</p>
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
                    <p>{error}</p>
                )}

                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/urls")}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default EditUrl;