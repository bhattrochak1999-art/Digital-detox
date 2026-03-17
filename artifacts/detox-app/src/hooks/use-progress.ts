import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetProgress, 
  useSaveAnswer as useGeneratedSaveAnswer,
  useResetProgress as useGeneratedResetProgress,
  getGetProgressQueryKey
} from "@workspace/api-client-react";

export function useProgress() {
  return useGetProgress();
}

export function useSaveAnswer() {
  const queryClient = useQueryClient();
  return useGeneratedSaveAnswer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
      },
    }
  });
}

export function useResetProgress() {
  const queryClient = useQueryClient();
  return useGeneratedResetProgress({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
      },
    }
  });
}
