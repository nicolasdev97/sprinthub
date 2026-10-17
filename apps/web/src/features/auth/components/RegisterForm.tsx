'use client';

import { useState } from 'react';
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

import { useLogin, useRegister } from '../hook';
import { RegisterFormValues, registerSchema } from '../schema';

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isSubmitting =
    registerMutation.isPending || loginMutation.isPending || form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      await registerMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });

      try {
        await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        router.push('/dashboard');
      } catch {
        router.push('/login?registered=true');
      }
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof RegisterFormValues> = [
          'firstName',
          'lastName',
          'email',
          'password',
        ];
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
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>
          Get started with SprintHub to manage workspaces, projects, and tasks
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {registerMutation.isSuccess && (
          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Account created</AlertTitle>
            <AlertDescription>
              Setting up your session and redirecting...
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jane"
                        autoComplete="given-name"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        autoComplete="family-name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jane.doe@company.com"
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
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
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="pr-9"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password confirmation'
                          : 'Show password confirmation'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
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
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

