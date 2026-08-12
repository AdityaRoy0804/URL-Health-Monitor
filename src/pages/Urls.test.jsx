import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Urls from "./Urls";
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

describe("Urls", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows loading state initially", () => {
        api.get.mockReturnValue(
            new Promise(() => {})
        );

        render(
            <MemoryRouter>
                <Urls />
            </MemoryRouter>
        );

        expect(
            screen.getByTestId("loading")
        ).toHaveTextContent("Loading URLs...");
    });

    it("renders URLs returned by the API", async () => {
        api.get.mockResolvedValue({
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

        render(
            <MemoryRouter>
                <Urls />
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
    });

    it("shows enabled and disabled status correctly", async () => {
        api.get.mockResolvedValue({
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

        render(
            <MemoryRouter>
                <Urls />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Google")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Enabled")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Disabled")
        ).toBeInTheDocument();
    });

    it("shows empty state when no URLs exist", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        render(
            <MemoryRouter>
                <Urls />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("No URLs registered")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Add your first URL to start monitoring it."
            )
        ).toBeInTheDocument();
    });

    it("shows error state when API request fails", async () => {
        api.get.mockRejectedValue(
            new Error("Network error")
        );

        render(
            <MemoryRouter>
                <Urls />
            </MemoryRouter>
        );

        expect(
            await screen.findByTestId("error-message")
        ).toHaveTextContent(
            "Failed to load URLs."
        );
    });

    it("calls the correct API endpoint", async () => {
        api.get.mockResolvedValue({
            data: [],
        });

        render(
            <MemoryRouter>
                <Urls />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                "/view"
            );
        });
    });
});