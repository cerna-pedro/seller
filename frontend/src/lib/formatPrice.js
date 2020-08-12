const formatPrice = (price) => {
  const dollars = Math.trunc(price / 100);
  return `$${dollars}`
}

export default formatPrice