import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">URL Monitor</Link>

            <div>
                <Link to="/">Dashboard</Link>
                <Link to="/urls">URLs</Link>
            </div>
        </nav>
    );
}

export default Navbar;