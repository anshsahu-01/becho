import { Text, TextInput, TextInputProps, View } from "react-native";
import { cn } from "@/utils/cn";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  inputClassName?: string;
};

export function Input({ label, error, className, inputClassName, ...props }: InputProps) {
  return (
    <View className={cn("mb-3", className)}>
      {label ? <Text className="mb-1 text-[13px] font-medium text-muted">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#999999"
        className={cn(
          "h-11 rounded-md border border-line bg-white px-3 text-[15px] text-ink",
          error && "border-danger",
          inputClassName
        )}
        {...props}
      />
      {error ? <Text className="mt-1 text-[13px] text-danger">{error}</Text> : null}
    </View>
  );
}
