import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TextInput, TextInputProps, View, Platform, Text } from 'react-native';
import { colors } from '@/styles/colors';
import clsx from 'clsx';
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

const ErrorContext = createContext<{
  error: string | undefined;
  setError: (error: string | undefined) => void;
}>({ error: undefined, setError: () => {} });

export type Variant = 'primary' | 'secondary' | 'tertiary';

type InputProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

function Input({ children, className, variant = 'primary' }: InputProps) {
  const [error, setError] = useState<string | undefined>();

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <View className={className}>
        <View
          className={clsx('min-h-16 max-h-16 flex-row items-center gap-2', {
            'h-14 px-4 rounded-lg border border-zinc-800':
              variant !== 'primary',
            'bg-zinc-950': variant === 'secondary',
            'bg-zinc-900': variant === 'tertiary',
          })}
        >
          {children}
        </View>
        {error && <Text className="px-2 text-rose-600">{error}</Text>}
      </View>
    </ErrorContext.Provider>
  );
}

interface IFieldProps<T extends FieldValues = FieldValues>
  extends TextInputProps {
  name: FieldPath<T>;
  formRef: UseFormReturn<T, FieldValues>;
}

function Field<T extends FieldValues>({
  name,
  formRef,
  maxLength,
  onChangeText,
  ...props
}: IFieldProps<T>) {
  const { control, formState, getFieldState } = formRef;
  const { setError } = useContext(ErrorContext);

  useEffect(() => {
    const { error } = getFieldState(name);
    setError(error?.message);
  }, [formState.errors, getFieldState, name, setError]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur } }) => (
        <TextInput
          className="flex-1 text-zinc-100 text-lg font-regular"
          placeholderTextColor={colors.zinc[400]}
          cursorColor={colors.zinc[100]}
          maxLength={maxLength}
          selectionColor={Platform.OS === 'ios' ? colors.zinc[100] : undefined}
          onBlur={onBlur}
          onChangeText={(text) => {
            onChange({ target: { value: text } });
            if (onChangeText) onChangeText(text);
          }}
          {...props}
        />
      )}
    />
  );
}

Input.Field = Field;

export { Input };
