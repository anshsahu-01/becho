import { Pressable, Text } from "react-native";
import { cn } from "@/utils/cn";

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full border border-line px-3 py-2",
        active && "border-ink bg-ink"
      )}
    >
      <Text
        className={cn(
          "text-sm text-muted",
          active && "font-semibold text-white"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
