import { User } from "@repo/api-types";

export function UserUI(user: User) {
  return (
    <div className="flex gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-600" />
      <div className="flex flex-col">
        <span>{user.name}</span>
        <span className="text-sm text-gray-500">@{user.username}</span>
      </div>
    </div>
  );
}
