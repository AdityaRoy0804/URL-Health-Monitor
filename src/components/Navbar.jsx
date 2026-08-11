import { NavLink, Link } from "react-router-dom";

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <Link
                    to="/"
                    className="navbar-brand"
                >
                    <span className="brand-icon">
                        U
                    </span>

                    <span>
                        URL Monitor
                    </span>
                </Link>

                <nav className="navbar-links">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/urls"
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        URLs
                    </NavLink>
                </nav>

                <Link
                    to="/urls/new"
                    className="btn btn-primary"
                >
                    + Add URL
                </Link>
            </div>
        </header>
    );
}

export default Navbar;