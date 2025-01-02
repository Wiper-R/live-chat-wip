"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldValues, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function Page() {
  const form = useForm();
  const router = useRouter();
  const { mutateAsync } = useMutation({
    async mutationFn(values: FieldValues) {
      await apiClient.post("/signup", values);
      return {};
    },

    onSuccess() {
      router.push("/signin");
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync(values);
  }
  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="max-w-[300px] w-full">
        <CardHeader>Sign Up</CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign-up
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
