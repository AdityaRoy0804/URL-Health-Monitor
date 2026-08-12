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
    waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
    MemoryRouter,
    useNavigate,
    useParams,
} from "react-router-dom";

import EditUrl from "./EditUrl";
import api from "../services/api";

vi.mock("../services/api", () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    },
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    };
});

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

describe("EditUrl", () => {
    const navigate = vi.fn();

    const existingUrl = {
        id: 1,
        name: "Google",
        url: "https://google.com",
        enabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useNavigate.mockReturnValue(navigate);

        useParams.mockReturnValue({
            id: "1",
        });
    });

    const renderEditUrl = () => {
        return render(
            <MemoryRouter>
                <EditUrl />
            </MemoryRouter>
        );
    };

    it("shows loading state while fetching URL", () => {
        api.get.mockReturnValue(
            new Promise(() => {})
        );

        renderEditUrl();

        expect(
            screen.getByTestId("loading")
        ).toHaveTextContent(
            "Loading URL..."
        );

        expect(api.get).toHaveBeenCalledWith(
            "/view/1"
        );
    });

    it("loads and displays existing URL data", async () => {
        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        expect(
            await screen.findByDisplayValue(
                "Google"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByDisplayValue(
                "https://google.com"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("checkbox")
        ).toBeChecked();
    });

    it("fetches the correct URL using the route id", async () => {
        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                "/view/1"
            );
        });
    });

    it("allows the user to edit the URL details", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        const nameInput =
            await screen.findByDisplayValue(
                "Google"
            );

        const urlInput =
            screen.getByDisplayValue(
                "https://google.com"
            );

        await user.clear(nameInput);
        await user.type(
            nameInput,
            "Google Search"
        );

        await user.clear(urlInput);
        await user.type(
            urlInput,
            "https://www.google.com"
        );

        expect(nameInput).toHaveValue(
            "Google Search"
        );

        expect(urlInput).toHaveValue(
            "https://www.google.com"
        );
    });

    it("allows monitoring to be disabled", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        const checkbox =
            await screen.findByRole(
                "checkbox"
            );

        expect(checkbox).toBeChecked();

        await user.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });

    it("updates the URL with the correct API request", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        api.put.mockResolvedValue({
            data: {
                ...existingUrl,
                name: "Google Search",
                url: "https://www.google.com",
                enabled: false,
            },
        });

        renderEditUrl();

        const nameInput =
            await screen.findByDisplayValue(
                "Google"
            );

        const urlInput =
            screen.getByDisplayValue(
                "https://google.com"
            );

        const checkbox =
            screen.getByRole("checkbox");

        await user.clear(nameInput);
        await user.type(
            nameInput,
            "Google Search"
        );

        await user.clear(urlInput);
        await user.type(
            urlInput,
            "https://www.google.com"
        );

        await user.click(checkbox);

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(
                "/edit/1",
                {
                    name: "Google Search",
                    url: "https://www.google.com",
                    enabled: false,
                }
            );
        });
    });

    it("navigates to URLs after successful update", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        api.put.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(
                "/urls"
            );
        });
    });

    it("shows Saving while update is in progress", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        let resolveUpdate;

        api.put.mockReturnValue(
            new Promise((resolve) => {
                resolveUpdate = resolve;
            })
        );

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Saving...",
            })
        ).toBeDisabled();

        resolveUpdate({
            data: existingUrl,
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(
                "/urls"
            );
        });
    });

    it("shows API error when update fails", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        api.put.mockRejectedValue({
            response: {
                data: {
                    message:
                        "URL already exists.",
                },
            },
        });

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "URL already exists."
            )
        ).toBeInTheDocument();

        expect(navigate).not.toHaveBeenCalled();
    });

    it("shows default error when update fails without a message", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        api.put.mockRejectedValue(
            new Error("Network error")
        );

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Save Changes",
            })
        );

        expect(
            await screen.findByText(
                "Failed to update URL."
            )
        ).toBeInTheDocument();

        expect(navigate).not.toHaveBeenCalled();
    });

    it("navigates back to URLs when Cancel is clicked", async () => {
        const user = userEvent.setup();

        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        await user.click(
            screen.getByRole("link", {
                name: "Cancel",
            })
        );

        expect(
            screen.getByRole("link", {
                name: "Cancel",
            })
        ).toHaveAttribute(
            "href",
            "/urls"
        );
    });

    it("navigates back to URLs using the header link", async () => {
        api.get.mockResolvedValue({
            data: existingUrl,
        });

        renderEditUrl();

        await screen.findByDisplayValue(
            "Google"
        );

        expect(
            screen.getByRole("link", {
                name: "Back to URLs",
            })
        ).toHaveAttribute(
            "href",
            "/urls"
        );
    });

    it("shows error state when the initial fetch fails", async () => {
        api.get.mockRejectedValue(
            new Error("Network error")
        );

        renderEditUrl();

        expect(
            await screen.findByTestId(
                "error-message"
            )
        ).toHaveTextContent(
            "Failed to load URL."
        );
    });

    it("can retry after the initial fetch fails", async () => {
        const user = userEvent.setup();

        api.get
            .mockRejectedValueOnce(
                new Error("Network error")
            )
            .mockResolvedValueOnce({
                data: existingUrl,
            });

        renderEditUrl();

        expect(
            await screen.findByTestId(
                "error-message"
            )
        ).toHaveTextContent(
            "Failed to load URL."
        );

        await user.click(
            screen.getByRole("button", {
                name: "Retry",
            })
        );

        expect(
            await screen.findByDisplayValue(
                "Google"
            )
        ).toBeInTheDocument();

        expect(api.get).toHaveBeenCalledTimes(2);
    });
});