import React from "react"
import Header from "./header"
import "./layout.css"

const Layout = ({ children }) => {
  return (
    <>
      <div className="container">
        <Header siteTitle="Money Maker" />
        <main className="container__main">
          <h1 className="container__main-title">
            Money Maker
            <span role="img" aria-label="Money bag">
              💰
            </span>
          </h1>
          {children}
        </main>
      </div>
    </>
  )
}

export default Layout
