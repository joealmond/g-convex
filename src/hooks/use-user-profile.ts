// Mock useUserProfile hook
export function useUserProfile(_userId?: string) {
  return {
    profile: null,
    loading: false,
    error: null,
    updateProfile: async (data: any) => console.log("Mock updateProfile", data)
  };
}
