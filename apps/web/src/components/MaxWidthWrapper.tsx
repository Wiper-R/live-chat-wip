import { cn } from "@/src/lib/utils";
import { ComponentProps } from "react";

export function MaxWidthWrapper({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("max-w-[1440px] mx-auto", className)} {...props} />;
}
