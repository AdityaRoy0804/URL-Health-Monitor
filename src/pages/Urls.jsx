import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function Urls() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Fetch URLs from the backend.
     *
     * This function only performs the API request
     * and returns the data. It does not update state.
     */
    const fetchUrls = useCallback(async () => {
        const response = await api.get("/view");

        return response.data;
    }, []);

    /*
     * Load URLs when the component mounts.
     *
     * State is updated after the asynchronous request
     * completes, avoiding the set-state-in-effect lint error.
     */
    useEffect(() => {
        let cancelled = false;

        const loadUrls = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await fetchUrls();

                if (cancelled) {
                    return;
                }

                setUrls(data);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to fetch URLs:",
                    err
                );

                setError("Failed to load URLs.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUrls();

        return () => {
            cancelled = true;
        };
    }, [fetchUrls]);

    /*
     * Retry loading URLs.
     */
    const handleRetry = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await fetchUrls();

            setUrls(data);
        } catch (err) {
            console.error(
                "Failed to fetch URLs:",
                err
            );

            setError("Failed to load URLs.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Loading message="Loading URLs..." />
        );
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={handleRetry}
            />
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        URLs
                    </h1>

                    <p className="page-subtitle">
                        Manage and monitor your
                        registered endpoints.
                    </p>
                </div>

                <Link
                    to="/urls/new"
                    className="btn btn-primary"
                >
                    + Add URL
                </Link>
            </div>

            <section className="card">
                {urls.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            No URLs registered
                        </h3>

                        <p>
                            Add your first URL to
                            start monitoring it.
                        </p>

                        <Link
                            to="/urls/new"
                            className="btn btn-primary"
                        >
                            Add URL
                        </Link>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>URL</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {urls.map((url) => (
                                    <tr key={url.id}>
                                        <td>
                                            <p className="url-name">
                                                {url.name}
                                            </p>
                                        </td>

                                        <td>
                                            <p className="url-address">
                                                {url.url}
                                            </p>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${
                                                    url.enabled
                                                        ? "status-up"
                                                        : "status-disabled"
                                                }`}
                                            >
                                                {url.enabled
                                                    ? "Enabled"
                                                    : "Disabled"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="actions">
                                                <Link
                                                    to={`/urls/${url.id}/health`}
                                                    className="btn btn-secondary"
                                                >
                                                    Health
                                                </Link>

                                                <Link
                                                    to={`/urls/${url.id}/edit`}
                                                    className="btn btn-secondary"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}

export default Urls;