tmux new-session -d -s live-chat -n api

# Start api Server
tmux send-keys -t live-chat:api 'cd ./api' Enter
tmux send-keys -t live-chat:api 'pnpm exec nodemon index.ts' Enter

# Start Frontend Server
tmux new-window -t live-chat -n frontend
tmux send-keys -t live-chat:frontend 'cd ./web' Enter
tmux send-keys -t live-chat:frontend 'pnpm dev' Enter

# Start Lazygit
tmux new-window -t live-chat -n lazygit
tmux send-keys -t live-chat:lazygit 'lazygit' Enter


# Start Prisma Studio
tmux new-window -t live-chat -n studio
tmux send-keys -t live-chat:studio 'cd ./shared' Enter
tmux send-keys -t live-chat:studio 'pnpm exec prisma studio' Enter

# Switch window to lazygit
tmux select-window -t live-chat:lazygit


tmux attach -t live-chat