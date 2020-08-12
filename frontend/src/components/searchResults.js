import React from 'react'
import Result from './result'

const SearchResults = ({ data, platform ,title }) => {
  return (
    <div className={`${platform}__container`}>
      <h3 className={`${platform}__title`}>{title}</h3>
      <ul className="results__container">
        {Object.entries(data).length && data[platform].map((item, i) => <li className="results__list-item" key={i}><Result item={item}/></li>) }
      </ul>
    </div>
  )
}

export default SearchResults
