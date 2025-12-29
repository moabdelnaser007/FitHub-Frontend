export interface ResponseViewModel<T> {
  data?: T | null;
  isSuccess?: boolean;
  message?: string;
  errorCode?: string | number;

  // PascalCase alternatives for robustness
  Data?: T | null;
  IsSuccess?: boolean;
  Message?: string;
  ErrorCode?: string | number;
}

export interface RegisterUserDto {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterBusinessDto {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  commercialRegistrationNumber: string;
  password: string;
  confirmPassword: string;
}

export interface UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  role: string;
  status: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenResponseDto {
  token: string;
}

// إضافة: User data مع التوكن (للتخزين الكامل)
export interface AuthUserData {
  user: UserResponseDto;
  token: string;
}
