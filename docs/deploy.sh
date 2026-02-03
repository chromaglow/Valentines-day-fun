#!/bin/bash

# NFC Valentine GitHub Pages Deployment Script
# This script helps you deploy your blog to GitHub Pages quickly

echo "🚀 NFC Valentine - GitHub Pages Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    echo "Please run this script from the directory containing your files."
    exit 1
fi

echo "✅ Files found:"
echo "   - index.html"
echo "   - IMG_0725.png"
echo "   - IMG_0726.png"
echo "   - IMG_0727.png"
echo "   - IMG_0728.png"
echo ""

# Get user input
read -p "Enter your GitHub username: " username
read -p "Enter repository name (e.g., nfc-valentine): " reponame

echo ""
echo "📦 Initializing git repository..."
git init

echo "📝 Adding files..."
git add index.html IMG_0725.png IMG_0726.png IMG_0727.png IMG_0728.png README.md

echo "💾 Creating commit..."
git commit -m "Initial commit: NFC Valentine blog post"

echo "🌐 Setting up remote..."
git remote add origin "https://github.com/$username/$reponame.git"

echo "📤 Creating main branch..."
git branch -M main

echo ""
echo "⚠️  IMPORTANT: Before pushing, create an empty repository on GitHub:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: $reponame"
echo "   3. Make it Public"
echo "   4. DON'T initialize with README"
echo "   5. Click 'Create repository'"
echo ""

read -p "Press Enter when repository is created on GitHub..."

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Files pushed successfully!"
echo ""
echo "📝 FINAL STEPS:"
echo "1. Go to: https://github.com/$username/$reponame/settings/pages"
echo "2. Under 'Source', select 'main' branch"
echo "3. Click 'Save'"
echo "4. Wait 1-2 minutes for deployment"
echo ""
echo "🎉 Your site will be live at:"
echo "   https://$username.github.io/$reponame/"
echo ""
echo "📋 Don't forget to update the README with your actual username!"
