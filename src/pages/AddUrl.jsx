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
            console.error(
                "Failed to create URL:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to create URL."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Add URL
                    </h1>

                    <p className="page-subtitle">
                        Register a new endpoint for
                        health monitoring.
                    </p>
                </div>
            </div>

            <section className="card form-card">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label
                            htmlFor="name"
                            className="form-label"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Google"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
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
                            type="url"
                            className="form-input"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(event) =>
                                setUrl(
                                    event.target.value
                                )
                            }
                            required
                        />

                        <p className="form-help">
                            URL must start with
                            http:// or https://
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-checkbox">
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(event) =>
                                    setEnabled(
                                        event.target.checked
                                    )
                                }
                            />

                            <span>
                                Enable monitoring
                            </span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/urls")
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create URL"}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default AddUrl;