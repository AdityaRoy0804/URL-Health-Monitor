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
} from "react-router-dom";

import AddUrl from "./AddUrl";
import api from "../services/api";

vi.mock("../services/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual(
        "react-router-dom"
    );

    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe("AddUrl", () => {
    const navigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useNavigate.mockReturnValue(navigate);
    });

    const renderAddUrl = () => {
        return render(
            <MemoryRouter>
                <AddUrl />
            </MemoryRouter>
        );
    };

    it("renders the Add URL form", () => {
        renderAddUrl();

        expect(
            screen.getByRole("heading", {
                name: "Add URL",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Name")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("URL")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("checkbox")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create URL",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeInTheDocument();
    });

    it("has monitoring enabled by default", () => {
        renderAddUrl();

        expect(
            screen.getByRole("checkbox")
        ).toBeChecked();
    });

    it("allows the user to enter URL details", async () => {
        const user = userEvent.setup();

        renderAddUrl();

        const nameInput =
            screen.getByLabelText("Name");

        const urlInput =
            screen.getByLabelText("URL");

        await user.type(
            nameInput,
            "Google"
        );

        await user.type(
            urlInput,
            "https://google.com"
        );

        expect(nameInput).toHaveValue(
            "Google"
        );

        expect(urlInput).toHaveValue(
            "https://google.com"
        );
    });

    it("allows monitoring to be disabled", async () => {
        const user = userEvent.setup();

        renderAddUrl();

        const checkbox =
            screen.getByRole("checkbox");

        expect(checkbox).toBeChecked();

        await user.click(checkbox);

        expect(checkbox).not.toBeChecked();
    });

    it("creates a URL with the correct API request", async () => {
        const user = userEvent.setup();

        api.post.mockResolvedValue({
            data: {
                id: 1,
                name: "Google",
                url: "https://google.com",
                enabled: true,
            },
        });

        renderAddUrl();

        await user.type(
            screen.getByLabelText("Name"),
            "Google"
        );

        await user.type(
            screen.getByLabelText("URL"),
            "https://google.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create URL",
            })
        );

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(
                "/new",
                {
                    name: "Google",
                    url: "https://google.com",
                    enabled: true,
                }
            );
        });
    });

    it("navigates to URLs after successful creation", async () => {
        const user = userEvent.setup();

        api.post.mockResolvedValue({
            data: {
                id: 1,
            },
        });

        renderAddUrl();

        await user.type(
            screen.getByLabelText("Name"),
            "Google"
        );

        await user.type(
            screen.getByLabelText("URL"),
            "https://google.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create URL",
            })
        );

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(
                "/urls"
            );
        });
    });

    it("shows Creating while the request is in progress", async () => {
        const user = userEvent.setup();

        let resolveRequest;

        api.post.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderAddUrl();

        await user.type(
            screen.getByLabelText("Name"),
            "Google"
        );

        await user.type(
            screen.getByLabelText("URL"),
            "https://google.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create URL",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Creating...",
            })
        ).toBeDisabled();

        expect(
            screen.getByRole("button", {
                name: "Cancel",
            })
        ).toBeDisabled();

        resolveRequest({
            data: {
                id: 1,
            },
        });

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(
                "/urls"
            );
        });
    });

    it("shows API error message when creation fails", async () => {
        const user = userEvent.setup();

        api.post.mockRejectedValue({
            response: {
                data: {
                    message:
                        "URL already exists.",
                },
            },
        });

        renderAddUrl();

        await user.type(
            screen.getByLabelText("Name"),
            "Google"
        );

        await user.type(
            screen.getByLabelText("URL"),
            "https://google.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create URL",
            })
        );

        expect(
            await screen.findByText(
                "URL already exists."
            )
        ).toBeInTheDocument();

        expect(navigate).not.toHaveBeenCalled();
    });

    it("shows default error message when API error has no message", async () => {
        const user = userEvent.setup();

        api.post.mockRejectedValue(
            new Error("Network error")
        );

        renderAddUrl();

        await user.type(
            screen.getByLabelText("Name"),
            "Google"
        );

        await user.type(
            screen.getByLabelText("URL"),
            "https://google.com"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Create URL",
            })
        );

        expect(
            await screen.findByText(
                "Failed to create URL."
            )
        ).toBeInTheDocument();

        expect(navigate).not.toHaveBeenCalled();
    });

    it("navigates to URLs when Cancel is clicked", async () => {
        const user = userEvent.setup();

        renderAddUrl();

        await user.click(
            screen.getByRole("button", {
                name: "Cancel",
            })
        );

        expect(navigate).toHaveBeenCalledWith(
            "/urls"
        );
    });
});