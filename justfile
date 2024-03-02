tailwind:
    npx tailwindcss -i ./src/styles/input.css -o ./src/styles/output.css --watch

frontend:
    pnpm dev

tauri:
    pnpm tauri dev
