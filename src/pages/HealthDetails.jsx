import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function UrlHealth() {
    const { id } = useParams();

    const [latest, setLatest] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHealthData = async () => {
        try {
            setLoading(true);
            setError("");

            const [latestResponse, statsResponse, historyResponse] =
                await Promise.all([
                    api.get(`/${id}/health/latest`),
                    api.get(`/${id}/health/stats`),
                    api.get(`/${id}/health`, {
                        params: {
                            page,
                            size: 10,
                        },
                    }),
                ]);

            setLatest(latestResponse.data);
            setStats(statsResponse.data);

            setHistory(historyResponse.data.content);
            setTotalPages(historyResponse.data.totalPages);
        } catch (err) {
            console.error("Failed to fetch health data:", err);
            setError("Failed to load health information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, [id, page]);

    if (loading) {
        return (
            <main>
                <h1>URL Health</h1>
                <p>Loading health information...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <h1>URL Health</h1>
                <p>{error}</p>

                <button onClick={fetchHealthData}>
                    Try Again
                </button>
            </main>
        );
    }

    return (
        <main>
            <section>
                <h1>URL Health</h1>
                <p>URL ID: {id}</p>
            </section>

            {/* Latest Health */}
            <section>
                <h2>Current Status</h2>

                {latest ? (
                    <div>
                        <p>
                            Status: <strong>{latest.status}</strong>
                        </p>

                        <p>
                            Status Code: {latest.statusCode}
                        </p>

                        <p>
                            Response Time: {latest.responseTime} ms
                        </p>

                        <p>
                            Last Checked:{" "}
                            {new Date(
                                latest.checkedAt
                            ).toLocaleString()}
                        </p>

                        {latest.errorMessage && (
                            <p>
                                Error: {latest.errorMessage}
                            </p>
                        )}
                    </div>
                ) : (
                    <p>No health checks available.</p>
                )}
            </section>

            {/* Statistics */}
            {stats && (
                <section>
                    <h2>Statistics</h2>

                    <div>
                        <div>
                            <h3>Total Checks</h3>
                            <p>{stats.totalChecks}</p>
                        </div>

                        <div>
                            <h3>Successful Checks</h3>
                            <p>{stats.successfulChecks}</p>
                        </div>

                        <div>
                            <h3>Failed Checks</h3>
                            <p>{stats.failedChecks}</p>
                        </div>

                        <div>
                            <h3>Uptime</h3>
                            <p>
                                {stats.uptimePercentage.toFixed(2)}%
                            </p>
                        </div>

                        <div>
                            <h3>Average Response</h3>
                            <p>
                                {stats.averageResponseTime.toFixed(2)} ms
                            </p>
                        </div>

                        <div>
                            <h3>Minimum Response</h3>
                            <p>
                                {stats.minResponseTime ?? "-"} ms
                            </p>
                        </div>

                        <div>
                            <h3>Maximum Response</h3>
                            <p>
                                {stats.maxResponseTime ?? "-"} ms
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Health History */}
            <section>
                <h2>Health History</h2>

                {history.length === 0 ? (
                    <p>No health records available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Status Code</th>
                                <th>Response Time</th>
                                <th>Checked At</th>
                                <th>Error</th>
                            </tr>
                        </thead>

                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.status}</td>

                                    <td>
                                        {record.statusCode ?? "-"}
                                    </td>

                                    <td>
                                        {record.responseTime ?? "-"} ms
                                    </td>

                                    <td>
                                        {new Date(
                                            record.checkedAt
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {record.errorMessage || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div>
                        <button
                            disabled={page === 0}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

export default UrlHealth;