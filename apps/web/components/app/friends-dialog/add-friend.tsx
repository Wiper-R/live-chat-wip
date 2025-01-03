import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { Relationship } from "@repo/api-types";
import { FormEvent, useState } from "react";
import { useMutation } from "react-query";

export function AddFriend() {
  const [relationship, setRelationship] = useState<Relationship>();
  const { mutateAsync } = useMutation({
    async mutationFn(username: string) {
      const res = await apiClient.post("/users/@me/relationships", {
        username,
      });
      return res.data as Relationship;
    },
    onSuccess(data) {
      setRelationship(data);
    },
  });

  const [search, setSearch] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await mutateAsync(search);
    setSearch("");
  }

  return (
    <>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <Input
          placeholder="Search by username eg. wiperr, sachin"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 flex-grow items-center"
        />
        <Button type="submit" className="w-full max-w-[100px]">
          Add
        </Button>
      </form>
      {relationship && (
        <span className="text-lime-500 text-sm">
          Friend request sent to @{relationship.Recipient.username} (
          {relationship.Recipient.name})
        </span>
      )}
    </>
  );
}
