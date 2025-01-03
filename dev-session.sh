tmux new-session -d -s live-chat -n nvim

# Start nvim
tmux send-keys -t live-chat:nvim 'nvim' Enter

# Start trubo
tmux new-window -t live-chat -n turbo
tmux send-keys -t live-chat:turbo 'pnpm dev' Enter

# Start Lazygit
tmux new-window -t live-chat -n lazygit
tmux send-keys -t live-chat:lazygit 'lazygit' Enter

# Start Prisma Studio
tmux new-window -t live-chat -n studio
tmux send-keys -t live-chat:studio 'cd ./shared' Enter
tmux send-keys -t live-chat:studio 'pnpm db:studio' Enter

# Switch window to lazygit
tmux select-window -t live-chat:nvim

tmux attach -t live-chat
