import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [healthData, setHealthData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/view");

            const urlList = response.data;

            setUrls(urlList);

            const healthRequests = urlList.map(
                async (url) => {
                    try {
                        const healthResponse =
                            await api.get(
                                `/${url.id}/health/latest`
                            );

                        return {
                            id: url.id,
                            data: healthResponse.data,
                        };
                    } catch (err) {
                        console.error(
                            `Failed to fetch health for URL ${url.id}:`,
                            err
                        );

                        return {
                            id: url.id,
                            data: null,
                        };
                    }
                }
            );

            const healthResults =
                await Promise.all(healthRequests);

            const healthMap = {};

            healthResults.forEach((item) => {
                healthMap[item.id] = item.data;
            });

            setHealthData(healthMap);
        } catch (err) {
            console.error(
                "Failed to load dashboard:",
                err
            );

            setError("Failed to load dashboard.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={fetchDashboard}
            />
        );
    }

    const totalUrls = urls.length;

    const enabledUrls = urls.filter(
        (url) => url.enabled
    ).length;

    const disabledUrls = urls.filter(
        (url) => !url.enabled
    ).length;

    const healthyUrls = urls.filter(
        (url) =>
            healthData[url.id]?.status === "UP"
    ).length;

    const unhealthyUrls = urls.filter(
        (url) =>
            healthData[url.id]?.status === "DOWN"
    ).length;

    return (
        <>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Dashboard
                    </h1>

                    <p className="page-subtitle">
                        Monitor the health and
                        performance of your URLs.
                    </p>
                </div>

                <Link
                    to="/urls/new"
                    className="btn btn-primary"
                >
                    + Add URL
                </Link>
            </div>

            {/* Overview */}
            <section>
                <div className="stats-grid">
                    <div className="stat-card">
                        <p className="stat-label">
                            Total URLs
                        </p>

                        <p className="stat-value">
                            {totalUrls}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="stat-label">
                            Enabled
                        </p>

                        <p className="stat-value">
                            {enabledUrls}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="stat-label">
                            Disabled
                        </p>

                        <p className="stat-value">
                            {disabledUrls}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="stat-label">
                            Healthy
                        </p>

                        <p className="stat-value">
                            {healthyUrls}
                        </p>
                    </div>

                    <div className="stat-card">
                        <p className="stat-label">
                            Unhealthy
                        </p>

                        <p className="stat-value">
                            {unhealthyUrls}
                        </p>
                    </div>
                </div>
            </section>

            {/* Monitored URLs */}
            <section className="card">
                <div className="page-header">
                    <div>
                        <h2 className="card-title">
                            Monitored URLs
                        </h2>

                        <p className="card-description">
                            Current status of your
                            registered endpoints.
                        </p>
                    </div>

                    <Link
                        to="/urls"
                        className="btn btn-secondary"
                    >
                        Manage URLs
                    </Link>
                </div>

                {urls.length === 0 ? (
                    <div className="empty-state">
                        <h2>
                            No URLs registered
                        </h2>

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
                                    <th>Monitoring</th>
                                    <th>Health</th>
                                    <th>Response</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {urls.map((url) => {
                                    const health =
                                        healthData[
                                            url.id
                                        ];

                                    return (
                                        <tr
                                            key={url.id}
                                        >
                                            <td>
                                                <p className="url-name">
                                                    {
                                                        url.name
                                                    }
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
                                                {health ? (
                                                    <span
                                                        className={`status-badge ${
                                                            health.status ===
                                                            "UP"
                                                                ? "status-up"
                                                                : "status-down"
                                                        }`}
                                                    >
                                                        {
                                                            health.status
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="status-badge status-disabled">
                                                        No Data
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {health?.responseTime !=
                                                null
                                                    ? `${health.responseTime} ms`
                                                    : "-"}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}

export default Dashboard;