import React from "react"
import SearchTerms from '../components/searchTerms'
import SearchResults from '../components/searchResults'
import useFetch from '../hooks/useFetch';
import Layout from "../components/layout"
import SEO from "../components/seo"
import AddNewSearch from '../components/addNewSearch.'

const IndexPage = () => {
  const data = useFetch("http://localhost:3000/listings")
  return (
  <Layout>
      <SEO title="Home" />
      <AddNewSearch/>
      <SearchTerms />
      <p>API calls occur every 3 minutes</p>
      <SearchResults platform='OfferUp' data={data} title="OfferUp"/>
      <SearchResults platform='LetGo' data={data} title="letgo"/>
      <SearchResults platform = 'Facebook' data={data} title="Facebook Marketplace"/>
  </Layout>
)}

export default IndexPage
