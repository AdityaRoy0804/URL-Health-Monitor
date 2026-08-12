import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import api from "../services/api";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

function HealthDetails() {
    const { id } = useParams();

    const [latest, setLatest] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Fetch health data.
     *
     * This function only performs API calls and returns
     * the result. State updates are handled separately.
     */
    const fetchHealthData = useCallback(async () => {
        const [
            latestResponse,
            statsResponse,
            historyResponse,
        ] = await Promise.all([
            api.get(`/${id}/health/latest`),

            api.get(`/${id}/health/stats`),

            api.get(`/${id}/health`, {
                params: {
                    page,
                    size: 10,
                    ...(statusFilter && {
                        status: statusFilter,
                    }),
                },
            }),
        ]);

        return {
            latest: latestResponse.data,
            stats: statsResponse.data,
            history: historyResponse.data.content,
            totalPages: historyResponse.data.totalPages,
        };
    }, [id, page, statusFilter]);

    /*
     * Load health data whenever URL, page, or filter changes.
     */
    useEffect(() => {
        let cancelled = false;

        const loadHealthData = async (showLoading = false) => {
            try {
                if (showLoading) {
                    setLoading(true);
                    setError("");
                }

                const data = await fetchHealthData();

                if (cancelled) {
                    return;
                }

                setLatest(data.latest);
                setStats(data.stats);
                setHistory(data.history);
                setTotalPages(data.totalPages);
                setError("");
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to fetch health data:",
                    err
                );

                setError(
                    "Failed to load health information."
                );
            } finally {
                if (showLoading && !cancelled) {
                    setLoading(false);
                }
            }
        };

        // Initial load
        loadHealthData(true);

        // Refresh health data every 5 seconds
        const intervalId = setInterval(() => {
            loadHealthData(false);
        }, 5000);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [fetchHealthData]);

    /*
     * Retry handler.
     */
    const handleRetry = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await fetchHealthData();

            setLatest(data.latest);
            setStats(data.stats);
            setHistory(data.history);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error(
                "Failed to fetch health data:",
                err
            );

            setError(
                "Failed to load health information."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilter = (event) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    if (loading) {
        return (
            <Loading message="Loading health information..." />
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

    const chartData = [...history]
        .filter(
            (record) =>
                record.responseTime !== null &&
                record.responseTime !== undefined
        )
        .reverse()
        .map((record) => ({
            time: new Date(
                record.checkedAt
            ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            responseTime: record.responseTime,
        }));

    const uptime = Number(
        stats?.uptimePercentage ?? 0
    );

    const averageResponse = Number(
        stats?.averageResponseTime ?? 0
    );

    const isHealthy = latest?.status === "UP";

    return (
        <>
            {/* Header */}

            <div className="page-header">
                <div>
                    <div className="breadcrumb">
                        <Link to="/urls">
                            URLs
                        </Link>

                        <span>/</span>

                        <span>Health Details</span>
                    </div>

                    <h1 className="page-title">
                        Health Details
                    </h1>

                    <p className="page-subtitle">
                        Monitor availability and
                        performance of this endpoint.
                    </p>
                </div>

                <Link
                    to="/urls"
                    className="btn btn-secondary"
                >
                    Back to URLs
                </Link>
            </div>

            {/* Current URL */}

            <section className="card url-overview">
                <div>
                    <p className="section-label">
                        Monitored Endpoint
                    </p>

                    <h2 className="url-detail-name">
                        URL #{id}
                    </h2>

                    <p className="url-detail-address">
                        Health monitoring endpoint
                    </p>
                </div>

                <div
                    className={`health-status ${
                        isHealthy
                            ? "health-status-up"
                            : "health-status-down"
                    }`}
                >
                    <span className="status-dot"></span>

                    {latest
                        ? latest.status
                        : "NO DATA"}
                </div>
            </section>

            {/* Health Overview */}

            <section className="health-grid">
                <article className="stat-card">
                    <p className="stat-label">
                        Current Status
                    </p>

                    <p
                        className={`stat-value ${
                            isHealthy
                                ? "value-success"
                                : "value-danger"
                        }`}
                    >
                        {latest
                            ? latest.status
                            : "No Data"}
                    </p>

                    <p className="stat-description">
                        {latest
                            ? `HTTP ${
                                  latest.statusCode ??
                                  "-"
                              }`
                            : "No health checks available"}
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Uptime
                    </p>

                    <p className="stat-value">
                        {uptime.toFixed(2)}%
                    </p>

                    <p className="stat-description">
                        Overall availability
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Average Response
                    </p>

                    <p className="stat-value">
                        {averageResponse.toFixed(2)}

                        <span className="stat-unit">
                            ms
                        </span>
                    </p>

                    <p className="stat-description">
                        Average response time
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Total Checks
                    </p>

                    <p className="stat-value">
                        {stats?.totalChecks ?? 0}
                    </p>

                    <p className="stat-description">
                        Health checks performed
                    </p>
                </article>
            </section>

            {/* Response Statistics */}

            <section className="health-grid health-grid-small">
                <article className="stat-card">
                    <p className="stat-label">
                        Successful Checks
                    </p>

                    <p className="stat-value value-success">
                        {stats?.successfulChecks ?? 0}
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Failed Checks
                    </p>

                    <p className="stat-value value-danger">
                        {stats?.failedChecks ?? 0}
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Minimum Response
                    </p>

                    <p className="stat-value">
                        {stats?.minResponseTime ?? "-"}

                        <span className="stat-unit">
                            ms
                        </span>
                    </p>
                </article>

                <article className="stat-card">
                    <p className="stat-label">
                        Maximum Response
                    </p>

                    <p className="stat-value">
                        {stats?.maxResponseTime ?? "-"}

                        <span className="stat-unit">
                            ms
                        </span>
                    </p>
                </article>
            </section>

            {/* Latest Check Details */}

            {latest && (
                <section className="card">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">
                                Latest Check
                            </h2>

                            <p className="section-subtitle">
                                Most recent health
                                check result.
                            </p>
                        </div>
                    </div>

                    <div className="latest-check-grid">
                        <div>
                            <span className="detail-label">
                                Status
                            </span>

                            <strong>
                                {latest.status}
                            </strong>
                        </div>

                        <div>
                            <span className="detail-label">
                                Status Code
                            </span>

                            <strong>
                                {latest.statusCode ?? "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="detail-label">
                                Response Time
                            </span>

                            <strong>
                                {latest.responseTime ?? "-"}{" "}
                                ms
                            </strong>
                        </div>

                        <div>
                            <span className="detail-label">
                                Checked At
                            </span>

                            <strong>
                                {new Date(
                                    latest.checkedAt
                                ).toLocaleString()}
                            </strong>
                        </div>
                    </div>

                    {latest.errorMessage && (
                        <div className="health-error">
                            <strong>
                                Error:
                            </strong>{" "}
                            {latest.errorMessage}
                        </div>
                    )}
                </section>
            )}

            {/* Response Time Chart */}

            <section className="card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">
                            Response Time
                        </h2>

                        <p className="section-subtitle">
                            Response-time trend from
                            recent health checks.
                        </p>
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            Not enough data to display
                            the response-time chart.
                        </p>
                    </div>
                ) : (
                    <div className="chart-container">
                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="time"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    unit=" ms"
                                />

                                <Tooltip
                                    formatter={(value) => [
                                        `${value} ms`,
                                        "Response Time",
                                    ]}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="responseTime"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{
                                        r: 3,
                                    }}
                                    activeDot={{
                                        r: 5,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* Health History */}

            <section className="card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">
                            Health History
                        </h2>

                        <p className="section-subtitle">
                            Detailed history of health
                            checks.
                        </p>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="status-filter">
                            Status
                        </label>

                        <select
                            id="status-filter"
                            className="form-select"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                        >
                            <option value="">
                                All
                            </option>

                            <option value="UP">
                                UP
                            </option>

                            <option value="DOWN">
                                DOWN
                            </option>
                        </select>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            No health records
                        </h3>

                        <p>
                            No health checks match
                            the selected filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>
                                            Status Code
                                        </th>
                                        <th>
                                            Response
                                        </th>
                                        <th>
                                            Checked At
                                        </th>
                                        <th>
                                            Error
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {history.map(
                                        (record) => (
                                            <tr
                                                key={
                                                    record.id
                                                }
                                            >
                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            record.status ===
                                                            "UP"
                                                                ? "status-up"
                                                                : "status-down"
                                                        }`}
                                                    >
                                                        {
                                                            record.status
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {record.statusCode ??
                                                        "-"}
                                                </td>

                                                <td>
                                                    {record.responseTime ??
                                                        "-"}{" "}
                                                    ms
                                                </td>

                                                <td>
                                                    {new Date(
                                                        record.checkedAt
                                                    ).toLocaleString()}
                                                </td>

                                                <td className="error-cell">
                                                    {record.errorMessage ||
                                                        "-"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    disabled={page === 0}
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current - 1
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page + 1} of{" "}
                                    {totalPages}
                                </span>

                                <button
                                    className="btn btn-secondary"
                                    disabled={
                                        page >=
                                        totalPages - 1
                                    }
                                    onClick={() =>
                                        setPage(
                                            (current) =>
                                                current + 1
                                        )
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </>
    );
}

export default HealthDetails;