import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getDataFromToken() {
  try {
    const headerList = await headers();
    const bearerToken = headerList.get('authorization')?.split(' ')[1];

    // Check Authorization header first
    let token = bearerToken || '';

    // If no bearer token, check cookies
    if (!token) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const adminToken = cookieStore.get('admin_token')?.value;
      const userToken = cookieStore.get('token')?.value;
      
      console.log('AUTH DEBUG: admin_token present:', !!adminToken);
      console.log('AUTH DEBUG: token present:', !!userToken);
      
      token = adminToken || userToken || '';
    }

    if (!token) {
      console.log('AUTH DEBUG: No token found in headers or cookies at:', new Date().toISOString());
      return null;
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    console.log('AUTH SUCCESS: Token verified. User ID:', decodedToken?.id, 'Role:', decodedToken?.role);
    return decodedToken;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.log('AUTH INFO: Token expired');
    } else {
      console.error('AUTH ERROR: Token verification failed:', error.message);
    }
    return null;
  }
}
