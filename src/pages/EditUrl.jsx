import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function EditUrl() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enabled, setEnabled] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [saveError, setSaveError] =
        useState("");

    useEffect(() => {
        fetchUrl();
    }, [id]);

    const fetchUrl = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/view/${id}`
            );

            const data = response.data;

            setName(data.name);
            setUrl(data.url);
            setEnabled(data.enabled);
        } catch (err) {
            console.error(
                "Failed to fetch URL:",
                err
            );

            setError("Failed to load URL.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setSaveError("");

            await api.put(`/edit/${id}`, {
                name,
                url,
                enabled,
            });

            navigate("/urls");
        } catch (err) {
            console.error(
                "Failed to update URL:",
                err
            );

            setSaveError(
                err.response?.data?.message ||
                    "Failed to update URL."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={fetchUrl}
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
                        Update the configuration of
                        your monitored endpoint.
                    </p>
                </div>
            </div>

            <section className="card form-card">
                <form onSubmit={handleSubmit}>
                    {saveError && (
                        <div className="form-error">
                            {saveError}
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
                            disabled={saving}
                        >
                            Cancel
                        </button>

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