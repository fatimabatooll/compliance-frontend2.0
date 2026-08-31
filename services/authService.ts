import { apiService } from "@/services/apiService";

export type AuthRole = "admin" | "consultant";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type LoginInput = {
  email: string;
  password: string;
  role: AuthRole;
};

type ForgetPasswordInput = {
  email: string;
  newPassword: string;
  confirmPassword?: string;
  role: AuthRole;
};

type ApiLoginResponse = {
  status?: number;
  data?: {
    token?: string;
    id?: string;
    userName?: string;
    email?: string;
  };
  message?: string;
};

type ApiForgetPasswordResponse = {
  message?: string;
  data?: {
    id?: string | number;
    userName?: string;
    email?: string;
    createdAt?: string;
  };
};

type UpdateProfileInput = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type ChangePasswordInput = {
  email: string;
  newPassword: string;
  confirmPassword?: string;
  role: AuthRole;
};

type ApiUpdateProfileResponse = {
  message?: string;
  data?: {
    id?: string | number;
    userName?: string;
    email?: string;
  };
};

const STORAGE_KEYS = {
  token: "accessToken",
  id: "id",
  name: "name",
  email: "email",
  role: "role",
};

const isBrowser = () => typeof window !== "undefined";

const clearAuthStorage = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.id);
  localStorage.removeItem(STORAGE_KEYS.name);
  localStorage.removeItem(STORAGE_KEYS.email);
  localStorage.removeItem(STORAGE_KEYS.role);
};

const saveAuthStorage = (token: string, user: AuthUser) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.id, user.id);
  localStorage.setItem(STORAGE_KEYS.name, user.name);
  localStorage.setItem(STORAGE_KEYS.email, user.email);
  localStorage.setItem(STORAGE_KEYS.role, user.role);
};

const updateUserStorage = (user: Pick<AuthUser, "name" | "email">) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.name, user.name);
  localStorage.setItem(STORAGE_KEYS.email, user.email);
};

class AuthService {
  async login({ email, password, role }: LoginInput) {
    const endpoint = role === "admin" ? "/auth/signin" : "/consultant/signin";
    const response = await apiService.post<ApiLoginResponse>(endpoint, {
      email,
      password,
    });

    const token = response?.data?.token;
    const id = response?.data?.id;
    const name = response?.data?.userName;
    const userEmail = response?.data?.email;

    if (!token || !id || !name || !userEmail) {
      throw new Error(response?.message || "Invalid login response.");
    }

    const user: AuthUser = { id, name, email: userEmail, role };
    saveAuthStorage(token, user);
    return { token, user };
  }

  async forgetPassword({
    email,
    newPassword,
    confirmPassword,
    role,
  }: ForgetPasswordInput) {
    const endpoint =
      role === "admin"
        ? "/auth/forget-password"
        : "/consultant/forget-password";

    return apiService.post<ApiForgetPasswordResponse>(endpoint, {
      email,
      newPassword,
      confirmPassword,
    });
  }

  // NOTE: `/auth/:id` and `/consultant/:id` are the assumed update-profile
  // endpoints, mirroring the existing signin/forget-password naming. Confirm
  // the exact path + method with the backend team and adjust here if needed.
  async updateProfile(
    { id, name, email, role }: UpdateProfileInput,
    token?: string | null,
  ) {
    const endpoint = role === "admin" ? `/auth/${id}` : `/consultant/${id}`;
    const response = await apiService.patch<ApiUpdateProfileResponse>(
      endpoint,
      { userName: name, email },
      token,
    );

    const updated: AuthUser = {
      id,
      name: response?.data?.userName || name,
      email: response?.data?.email || email,
      role,
    };
    updateUserStorage(updated);
    return updated;
  }

  async changePassword({
    email,
    newPassword,
    confirmPassword,
    role,
  }: ChangePasswordInput) {
    // Reuses the existing forget-password endpoint, which already supports
    // setting a new password by email without requiring the current one.
    const endpoint =
      role === "admin"
        ? "/auth/forget-password"
        : "/consultant/forget-password";

    return apiService.post<ApiForgetPasswordResponse>(endpoint, {
      email,
      newPassword,
      confirmPassword,
    });
  }

  logout() {
    clearAuthStorage();
  }

  getSession() {
    if (!isBrowser()) return null;

    const token = localStorage.getItem(STORAGE_KEYS.token);
    const id = localStorage.getItem(STORAGE_KEYS.id);
    const name = localStorage.getItem(STORAGE_KEYS.name);
    const email = localStorage.getItem(STORAGE_KEYS.email);
    const role = localStorage.getItem(STORAGE_KEYS.role) as AuthRole | null;

    if (!token || !id || !name || !email || !role) return null;
    if (role !== "admin" && role !== "consultant") return null;

    return {
      token,
      user: { id, name, email, role } as AuthUser,
    };
  }
}

const authService = new AuthService();
export default authService;
