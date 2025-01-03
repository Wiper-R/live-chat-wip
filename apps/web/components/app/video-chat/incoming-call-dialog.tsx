import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User } from "@repo/api-types";

type IncomingCallDialogProps = {
  caller: User;
  acceptCall: () => void;
  rejectCall: () => void;
};

export function IncomingCallDialog({
  caller,
  acceptCall,
  rejectCall,
}: IncomingCallDialogProps) {
  return (
    <Dialog open>
      <DialogContent
        hideClose
        className="max-w-[400px] flex flex-col items-center"
      >
        <DialogTitle>Incoming Call</DialogTitle>
        <div className="w-24 h-24 rounded-full bg-gray-500" />
        <div>{caller.name} is calling</div>
        <div className="space-x-4">
          <Button onClick={acceptCall}>Accept</Button>
          <Button variant="destructive" onClick={rejectCall}>
            Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
