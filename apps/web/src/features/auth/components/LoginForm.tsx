'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useLogin } from '../hook';
import { LoginFormValues, loginSchema } from '../schema';

interface LoginFormProps {
  registeredSuccess?: boolean;
}

export function LoginForm({ registeredSuccess = false }: LoginFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-dismiss authentication error after 5 seconds
  useEffect(() => {
    if (!serverError) return;
    const timer = setTimeout(() => {
      setServerError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [serverError]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isSubmitting = loginMutation.isPending || form.formState.isSubmitting;

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      await loginMutation.mutateAsync(values);
      router.push('/dashboard');
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof LoginFormValues> = ['email', 'password'];
        for (const field of validFields) {
          const fieldMessages = apiError.errors[field];
          if (fieldMessages && fieldMessages.length > 0) {
            form.setError(field, {
              type: 'server',
              message: fieldMessages[0],
            });
          }
        }
      }

      setServerError(apiError.message);
    }
  };

  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your SprintHub workspaces
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {registeredSuccess && !serverError && (
          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Account created</AlertTitle>
            <AlertDescription>
              Your account is ready. Please log in with your email and password.
            </AlertDescription>
          </Alert>
        )}

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Authentication failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {loginMutation.isSuccess && (
          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Signed in successfully</AlertTitle>
            <AlertDescription>Redirecting to your dashboard...</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className="pr-9"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

