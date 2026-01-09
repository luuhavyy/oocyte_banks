export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getRoleFromToken = (token) => {
  const decoded = decodeJWT(token);
  return decoded?.role || null;
};


export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    userId: decoded.userId,
    role: decoded.role,
  };
};

