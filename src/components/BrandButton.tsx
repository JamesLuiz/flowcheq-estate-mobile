import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, commonStyles } from '../lib/theme';

type Variant = 'primary' | 'secondary' | 'outline';

interface BrandButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

export function BrandButton({
  label,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: BrandButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={(state) => [
        commonStyles.btn,
        variant === 'primary' && commonStyles.btnPrimary,
        variant === 'secondary' && commonStyles.btnSecondary,
        variant === 'outline' && commonStyles.btnOutline,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && commonStyles.btnDisabled,
        resolvePressableStyle(style, state),
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.primaryForeground} />
      ) : (
        <Text
          style={
            variant === 'primary'
              ? commonStyles.btnText
              : variant === 'outline'
                ? commonStyles.btnTextOutline
                : commonStyles.btnTextSecondary
          }
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
});

function resolvePressableStyle(
  style: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>) | undefined,
  state: PressableStateCallbackType,
): StyleProp<ViewStyle> {
  return typeof style === 'function' ? style(state) : style;
}
