import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function EditUrl() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        url: "",
        enabled: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /*
     * Fetch URL data.
     * This function only performs the API request
     * and returns the required data.
     */
    const fetchUrl = useCallback(async () => {
        const response = await api.get(`/view/${id}`);

        return {
            name: response.data.name,
            url: response.data.url,
            enabled: response.data.enabled,
        };
    }, [id]);

    /*
     * Load URL when the page is opened
     * or when the URL id changes.
     */
    useEffect(() => {
        let cancelled = false;

        const loadUrl = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await fetchUrl();

                if (cancelled) {
                    return;
                }

                setForm(data);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to fetch URL:",
                    err
                );

                setError("Failed to load URL.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUrl();

        return () => {
            cancelled = true;
        };
    }, [fetchUrl]);

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            await api.put(`/edit/${id}`, form);

            navigate("/urls");
        } catch (err) {
            console.error(
                "Failed to update URL:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to update URL."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Loading message="Loading URL..." />
        );
    }

    if (error && !form.name) {
        return (
            <ErrorMessage
                message={error}
                onRetry={async () => {
                    try {
                        setLoading(true);
                        setError("");

                        const data =
                            await fetchUrl();

                        setForm(data);
                    } catch (err) {
                        console.error(
                            "Failed to fetch URL:",
                            err
                        );

                        setError(
                            "Failed to load URL."
                        );
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Edit URL
                    </h1>

                    <p className="page-subtitle">
                        Update the monitored
                        endpoint.
                    </p>
                </div>

                <Link
                    to="/urls"
                    className="btn btn-secondary"
                >
                    Back to URLs
                </Link>
            </div>

            <section className="card form-card">
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label
                            htmlFor="name"
                            className="form-label"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            className="form-input"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="url"
                            className="form-label"
                        >
                            URL
                        </label>

                        <input
                            id="url"
                            className="form-input"
                            type="url"
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                name="enabled"
                                checked={
                                    form.enabled
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            Enable monitoring
                        </label>
                    </div>

                    <div className="form-actions">
                        <Link
                            to="/urls"
                            className="btn btn-secondary"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default EditUrl;