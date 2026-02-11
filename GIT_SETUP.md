# Git Integration Guide

## Quick Start

After downloading all the files to your local machine:

### Method 1: Using the Setup Script (Easiest)

```bash
# Navigate to your project directory
cd flying-club-api

# Run the setup script
bash setup-git.sh
```

The script will:
- Create .gitignore automatically
- Initialize git repository
- Stage all files
- Create initial commit
- Help you add a remote repository
- Push to GitHub

### Method 2: Manual Setup

```bash
# Navigate to your project directory
cd flying-club-api

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Flying club scheduling backend API"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/flying-club-api.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Creating a GitHub Repository

### Option A: Using GitHub Website

1. Go to https://github.com/new
2. Name: `flying-club-api`
3. Description: "Backend API for flying club scheduling and billing"
4. Choose Public or Private
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"
7. Copy the repository URL shown
8. Use it in the setup script or manual commands above

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if you haven't: https://cli.github.com/

# Authenticate
gh auth login

# Create repository and push (all in one!)
cd flying-club-api
gh repo create flying-club-api --public --source=. --remote=origin --push
```

## Important Files to Check

Before committing, verify these files exist:

- ✅ `.gitignore` - Prevents committing sensitive files
- ✅ `.env.example` - Template for environment variables (SAFE to commit)
- ✅ `server.js` - Main application
- ✅ `schema.sql` - Database schema
- ✅ `package.json` - Dependencies
- ✅ `README.md` - Documentation

**NEVER commit:**
- ❌ `.env` - Contains real database credentials
- ❌ `node_modules/` - Dependencies (too large)

## Common Git Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Collaboration Workflow

```bash
# Before making changes
git pull

# Make your changes, then:
git add .
git commit -m "Description of changes"
git push

# For feature development
git checkout -b new-feature
# ... make changes ...
git add .
git commit -m "Add new feature"
git push -u origin new-feature
# Then create a Pull Request on GitHub
```

## Repository Structure

```
flying-club-api/
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── package.json         # Node.js dependencies
├── server.js            # Main API server
├── schema.sql           # Database schema
├── sample-data.sql      # Test data
└── setup-git.sh         # Git setup helper script
```

## Next Steps After Git Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database:**
   ```bash
   createdb flying_club
   psql -d flying_club -f schema.sql
   psql -d flying_club -f sample-data.sql
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Troubleshooting

**Problem:** "Permission denied" when running setup-git.sh

**Solution:**
```bash
chmod +x setup-git.sh
```

**Problem:** Git asks for username/password repeatedly

**Solution:** Set up SSH keys or use credential helper
```bash
# For HTTPS (credential caching)
git config --global credential.helper cache

# Or switch to SSH
git remote set-url origin git@github.com:yourusername/flying-club-api.git
```

**Problem:** Files not being ignored

**Solution:** Clear git cache
```bash
git rm -r --cached .
git add .
git commit -m "Fix gitignore"
```

## Additional Resources

- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub CLI](https://cli.github.com/)
