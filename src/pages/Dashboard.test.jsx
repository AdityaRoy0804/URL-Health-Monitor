import {
    describe,
    expect,
    it,
    vi,
    beforeEach,
} from "vitest";

import {
    render,
    screen,
} from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import Dashboard from "./Dashboard";
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
    default: ({ message }) => (
        <div data-testid="error-message">
            {message}
        </div>
    ),
}));

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading state initially", () => {
        api.get.mockReturnValue(
            new Promise(() => {})
        );

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            screen.getByTestId("loading")
        ).toHaveTextContent(
            "Loading dashboard..."
        );
    });

    it("renders dashboard statistics", async () => {
        api.get.mockImplementation((url) => {
            if (url === "/view") {
                return Promise.resolve({
                    data: [
                        {
                            id: 1,
                            name: "Google",
                            url: "https://google.com",
                            enabled: true,
                        },
                        {
                            id: 2,
                            name: "Example",
                            url: "https://example.com",
                            enabled: false,
                        },
                    ],
                });
            }

            if (url === "/1/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "UP",
                        responseTime: 120,
                    },
                });
            }

            if (url === "/2/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "DOWN",
                        responseTime: 500,
                    },
                });
            }

            return Promise.reject(
                new Error("Unexpected endpoint")
            );
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Dashboard")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Total URLs")
        ).toBeInTheDocument();

        expect(
            screen.getAllByText("Enabled")
        ).toHaveLength(2);

        expect(
            screen.getAllByText("Disabled")
        ).toHaveLength(2);

        expect(
            screen.getByText("Healthy")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Unhealthy")
        ).toBeInTheDocument();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();
    });

    it("renders monitored URLs", async () => {
        api.get.mockImplementation((url) => {
            if (url === "/view") {
                return Promise.resolve({
                    data: [
                        {
                            id: 1,
                            name: "Google",
                            url: "https://google.com",
                            enabled: true,
                        },
                        {
                            id: 2,
                            name: "Example",
                            url: "https://example.com",
                            enabled: false,
                        },
                    ],
                });
            }

            if (url === "/1/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "UP",
                        responseTime: 120,
                    },
                });
            }

            if (url === "/2/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "DOWN",
                        responseTime: 500,
                    },
                });
            }

            return Promise.reject(
                new Error("Unexpected endpoint")
            );
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Google")
        ).toBeInTheDocument();

        expect(
            screen.getByText("https://google.com")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Example")
        ).toBeInTheDocument();

        expect(
            screen.getByText("https://example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByText("UP")
        ).toBeInTheDocument();

        expect(
            screen.getByText("DOWN")
        ).toBeInTheDocument();

        expect(
            screen.getByText("120 ms")
        ).toBeInTheDocument();

        expect(
            screen.getByText("500 ms")
        ).toBeInTheDocument();
    });

    it("shows empty state when no URLs exist", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByText(
                "No URLs registered"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Add your first URL to start monitoring."
            )
        ).toBeInTheDocument();
    });

    it("shows error state when dashboard request fails", async () => {
        api.get.mockRejectedValue(
            new Error("Network error")
        );

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByTestId(
                "error-message"
            )
        ).toHaveTextContent(
            "Failed to load dashboard."
        );
    });

    it("renders navigation links for URLs", async () => {
        api.get.mockImplementation((url) => {
            if (url === "/view") {
                return Promise.resolve({
                    data: [
                        {
                            id: 1,
                            name: "Google",
                            url: "https://google.com",
                            enabled: true,
                        },
                    ],
                });
            }

            if (url === "/1/health/latest") {
                return Promise.resolve({
                    data: {
                        status: "UP",
                        responseTime: 120,
                    },
                });
            }

            return Promise.reject(
                new Error("Unexpected endpoint")
            );
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Google")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: "Manage URLs",
            })
        ).toHaveAttribute(
            "href",
            "/urls"
        );

        expect(
            screen.getByRole("link", {
                name: "Health",
            })
        ).toHaveAttribute(
            "href",
            "/urls/1/health"
        );

        expect(
            screen.getByRole("link", {
                name: "Edit",
            })
        ).toHaveAttribute(
            "href",
            "/urls/1/edit"
        );
    });
});