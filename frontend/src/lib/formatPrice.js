const formatPrice = (price) => {
  const dollars = Math.floor(price / 100);
  return `$${dollars}`
}

export default formatPrice