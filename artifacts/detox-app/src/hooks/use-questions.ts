import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetQuestions, 
  useCreateQuestion as useGeneratedCreateQuestion,
  useUpdateQuestion as useGeneratedUpdateQuestion,
  useDeleteQuestion as useGeneratedDeleteQuestion,
  getGetQuestionsQueryKey
} from "@workspace/api-client-react";

export function useQuestions() {
  return useGetQuestions();
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useGeneratedCreateQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuestionsQueryKey() });
      },
    }
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuestionsQueryKey() });
      },
    }
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useGeneratedDeleteQuestion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetQuestionsQueryKey() });
      },
    }
  });
}
