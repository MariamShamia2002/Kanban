//  Auth 
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }