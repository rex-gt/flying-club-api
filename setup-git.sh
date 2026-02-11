#!/bin/bash

# Flying Club API - Git Setup Script
# This script will help you initialize your git repository

echo "=========================================="
echo "Flying Club API - Git Repository Setup"
echo "=========================================="
echo ""

# Create .gitignore
echo "Creating .gitignore file..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
EOF

echo "✓ .gitignore created"
echo ""

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    echo "✓ Git repository initialized"
else
    echo "✓ Git repository already exists"
fi
echo ""

# Check if files exist
echo "Checking project files..."
required_files=("server.js" "schema.sql" "package.json" "README.md")
all_exist=true

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file found"
    else
        echo "  ✗ $file missing"
        all_exist=false
    fi
done
echo ""

if [ "$all_exist" = false ]; then
    echo "⚠ Warning: Some required files are missing!"
    echo ""
fi

# Stage files
echo "Staging files for commit..."
git add .
echo "✓ Files staged"
echo ""

# Show status
echo "Current git status:"
git status --short
echo ""

# Prompt for commit
read -p "Ready to make initial commit? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: Flying club scheduling backend API

- Database schema with members, aircraft, reservations, flight_logs, and billing_records
- RESTful API with full CRUD operations
- Automatic tach hour tracking and billing generation
- Reservation conflict detection
- Sample data for testing"
    echo "✓ Initial commit created"
    echo ""
fi

# Check if remote exists
if git remote | grep -q 'origin'; then
    echo "✓ Remote 'origin' already configured"
    git remote -v
    echo ""
    read -p "Push to existing remote? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -M main
        git push -u origin main
        echo "✓ Pushed to remote"
    fi
else
    echo "No remote configured yet."
    echo ""
    echo "To add a remote repository, run one of these commands:"
    echo ""
    echo "Option 1 - HTTPS:"
    echo "  git remote add origin https://github.com/yourusername/flying-club-api.git"
    echo ""
    echo "Option 2 - SSH:"
    echo "  git remote add origin git@github.com:yourusername/flying-club-api.git"
    echo ""
    echo "Then push with:"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    
    read -p "Do you want to add a remote now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your GitHub repository URL: " repo_url
        git remote add origin "$repo_url"
        echo "✓ Remote added"
        echo ""
        read -p "Push to remote now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -M main
            git push -u origin main
            echo "✓ Pushed to remote"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your database"
echo "2. Run 'npm install' to install dependencies"
echo "3. Set up your PostgreSQL database"
echo "4. Run 'npm start' to launch the API"
echo ""
echo "For detailed instructions, see README.md"
echo ""
