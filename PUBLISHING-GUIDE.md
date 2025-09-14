# 🚀 Complete NPM Publishing Guide for Beginners

## 📋 One-Time Setup (Do This First)

### Step 1: Create NPM Account
1. Go to [npmjs.com](https://www.npmjs.com)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Write down your username and password

### Step 2: Generate NPM Token for GitHub Actions
1. Log in to [npmjs.com](https://www.npmjs.com)
2. Click on your profile picture (top right)
3. Click "Access Tokens"
4. Click "Generate New Token"
5. Select "Automation" type (important!)
6. Give it a name like "faster-express-github-actions"
7. Click "Generate Token"
8. **COPY THE TOKEN** (starts with `npm_`) - you won't see it again!

### Step 3: Add Token to GitHub Repository
1. Go to your GitHub repository: https://github.com/shubhkulkarni/faster-express
2. Click "Settings" tab (next to Code, Issues, etc.)
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret" (green button)
5. Name: `NPM_TOKEN` (exactly like this)
6. Value: Paste your NPM token from Step 2
7. Click "Add secret"

### Step 4: Verify Package Name is Available
```bash
# Check if your package name is available
npm view faster-express
# If it shows "npm ERR! 404", the name is available ✅
# If it shows package info, you need a different name ❌
```

---

## 🎯 Publishing Your Package (First Time)

### Method 1: Simple Manual Method (Recommended for Beginners)

1. **Make sure your code is ready:**
   ```bash
   cd c:\Users\kulkashu\Documents\DevProjects\NodeJS\faster-express
   npm test     # Make sure tests pass
   npm run build # Make sure it builds successfully
   ```

2. **Login to NPM (one-time):**
   ```bash
   npm login
   # Enter your NPM username
   # Enter your NPM password
   # Enter your email
   # Enter the OTP (if you have 2FA enabled)
   ```

3. **Publish for the first time:**
   ```bash
   npm publish
   ```

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "chore: first npm publish"
   git push origin master
   ```

### Method 2: Using the Release Helper Script

1. **Run the release script:**
   ```bash
   npm run release
   ```

2. **Follow the prompts:**
   - It will ask for version type: choose `patch` for first release
   - It will ask to publish: type `y` and press Enter

---

## 🔄 Publishing Updates (Every Time After First)

### Option A: Quick Manual Update
```bash
# 1. Make your changes to the code
# 2. Test everything works
npm test
npm run build

# 3. Bump version (choose one):
npm version patch    # for bug fixes (1.0.0 → 1.0.1)
npm version minor    # for new features (1.0.0 → 1.1.0)  
npm version major    # for breaking changes (1.0.0 → 2.0.0)

# 4. Push to GitHub (this will auto-publish via GitHub Actions)
git push origin master --tags
```

### Option B: Using Release Script (Easier)
```bash
npm run release
# Follow the prompts - it does everything automatically!
```

### Option C: Using GitHub Actions (Web Interface)
1. Go to your GitHub repository
2. Click "Actions" tab
3. Click "Version Bump and Publish" on the left
4. Click "Run workflow" button
5. Choose version type (patch/minor/major)
6. Choose "true" for publish
7. Click "Run workflow"

---

## 📦 What Happens When You Publish?

1. **Version gets bumped** in package.json
2. **Git tag is created** (like v1.0.1)
3. **Code is pushed** to GitHub
4. **GitHub Actions runs** automatically
5. **Package is published** to NPM
6. **GitHub Release is created** automatically

---

## 🔍 How to Check if Publishing Worked

### Check NPM:
1. Go to [npmjs.com/package/faster-express](https://npmjs.com/package/faster-express)
2. You should see your package with the new version

### Check GitHub:
1. Go to your repository
2. Click "Releases" (on the right side)
3. You should see your new release

### Test Installation:
```bash
# In a different folder, test installing your package
npx faster-express@latest --help
```

---

## 🆘 Troubleshooting Common Issues

### Error: "Package name already exists"
- Change the name in `package.json` to something unique
- Try: `faster-express-shubham` or `@shubhkulkarni/faster-express`

### Error: "Not logged in to NPM"
```bash
npm login
# Enter your credentials again
```

### Error: "GitHub Actions failed"
1. Go to GitHub → Actions tab
2. Click on the failed workflow
3. Check the error message
4. Usually it's because NPM_TOKEN is missing or incorrect

### Error: "Version already exists"
- You tried to publish the same version twice
- Bump the version first: `npm version patch`

---

## 📝 Quick Command Cheat Sheet

```bash
# Development
npm test              # Run tests
npm run build         # Build project
npm run lint          # Check code style

# Publishing (choose one method)
npm run release       # Interactive helper (EASIEST)
npm version patch && git push origin master --tags  # Manual
# OR use GitHub Actions web interface

# Checking
npm view faster-express  # Check published package
npm whoami              # Check if logged in to NPM
```

---

## 🎯 Recommended Workflow for Beginners

1. **Make changes** to your code
2. **Test locally**: `npm test && npm run build`
3. **Use release script**: `npm run release`
4. **Follow prompts**: Choose patch/minor/major, confirm publish
5. **Verify**: Check npmjs.com and GitHub releases

This is the safest and easiest method! 🚀
