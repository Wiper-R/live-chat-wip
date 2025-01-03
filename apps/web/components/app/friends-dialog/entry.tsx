import { PropsWithChildren } from "react";

export function Entry({ children }: PropsWithChildren) {
  return (
    <div
      className="p-2 flex gap-2 items-center bg-background rounded-lg focus:ring-1 ring-ring outline-none border-none"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
