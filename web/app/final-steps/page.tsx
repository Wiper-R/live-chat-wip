"use client";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/app/user-provider";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Loader } from "@/components/loader";
import axios from "axios";

function FinalStepsForm() {
  const { user, isLoading } = useUser();
  const form = useForm({
    values: useMemo(() => {
      return { name: user?.name || "", username: user?.username || "" };
    }, [user]),
  });
  if (isLoading) return <Loader />;
  // TODO: Fix this data type
  async function handleValidSubmit(data: any) {
    await axios.post("/api/users/finalize", data);
  }
  return (
    <Form {...form}>
      <form
        className="max-w-[600px] mx-auto w-full space-y-4"
        onSubmit={form.handleSubmit(handleValidSubmit)}
      >
        <h3 className="text-2xl font-semibold mb-8">Final Steps</h3>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <Input {...field} required />
            </FormItem>
          )}
        />
        <FormField
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <Input {...field} required />
            </FormItem>
          )}
        />
        <Button className="w-full">Get Started</Button>
      </form>
    </Form>
  );
}

export default function FinalSteps() {
  return (
    <MaxWidthWrapper className="flex h-screen items-center justify-center">
      <FinalStepsForm />
    </MaxWidthWrapper>
  );
}
