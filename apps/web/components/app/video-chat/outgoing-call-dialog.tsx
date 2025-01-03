import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User } from "@repo/api-types";

type OutgoingCallDialogProps = {
  callee: User;
  hangUp: () => void;
};

export function OutgoingCallDialog({
  callee,
  hangUp,
}: OutgoingCallDialogProps) {
  return (
    <Dialog open>
      <DialogContent
        className="max-w-[400px] flex flex-col items-center"
        hideClose
      >
        <DialogTitle>Outgoing Call</DialogTitle>
        <div className="w-24 h-24 rounded-full bg-gray-500" />
        <div>Calling {callee.name}</div>
        <div className="space-x-4">
          <Button onClick={hangUp} variant="destructive">
            Hang Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
