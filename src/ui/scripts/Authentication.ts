import { useCookies } from 'react-cookie';
import { redirect } from 'react-router-dom';

export function getAuthenticationToken() {
  // const [userTokencookie, setUserTokencookie, removeUserTokencookie] = useCookies(['userToken']);
  const [userTokencookie] = useCookies(['userToken']);
  if (!userTokencookie) {
    return null;
  }

  return userTokencookie;
}

export function tokenLoader() {
  const token = getAuthenticationToken();
  return token;
}

export function checkAuthenticationLoader() {
  const token = getAuthenticationToken();

  if (!token) {
    return redirect('/');
  }
}
