# 🐙 How to Push ABC Books to GitHub

## Step 1: Create a Repository
1. Log in to [GitHub.com](https://github.com)
2. Click the **+** icon in the top right -> **New repository**
3. Repository name: `abc-books`
4. Description: "Islamic Bookstore E-commerce Website"
5. Visibility: **Public** or **Private**
6. **Do NOT check** "Initialize this repository with a README"
7. Click **Create repository**

## Step 2: Link Your Local Code
Copy the HTTPS URL of your new repository. It will look like:
`https://github.com/YOUR_USERNAME/abc-books.git`

## Step 3: Run These Commands
Open your terminal in the project folder and run:

```bash
# Add the remote link (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/abc-books.git

# Rename main branch to 'main'
git branch -M main

# Push your code
git push -u origin main
```

## Step 4: Verify
Refresh your GitHub repository page. You should see all your files!
