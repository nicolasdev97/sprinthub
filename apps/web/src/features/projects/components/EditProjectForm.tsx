'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Archive, Loader2, Lock, Save } from 'lucide-react';
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
  Select,
  SelectOption,
  Textarea,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useUpdateProject } from '../hook';
import { UpdateProjectFormValues, updateProjectSchema } from '../schema';
import { Project } from '../types';

interface EditProjectFormProps {
  project: Project;
  canManage: boolean;
}

export function EditProjectForm({ project, canManage }: EditProjectFormProps) {
  const { toast } = useToast();
  const updateProjectMutation = useUpdateProject(project.workspaceId);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? '',
      status: project.status,
    },
  });

  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description ?? '',
      status: project.status,
    });
  }, [project.id, project.name, project.description, project.status, form]);

  const isSubmitting = updateProjectMutation.isPending || form.formState.isSubmitting;
  const isEditable = canManage && !project.archived;

  const onSubmit = async (values: UpdateProjectFormValues) => {
    if (!isEditable) return;
    setServerError(null);

    try {
      const updated = await updateProjectMutation.mutateAsync({
        projectId: project.id,
        data: {
          name: values.name,
          description: values.description?.trim() ? values.description.trim() : null,
          status: values.status,
        },
      });

      toast({
        title: 'Project updated',
        description: `Changes to "${updated.name}" have been saved.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof UpdateProjectFormValues> = ['name', 'description', 'status'];
        for (const field of validFields) {
          const messages = apiError.errors[field];
          if (messages && messages.length > 0) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        }
      }

      setServerError(apiError.message);
      toast({
        title: 'Failed to update project',
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
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update the project name, status, and description within this workspace.
            </CardDescription>
          </div>
          {!canManage && (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" />
              <span>Admin / Owner only</span>
            </div>
          )}
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {project.archived && (
              <Alert>
                <Archive className="size-4" />
                <AlertTitle>This project is archived</AlertTitle>
                <AlertDescription>
                  Archived projects are read-only. Unarchive this project below to edit its details
                  or status.
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Update failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* 1. Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Project name"
                      disabled={!isEditable || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the project goals and deliverables..."
                      rows={4}
                      disabled={!isEditable || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Maximum 1000 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Status</FormLabel>
                  <FormControl>
                    <Select disabled={!isEditable || isSubmitting} {...field}>
                      <SelectOption value="PLANNING">Planning</SelectOption>
                      <SelectOption value="ACTIVE">Active</SelectOption>
                      <SelectOption value="COMPLETED">Completed</SelectOption>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          {canManage && (
            <CardFooter className="mt-4 flex justify-end border-t border-border/60 pt-4">
              <Button
                type="submit"
                disabled={!isEditable || isSubmitting || !form.formState.isDirty}
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
