# Git Repository Creation Walkthrough

We have successfully initialized a git repository for the `adminpulse-dashboard-v7` project and pushed it to GitHub.

## Completed Steps

1.  **Initialized Local Repository**: Created a new git repository in the project folder.
2.  **Configured .gitignore**: Added a `.gitignore` file to exclude `node_modules`, `dist`, and environment files.
3.  **Handled Secrets**: Identified a hardcoded hCaptcha secret in `Signup.tsx`.
    *   Moved the secret to a new `.env` file key `VITE_HCAPTCHA_SITE_KEY`.
    *   Updated `Signup.tsx` to use `import.meta.env.VITE_HCAPTCHA_SITE_KEY`.
    *   **Cleared History**: Completely re-initialized the git repository to ensure the secret was never in the commit history.
4.  **Pushed to GitHub**: Pushed the clean code to `https://github.com/patrickcrdp/adminpulse-dashboard-v7.git`.

## Next Steps

-   **Environment Variables**: Remember that `.env` is **not** pushed to GitHub. If you clone this project on another machine, you will need to create a `.env` file manually with the following content:
    ```env
    VITE_HCAPTCHA_SITE_KEY=ES_52b5c6b7018946cdb071d530851269b6
    ```
-   **Deployment**: The project is now ready to be connected to a deployment service like Vercel or Netlify, simply by selecting this GitHub repository.

## How to Save Changes (Daily Workflow)

To send new updates to GitHub, you need to run these 3 commands in your terminal:

1.  **Add changes**: `git add .`
2.  **Save locally**: `git commit -m "Description of what you changed"`
3.  **Send to GitHub**: `git push`
