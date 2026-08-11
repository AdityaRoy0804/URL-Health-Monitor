function Dashboard() {
    return (
        <main>
            <section>
                <h1>URL Health Monitor</h1>

                <p>
                    Monitor your URLs and track their health,
                    response time, and uptime.
                </p>
            </section>

            <section>
                <div>
                    <h2>Dashboard</h2>
                    <p>
                        View the health status of your monitored URLs.
                    </p>
                </div>

                <div>
                    <div>
                        <h3>Total URLs</h3>
                        <p>--</p>
                    </div>

                    <div>
                        <h3>Healthy</h3>
                        <p>--</p>
                    </div>

                    <div>
                        <h3>Down</h3>
                        <p>--</p>
                    </div>

                    <div>
                        <h3>Uptime</h3>
                        <p>--</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Dashboard;