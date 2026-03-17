import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetLockState, 
  useSetLockState as useGeneratedSetLockState,
  getGetLockStateQueryKey
} from "@workspace/api-client-react";

export function useLockState() {
  return useGetLockState({
    query: {
      refetchInterval: 5000, // Poll every 5s to keep lock state in sync
    }
  });
}

export function useSetLockState() {
  const queryClient = useQueryClient();
  return useGeneratedSetLockState({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLockStateQueryKey() });
      },
    }
  });
}
