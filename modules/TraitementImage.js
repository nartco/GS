


export const getImageType = (fileFullPart) => {

  const fileExtension = fileFullPart.substring(fileFullPart.lastIndexOf('.') + 1).toLowerCase();

  const imageTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  };

  if (imageTypes.hasOwnProperty(fileExtension)) 
  {
    return imageTypes[fileExtension];
  } 

  return 'image/jpeg';
}