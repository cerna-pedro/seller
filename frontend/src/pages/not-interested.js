import React from "react"
import useFetch from "../hooks/useFetch"
import SearchResults from "../components/searchResults"
import Layout from "../components/layout"
import SEO from "../components/seo"

const SecondPage = () => {
  const data = useFetch("http://localhost:3000/listings/not-interested")
  return (
    <Layout>
      <SEO title="Not Interested" />
      <SearchResults platform="OfferUp" data={data} title='OfferUp' />
      <SearchResults platform="LetGo" data={data} title="letgo"/>
      <SearchResults platform="Facebook" data={data} title="Facebook"/>
    </Layout>
  )
}

export default SecondPage
