import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetSettings, 
  useUpdateSettings as useGeneratedUpdateSettings,
  getGetSettingsQueryKey
} from "@workspace/api-client-react";

export function useSettings() {
  return useGetSettings();
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useGeneratedUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
    }
  });
}
