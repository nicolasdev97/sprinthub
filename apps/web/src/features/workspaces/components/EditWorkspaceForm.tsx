'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Lock, Save } from 'lucide-react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useUpdateWorkspace } from '../hook';
import { UpdateWorkspaceFormValues, updateWorkspaceSchema } from '../schema';
import { Workspace } from '../types';

interface EditWorkspaceFormProps {
  workspace: Workspace;
  canEdit: boolean;
}

export function EditWorkspaceForm({ workspace, canEdit }: EditWorkspaceFormProps) {
  const { toast } = useToast();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateWorkspaceFormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      name: workspace.name,
      description: workspace.description ?? '',
    });
  }, [workspace.id, workspace.name, workspace.description, form]);

  const isSubmitting = updateWorkspaceMutation.isPending || form.formState.isSubmitting;

  const onSubmit = async (values: UpdateWorkspaceFormValues) => {
    if (!canEdit) return;
    setServerError(null);

    try {
      const updated = await updateWorkspaceMutation.mutateAsync({
        workspaceId: workspace.id,
        data: {
          name: values.name,
          description: values.description?.trim() ? values.description.trim() : null,
        },
      });

      toast({
        title: 'Workspace updated',
        description: `Changes to "${updated.name}" have been saved.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof UpdateWorkspaceFormValues> = ['name', 'description'];
        for (const field of validFields) {
          const messages = apiError.errors[field];
          if (messages && messages.length > 0) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        }
      }

      setServerError(apiError.message);
      toast({
        title: 'Failed to update workspace',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your workspace name and description visible to all members.
            </CardDescription>
          </div>
          {!canEdit && (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" />
              <span>Owner only</span>
            </div>
          )}
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Update failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Workspace name"
                      disabled={!canEdit || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 100 characters. Must be unique across SprintHub.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this workspace..."
                      rows={3}
                      disabled={!canEdit || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Maximum 500 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          {canEdit && (
            <CardFooter className="mt-4 flex justify-end border-t border-border/60 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}

