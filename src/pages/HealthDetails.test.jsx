import {
    describe,
    expect,
    it,
    vi,
    beforeEach,
    afterEach,
} from "vitest";

import {
    render,
    screen,
    waitFor,
    within,
    fireEvent,
} from "@testing-library/react";

import { MemoryRouter, Route, Routes } from "react-router-dom";

import HealthDetails from "./HealthDetails";
import api from "../services/api";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
    },
}));

vi.mock("../components/Loading", () => ({
    default: ({ message }) => (
        <div data-testid="loading">
            {message}
        </div>
    ),
}));

vi.mock("../components/ErrorMessage", () => ({
    default: ({ message, onRetry }) => (
        <div data-testid="error-message">
            <p>{message}</p>

            <button onClick={onRetry}>
                Retry
            </button>
        </div>
    ),
}));

/*
 * Recharts is not the focus of these tests.
 * Mock it so the tests remain focused on
 * HealthDetails behavior and API integration.
 */
vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }) => (
        <div data-testid="chart-container">
            {children}
        </div>
    ),

    LineChart: ({ children }) => (
        <div>{children}</div>
    ),

    Line: () => <div data-testid="line-chart" />,

    XAxis: () => null,

    YAxis: () => null,

    CartesianGrid: () => null,

    Tooltip: () => null,
}));

const renderHealthDetails = () => {
    return render(
        <MemoryRouter
            initialEntries={["/urls/1/health"]}
        >
            <Routes>
                <Route
                    path="/urls/:id/health"
                    element={<HealthDetails />}
                />
            </Routes>
        </MemoryRouter>
    );
};

const mockHealthResponses = ({
    status = "UP",
    responseTime = 120,
} = {}) => {
    api.get.mockImplementation((url) => {
        if (url === "/1/health/latest") {
            return Promise.resolve({
                data: {
                    status,
                    statusCode: status === "UP" ? 200 : 500,
                    responseTime,
                    checkedAt:
                        "2026-08-12T17:00:00",
                    errorMessage:
                        status === "DOWN"
                            ? "Connection failed"
                            : null,
                },
            });
        }

        if (url === "/1/health/stats") {
            return Promise.resolve({
                data: {
                    uptimePercentage: 98.5,
                    averageResponseTime: 145.75,
                    totalChecks: 20,
                    successfulChecks: 19,
                    failedChecks: 1,
                    minResponseTime: 80,
                    maxResponseTime: 500,
                },
            });
        }

        if (url === "/1/health") {
            return Promise.resolve({
                data: {
                    content: [
                        {
                            id: 1,
                            status,
                            statusCode:
                                status === "UP"
                                    ? 200
                                    : 500,
                            responseTime,
                            checkedAt:
                                "2026-08-12T17:00:00",
                            errorMessage:
                                status === "DOWN"
                                    ? "Connection failed"
                                    : null,
                        },
                    ],
                    totalPages: 1,
                },
            });
        }

        return Promise.reject(
            new Error(
                `Unexpected endpoint: ${url}`
            )
        );
    });
};

