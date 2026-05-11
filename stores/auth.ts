import type { Menu } from "~/types/menu";
import type { People } from "~/types/people";

// stores/auth.ts
export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref<string | null>(null);
  const idToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const profile = ref<any>(null);
  const expiresAt = ref<number | null>(null);
  const scope = ref<string>("");
  const user_data = ref<People | null>(null);
  const menu = ref<Menu[]>([]);
  const jwtToken = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => {
    console.log("access token", accessToken.value);
    if (!accessToken.value || !expiresAt.value) {
      return false;
    }

    // Check jika token sudah expired
    const now = Math.floor(Date.now() / 1000);
    return expiresAt.value > now;
  });

  const tokenExpiresIn = computed(() => {
    if (!expiresAt.value) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, expiresAt.value - now);
  });

  const isTokenExpired = computed(() => tokenExpiresIn.value === 0);

  const userInfo = computed(() => profile.value);

  const setMenu = (data: Menu[]) => {
    if (process.client) {
      menu.value = data;
      localStorage.setItem("menu", JSON.stringify(data));
    }
  };
  const setUserData = (data: People) => {
    if (process.client) {
      user_data.value = data;
      localStorage.setItem("user_data", JSON.stringify(data));
    }
  };

  // Actions
  const setAuthData = (data: {
    access_token: string;
    id_token: string;
    expires_at: number;
    profile: any;
    scope: string;
    refresh_token?: string;
  }) => {
    accessToken.value = data.access_token;
    idToken.value = data.id_token;
    expiresAt.value = data.expires_at;
    profile.value = data.profile;
    scope.value = data.scope;
    refreshToken.value = data.refresh_token || null;

    // Simpan ke localStorage atau cookie
    localStorage.setItem(
      "auth_data",
      JSON.stringify({
        access_token: data.access_token,
        id_token: data.id_token,
        expires_at: data.expires_at,
        profile: data.profile,
        scope: data.scope,
        refresh_token: data.refresh_token,
      })
    );
  };

  const clearAuth = () => {
    accessToken.value = null;
    idToken.value = null;
    refreshToken.value = null;
    profile.value = null;
    expiresAt.value = null;
    scope.value = "";
    menu.value = [];
    user_data.value = null;

    if (process.client) {
      localStorage.removeItem("auth_data");
      localStorage.removeItem("menu");
      localStorage.removeItem("user_data");
    }
  };

  const loadFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem("auth_data");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          console.log("stored data", data);
          setAuthData(data);
        } catch (error) {
          console.error("Failed to load auth data from storage:", error);
          clearAuth();
        }
      }
    }
  };

  const checkTokenExpiry = async (): Promise<boolean> => {
    if (!isAuthenticated.value) {
      return false;
    }

    // Jika token hampir expired (kurang dari 5 menit), try refresh
    if (tokenExpiresIn.value < 300) {
      // 5 minutes
      return await tryRefreshToken();
    }

    return true;
  };

  const tryRefreshToken = async (): Promise<boolean> => {
    // Implement token refresh logic jika ada refresh_token
    if (!refreshToken.value) {
      clearAuth();
      return false;
    }

    try {
      const { $api } = useNuxtApp();
      const response = await $api.post("/auth/refresh", {
        refresh_token: refreshToken.value,
      });

      setAuthData(response.data);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuth();
      return false;
    }
  };

  // Initialize dari storage
  if (process.client) {
    loadFromStorage();
  }

  return {
    // State
    accessToken,
    idToken,
    refreshToken,
    profile,
    expiresAt,
    scope,

    // Getters
    isAuthenticated,
    tokenExpiresIn,
    isTokenExpired,
    userInfo,

    // Actions
    setAuthData,
    clearAuth,
    loadFromStorage,
    checkTokenExpiry,
    tryRefreshToken,
    setUserData,
    setMenu,
  };
});
