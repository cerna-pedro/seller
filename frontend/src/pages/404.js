import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    <Link className="nav__list-item--link" to="/">
      Go Home
    </Link>
  </Layout>
)

export default NotFoundPage
