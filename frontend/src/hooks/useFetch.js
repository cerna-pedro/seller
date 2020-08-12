import  { useState, useEffect } from "react"

const useFetch = (url) => {
  const [data, setData] = useState({})
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data))
    const interval = setInterval(async () => {
      const data = await fetch(url).then(res =>
        res.json()
      )
      setData(data)
    }, 200)
    return () => {
      clearInterval(interval)
    }
  }, [url])
  return data
}

export default useFetch
