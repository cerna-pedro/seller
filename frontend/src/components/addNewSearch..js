import React, { useState, useEffect } from "react"

const AddNewSearch = () => {
  const [lat, setLat] = useState(29.8323)
  const [lng, setLng] = useState(-95.736)
  const [name, setName] = useState("")
  const reset = async e => {
    e.preventDefault()
    await fetch("http://localhost:3000/listings/reset/", {
      method: "POST",
    })
  }
  const onSubmit = async e => {
    setName("")
    e.preventDefault()
    await fetch("http://localhost:3000/listings/add/", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, lat, lng }),
    })
  }

  useEffect(() => {
    if (navigator.geolocation) {
      const showLocation = position => {
        const { latitude, longitude } = position.coords
        // setLat(latitude.toFixed(8))
        // setLng(longitude.toFixed(8))
        setLat(latitude)
        setLng(longitude)
      }
      navigator.geolocation.getCurrentPosition(showLocation)
    }
  }, [])
  return (
    <div className="form-container">
      <form
        className="form-container__form-one"
        action="http://localhost:3000/listings/add/"
        method="POST"
        onSubmit={onSubmit}
      >
        <label htmlFor="name">Search For:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <label htmlFor="lat">Latitude:</label>
        <input
          type="number"
          name="lat"
          id="lat"
          value={lat}
          onChange={e => {
            setLat(e.target.value)
          }}
        />
        <label htmlFor="lng">Longitude:</label>
        <input
          type="number"
          name="lng"
          id="lng"
          value={lng}
          onChange={e => setLng(e.target.value)}
        />
        <button type="submit">Add To Search</button>
      </form>
      <form
        className="form-container__form-two"
        action="http://localhost:3000/listings/reset/"
        method="post"
        onSubmit={reset}
      >
        <button type="submit">Reset</button>
      </form>
    </div>
  )
}

export default AddNewSearch
