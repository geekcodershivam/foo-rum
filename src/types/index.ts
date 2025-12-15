export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: any;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  name: string;
}
