# 🚀 Deploy Your NFC Valentine Blog to GitHub Pages

This guide will get your blog live in under 5 minutes.

## Quick Deploy (Recommended)

### Option 1: GitHub Web Interface (Easiest - No Command Line)

1. **Go to GitHub** and create a new repository
   - Name it something like `nfc-valentine` or `valentine-project`
   - Make it **Public** (required for free GitHub Pages)
   - ✅ Check "Add a README file"
   - Click "Create repository"

2. **Upload your files**
   - Click "Add file" → "Upload files"
   - Drag and drop these files:
     - `index.html`
     - `IMG_0725.png`
     - `IMG_0726.png`
     - `IMG_0727.png`
     - `IMG_0728.png`
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Go to repository "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 1-2 minutes for deployment

4. **Your site is live! 🎉**
   - GitHub will show you the URL: `https://yourusername.github.io/nfc-valentine/`
   - Share this link with anyone!

---

### Option 2: Command Line (If you prefer terminal)

```bash
# Navigate to the directory with your files
cd /path/to/your/files

# Initialize git repo
git init

# Add files
git add index.html IMG_0725.png IMG_0726.png IMG_0727.png IMG_0728.png

# Commit
git commit -m "Initial commit: NFC Valentine blog post"

# Create repo on GitHub (via web), then:
git remote add origin https://github.com/yourusername/nfc-valentine.git
git branch -M main
git push -u origin main

# Enable GitHub Pages in Settings → Pages → Source: main branch
```

---

## Your Live URL Will Be:

```
https://yourusername.github.io/nfc-valentine/
```

Replace `yourusername` with your actual GitHub username.

---

## Updating Your Blog

Whenever you want to update the content:

**Via Web Interface:**
1. Navigate to the file in GitHub
2. Click the pencil icon (Edit)
3. Make changes
4. Click "Commit changes"
5. Wait ~1 minute for GitHub Pages to rebuild

**Via Command Line:**
```bash
git add .
git commit -m "Update blog content"
git push
```

---

## Custom Domain (Optional)

Want a custom domain like `valentine.yourdomain.com`?

1. Go to Settings → Pages
2. Enter your custom domain
3. Update your DNS records:
   - Add a CNAME record pointing to `yourusername.github.io`
4. Wait for DNS propagation (~1 hour)

---

## Troubleshooting

**Images not showing?**
- Make sure all PNG files are in the root directory
- Check that filenames match exactly (case-sensitive)
- Verify files were uploaded successfully

**Page not loading?**
- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages shows "Your site is live at..."
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**404 Error?**
- Verify repository is Public
- Check that index.html is in the root directory
- Confirm GitHub Pages is enabled in Settings

---

## Files You Need

✅ `index.html` - The blog post (already formatted)
✅ `IMG_0725.png` - Timeline diagram
✅ `IMG_0726.png` - Feedback loop diagram  
✅ `IMG_0727.png` - Skills matrix
✅ `IMG_0728.png` - Ecosystem diagram

All files are ready to go in your outputs folder!

---

## Next Steps

Once live, you can:
- Share the URL on Twitter/LinkedIn/Reddit
- Submit to Hacker News
- Add it to your portfolio
- Send to potential employers/clients
- Update content anytime without redeploying

**Your blog will be live 24/7 for free, forever.** 🚀
