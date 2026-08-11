import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

            const healthRequests = urlList.map(async (url) => {
                try {
                    const healthResponse = await api.get(
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
            });

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
        return (
            <main>
                <h1>Dashboard</h1>
                <p>Loading dashboard...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main>
                <h1>Dashboard</h1>

                <p>{error}</p>

                <button onClick={fetchDashboard}>
                    Try Again
                </button>
            </main>
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
        <main>
            <section>
                <h1>Dashboard</h1>

                <p>
                    Monitor the health and performance of
                    your registered URLs.
                </p>
            </section>

            {/* Summary */}
            <section>
                <h2>Overview</h2>

                <div>
                    <article>
                        <h3>Total URLs</h3>
                        <p>{totalUrls}</p>
                    </article>

                    <article>
                        <h3>Enabled</h3>
                        <p>{enabledUrls}</p>
                    </article>

                    <article>
                        <h3>Disabled</h3>
                        <p>{disabledUrls}</p>
                    </article>

                    <article>
                        <h3>Healthy</h3>
                        <p>{healthyUrls}</p>
                    </article>

                    <article>
                        <h3>Unhealthy</h3>
                        <p>{unhealthyUrls}</p>
                    </article>
                </div>
            </section>

            {/* URLs */}
            <section>
                <div>
                    <h2>Monitored URLs</h2>

                    <Link to="/urls">
                        Manage URLs
                    </Link>
                </div>

                {urls.length === 0 ? (
                    <div>
                        <p>
                            No URLs are being monitored.
                        </p>

                        <Link to="/urls/new">
                            Add your first URL
                        </Link>
                    </div>
                ) : (
                    <div>
                        {urls.map((url) => {
                            const health =
                                healthData[url.id];

                            return (
                                <article key={url.id}>
                                    <div>
                                        <h3>{url.name}</h3>

                                        <p>
                                            {url.url}
                                        </p>
                                    </div>

                                    <div>
                                        <p>
                                            Monitoring:{" "}
                                            {url.enabled
                                                ? "Enabled"
                                                : "Disabled"}
                                        </p>

                                        <p>
                                            Health:{" "}
                                            {health
                                                ? health.status
                                                : "No Data"}
                                        </p>

                                        {health && (
                                            <p>
                                                Response:{" "}
                                                {
                                                    health.responseTime
                                                }{" "}
                                                ms
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Link
                                            to={`/urls/${url.id}/health`}
                                        >
                                            View Health
                                        </Link>

                                        <Link
                                            to={`/urls/${url.id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Dashboard;