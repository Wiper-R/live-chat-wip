import { createContext } from "@/lib/utils";

type FriendDialogContext = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const [FriendsDialogState, useFriendDialogState] = createContext<
  FriendDialogContext | undefined
>();
