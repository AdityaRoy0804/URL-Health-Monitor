import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <NavLink
                    to="/"
                    className="navbar-brand"
                >
                    <span className="brand-icon">
                        U
                    </span>

                    <span>
                        URL Monitor
                    </span>
                </NavLink>

                <nav className="navbar-links">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/urls"
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        URLs
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;