describe("HealthDetails", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("shows loading state initially", () => {
        api.get.mockReturnValue(
            new Promise(() => {})
        );

        renderHealthDetails();

        expect(
            screen.getByTestId("loading")
        ).toHaveTextContent(
            "Loading health information..."
        );
    });

    it("loads and displays health information", async () => {
        mockHealthResponses();

        renderHealthDetails();

        await waitFor(() => {
            expect(
                screen.getByRole("heading", {
                    name: "Health Details",
                    level: 1,
                })
            ).toBeInTheDocument();

            expect(
                screen.getByText("98.50%")
            ).toBeInTheDocument();
        });

        expect(
            screen.getAllByText("UP").length
        ).toBeGreaterThan(0);

        expect(
            screen.getByText("98.50%")
        ).toBeInTheDocument();

        expect(
            screen.getByText("145.75")
        ).toBeInTheDocument();

        expect(
            screen.getByText("20")
        ).toBeInTheDocument();

        expect(
            screen.getByText("19")
        ).toBeInTheDocument();

        expect(
            screen.getByText("1")
        ).toBeInTheDocument();

        expect(
            screen.getByText("80")
        ).toBeInTheDocument();

        expect(
            screen.getByText("500")
        ).toBeInTheDocument();
    });

    it("calls all required health endpoints", async () => {
        mockHealthResponses();

        renderHealthDetails();

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                "/1/health/latest"
            );

            expect(api.get).toHaveBeenCalledWith(
                "/1/health/stats"
            );

            expect(api.get).toHaveBeenCalledWith(
                "/1/health",
                {
                    params: {
                        page: 0,
                        size: 10,
                    },
                }
            );
        });
    });

    it("displays latest check details", async () => {
        mockHealthResponses();

        renderHealthDetails();

        const latestCheckHeading =
            await screen.findByRole("heading", {
                name: "Latest Check",
            });

        const latestCheck =
            latestCheckHeading.closest("section");

        expect(latestCheck).toBeInTheDocument();

        expect(
            within(latestCheck).getByText("200")
        ).toBeInTheDocument();

        expect(
            within(latestCheck).getByText("120 ms")
        ).toBeInTheDocument();
    });

    it("displays response time chart when history exists", async () => {
        mockHealthResponses();

        renderHealthDetails();

        expect(
            await screen.findByTestId(
                "chart-container"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("line-chart")
        ).toBeInTheDocument();
    });

    it("displays health history", async () => {
        mockHealthResponses();

        renderHealthDetails();

        expect(
            await screen.findByRole("heading", {
                name: "Health History",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("columnheader", {
                name: "Status Code",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("columnheader", {
                name: "Response",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("columnheader", {
                name: "Checked At",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("columnheader", {
                name: "Error",
            })
        ).toBeInTheDocument();
    });

    it("changes status filter and resets page", async () => {
        api.get.mockImplementation((url, config) => {
            if (url === "/1/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "UP",
                        statusCode: 200,
                        responseTime: 120,
                        checkedAt:
                            "2026-08-12T17:00:00",
                    },
                });
            }

            if (url === "/1/health/stats") {
                return Promise.resolve({
                    data: {
                        uptimePercentage: 100,
                        averageResponseTime: 120,
                        totalChecks: 10,
                        successfulChecks: 10,
                        failedChecks: 0,
                        minResponseTime: 100,
                        maxResponseTime: 150,
                    },
                });
            }

            if (url === "/1/health") {
                return Promise.resolve({
                    data: {
                        content: [],
                        totalPages: 1,
                    },
                });
            }

            return Promise.reject(
                new Error("Unexpected endpoint")
            );
        });

        renderHealthDetails();

        const filter =
            await screen.findByLabelText("Status");

        fireEvent.change(filter, {
            target: {
                value: "DOWN",
            },
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                "/1/health",
                {
                    params: {
                        page: 0,
                        size: 10,
                        status: "DOWN",
                    },
                }
            );
        });
    });

    it("shows empty state when no health records exist", async () => {
        api.get.mockImplementation((url) => {
            if (url === "/1/health/latest") {
                return Promise.resolve({
                    data: null,
                });
            }

            if (url === "/1/health/stats") {
                return Promise.resolve({
                    data: {
                        uptimePercentage: 0,
                        averageResponseTime: 0,
                        totalChecks: 0,
                        successfulChecks: 0,
                        failedChecks: 0,
                        minResponseTime: null,
                        maxResponseTime: null,
                    },
                });
            }

            if (url === "/1/health") {
                return Promise.resolve({
                    data: {
                        content: [],
                        totalPages: 0,
                    },
                });
            }

            return Promise.reject(
                new Error("Unexpected endpoint")
            );
        });

        renderHealthDetails();

        expect(
            await screen.findByText(
                "No health records"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "No health checks match the selected filter."
            )
        ).toBeInTheDocument();
    });

    it("shows DOWN status and error message", async () => {
        mockHealthResponses({
            status: "DOWN",
            responseTime: 500,
        });

        renderHealthDetails();

        expect(
            await screen.findByRole("heading", {
                name: "Health Details",
                level: 1,
            })
        ).toBeInTheDocument();

        const currentStatus = screen
            .getByText("Current Status")
            .closest(".stat-card");

        expect(currentStatus).toHaveTextContent("DOWN");

        const latestCheck = screen
            .getByRole("heading", {
                name: "Latest Check",
                level: 2,
            })
            .closest(".card");

        expect(latestCheck).toHaveTextContent(
            "Connection failed"
        );

        expect(latestCheck).toHaveTextContent(
            "500"
        );
    });

    it("shows error state when API request fails", async () => {
        api.get.mockRejectedValue(
            new Error("Network error")
        );

        renderHealthDetails();

        expect(
            await screen.findByTestId(
                "error-message"
            )
        ).toHaveTextContent(
            "Failed to load health information."
        );
    });

    it("automatically refreshes health data after 5 seconds", async () => {
        vi.useFakeTimers();

        mockHealthResponses();

        renderHealthDetails();

        await vi.waitFor(async () => {
            expect(api.get).toHaveBeenCalledTimes(3);
        });

        api.get.mockClear();

        await vi.advanceTimersByTimeAsync(5000);

        expect(api.get).toHaveBeenCalledWith(
            "/1/health/latest"
        );

        expect(api.get).toHaveBeenCalledWith(
            "/1/health/stats"
        );

        expect(api.get).toHaveBeenCalledWith(
            "/1/health",
            {
                params: {
                    page: 0,
                    size: 10,
                },
            }
        );
    });

    it("cleans up the refresh interval when unmounted", async () => {
        vi.useFakeTimers();

        mockHealthResponses();

        const { unmount } = renderHealthDetails();

        await vi.waitFor(async () => {
            expect(api.get).toHaveBeenCalledTimes(3);
        });

        api.get.mockClear();

        unmount();

        await vi.advanceTimersByTimeAsync(10000);

        expect(api.get).not.toHaveBeenCalled();
    });
});