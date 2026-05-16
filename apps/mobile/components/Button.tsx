import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";
import { cn } from "@/utils/cn";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  className,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={cn(
        "h-11 items-center justify-center rounded-md px-4",
        variant === "primary" && "bg-ink",
        variant === "secondary" && "bg-canvas",
        variant === "outline" && "border border-line bg-white",
        isDisabled && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#1A1A1A" : "#FFFFFF"} />
      ) : (
        <Text
          className={cn(
            "text-[15px] font-semibold",
            variant === "primary" && "text-white",
            variant !== "primary" && "text-ink"
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
