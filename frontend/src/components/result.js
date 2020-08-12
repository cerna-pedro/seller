import React from "react"
import formatPrice from "../lib/formatPrice"
import moment from "moment"

const Result = ({ item }) => {
  // const handleSubmit = async (e, id) => {
  //   e.preventDefault()
  //   await fetch(`http://localhost:3000/listings/interested/${id}`, {
  //     method: "POST",
  //   })
  // }
  return (
    <div className="result-item__container">
      <div className="result__container">
        <img className="result__image" src={item.image} alt={item.itemName.charAt(0).toUpperCase() + item.itemName.slice(1)}/>
        <h5 className="result__title">Searched:</h5>
        <p>
          {item.searchTerm.charAt(0).toUpperCase() + item.searchTerm.slice(1)}
        </p>
        <h5 className="result__title">Got:</h5>
        <p>{item.itemName.charAt(0).toUpperCase() + item.itemName.slice(1)}</p>
        <p>{formatPrice(item.price)}</p>
        <p>{item.description.split(' ').length >=40? item.description.split(' ').filter((word,i)=>i<40).join(' ')+' ...': item.description}</p>
        <time className="result__postdate">
          {item.postDate !== "N/A"
            ? `Posted ${moment(item.postDate).fromNow()}`
            : "Post Date N/A"}
        </time>
        <p>
          <a
            className="result__link"
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Check out Item
          </a>
        </p>
      </div>
      <form
        className="result__form"
        action={`http://localhost:3000/listings/interested/${item.id}`}
        method="post"
        // onSubmit={e => handleSubmit(e, item.id)}
      >
        <button type="submit">
          {item.interested ? "I'm Not Interested" : "I'm Interested"}
        </button>
      </form>
    </div>
  )
}

export default Result
