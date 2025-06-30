import PLACEHOLDER_IMG from '../assets/imgs/no-image.png';

export const getImageUrl = (picture) => {
  if (!picture) return PLACEHOLDER_IMG;  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';  
  if (picture.startsWith('/uploads/')) {
    return `${backendUrl}${picture}`;
  }  
  return picture;
};