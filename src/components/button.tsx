import clsx from 'clsx';
import { createContext, useContext } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  TextProps,
  ActivityIndicator,
} from 'react-native';

type Variant = 'primary' | 'secondary';

const ButtonContext = createContext<{ variant?: Variant }>({});

type ButtonProps = TouchableOpacityProps & {
  variant?: Variant;
  isLoading?: boolean;
  className?: string;
};

function Button({
  variant = 'primary',
  isLoading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={clsx(
        'h-11 flex-row items-center justify-center rounded-lg gap-2 px-2',
        {
          'bg-lime-300': variant === 'primary',
          'bg-zinc-800': variant === 'secondary',
        },
        className,
      )}
      activeOpacity={0.7}
      disabled={isLoading}
      {...props}
    >
      <ButtonContext.Provider value={{ variant }}>
        {isLoading ? <ActivityIndicator className="text-lime-950" /> : children}
      </ButtonContext.Provider>
    </TouchableOpacity>
  );
}

function Title({ children }: TextProps) {
  const { variant } = useContext(ButtonContext);

  return (
    <Text
      className={clsx('text-base font-semibold', {
        'text-lime-950': variant === 'primary',
        'text-zinc-200': variant === 'secondary',
      })}
    >
      {children}
    </Text>
  );
}

Button.Title = Title;

export { Button };
