import { Link } from "gatsby"
import React from "react"

const Header = ({ siteTitle }) => (
  <header className="header">
    <nav className="nav">
      <ul className="nav__list">
        <li className="nav__list-item">
          <Link className="nav__list-item--link" to="/">
            Home
          </Link>
        </li>
        <li className="nav__list-item">
          <Link className="nav__list-item--link" to="/not-interested/">
            Not Interested
          </Link>
        </li>
      </ul>
    </nav>
  </header>
)

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
