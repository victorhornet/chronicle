feat name:
    mkdir {{justfile_directory()}}/src/features/{{name}}/{,api,assets,components,hooks,routes,stores,types,utils}
    touch {{justfile_directory()}}/src/features/{{name}}/index.ts



tailwind:
    npx tailwindcss -i ./src/styles/input.css -o ./src/styles/output.css --watch

frontend:
    pnpm dev

tauri:
    pnpm tauri dev
