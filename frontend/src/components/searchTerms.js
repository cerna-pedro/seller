import React from "react"
import useFetch from "../hooks/useFetch"

const SearchTerms = () => {
  const data = useFetch("http://localhost:3000/listings")
  const onSubmit = async (e, word) => {
    e.preventDefault()
    await fetch(`http://localhost:3000/listings/remove/${word}`, {
      method: "POST",
    })
  }
  let searchTerms = []
  if (Object.entries(data).length) {
    searchTerms = data.searchTerms
  }
  return (
    <div className="search-terms-container">
      <h2 className="search-terms-container__title">
        Currently Searching for {searchTerms.length ? searchTerms.length : ""}{" "}
        {searchTerms.length ? (searchTerms.length < 2 ? "item" : "items") : ""}:
      </h2>
      <ul className="search-terms-container__list">
        {searchTerms.map((search,i) => {
          return (
            <div key={i} className="search-terms-container__search-box">
              <li className="search-terms-container__list-item">
                {search.name.toUpperCase()}
              </li>
              <form
                className="search-terms-container__form"
                action={`http://localhost:3000/listings/remove/${search.name}`}
                method="post"
                onSubmit={e => onSubmit(e, search.name)}
              >
                <button type="submit">Remove</button>
              </form>
            </div>
          )
        })}
      </ul>
    </div>
  )
}

export default SearchTerms
