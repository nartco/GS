


export function getEnglishDateFormat(dateString)
{
  if (!dateString)
  {
    return dateString;
  }

  let arr = dateString.split('/');

  return `${arr[1]}/${arr[0]}/${arr[2]}`;
}

export function formatEuroPrice(price, language)
{
  if ('en' == language){
    return '€ ' + price;
  }

  return price + ' €';
}
