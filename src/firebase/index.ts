// Mock Firebase hooks for migration
export function useUser() {
  return { user: null, isLoading: false };
}
export function useAuth() {
    return { user: null };
}
export function useFirestore() {
  return {};
}
export function useMemoFirebase() {
    return {};
}
export function useDoc() {
    return [null, false, null];
}
