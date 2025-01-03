"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { FieldValues, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import queryKeyFactory from "@/lib/query-key-factory";
import { User } from "@repo/api-types";
import { useUser } from "@/contexts/app/user-provider";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader } from "@/components/loader";
import Link from "next/link";

export default function Page() {
  const { user, isLoading } = useUser();
  const form = useForm();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    async mutationFn(values: FieldValues) {
      const res = await apiClient.post("/signin", values);
      return res.data as User;
    },
    onSuccess(data) {
      router.push("/app");
      queryClient.setQueryData(queryKeyFactory.users.current(), data);
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync(values);
  }

  useEffect(() => {
    if (user) router.push("/app");
  }, [user]);

  if (isLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="max-w-[400px] w-full">
        <CardHeader>Login</CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                Login
              </Button>
              <FormDescription>
                {"Don't have an account?"}{" "}
                <Link
                  className={buttonVariants({
                    variant: "link",
                    className: "px-0.5",
                  })}
                  href={"/signup"}
                >
                  click here
                </Link>{" "}
                to sign up
              </FormDescription>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
