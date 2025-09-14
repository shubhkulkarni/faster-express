# NPM Publishing Setup Guide

## Prerequisites

1. **NPM Account**: Make sure you have an NPM account at [npmjs.com](https://www.npmjs.com)
2. **NPM Token**: Generate an automation token for GitHub Actions

## Setup Steps

### 1. Generate NPM Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Generate a new token with "Automation" type
4. Copy the token (it starts with `npm_`)

### 2. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/shubhkulkarni/faster-express
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your NPM token from step 1
6. Click "Add secret"

### 3. Publishing Options

You now have several ways to publish:

#### Option A: Manual Release (Recommended)
```bash
# Bump patch version and publish
npm run release

# Or specify version type
npm version patch && git push origin main && git push origin --tags
```

#### Option B: GitHub Actions Manual Trigger
1. Go to "Actions" tab in GitHub
2. Select "Version Bump and Publish" workflow
3. Click "Run workflow"
4. Choose version type (patch/minor/major)
5. Choose whether to publish to NPM

#### Option C: Automatic on Version Change
- Edit `package.json` and bump the version
- Commit and push to main branch
- The "Auto Publish on Push" workflow will detect the version change and publish automatically

#### Option D: Release Creation
- Create a new release on GitHub with a tag like `v1.0.1`
- The "Publish to NPM" workflow will automatically publish

## Publishing Workflow

1. **Development**: Make changes, commit to feature branches
2. **Testing**: Create PR, CI runs tests automatically
3. **Release**: Use one of the publishing options above
4. **Verification**: Check that package is published on npmjs.com

## Commands Reference

```bash
# Development
npm run dev          # Run in development mode
npm run build        # Build the project
npm test             # Run tests
npm run lint         # Run linting

# Release (local)
npm run release      # Interactive release helper
node scripts/release.js patch   # Direct patch release
node scripts/release.js minor   # Direct minor release
node scripts/release.js major   # Direct major release

# Manual NPM commands
npm version patch    # Bump patch version
npm version minor    # Bump minor version
npm version major    # Bump major version
npm publish          # Publish to NPM (after build)
```

## Troubleshooting

### NPM Login Issues
```bash
npm login
# Follow prompts to authenticate
```

### Permission Issues
- Make sure you're logged in to NPM with the correct account
- Verify you have publish permissions for the package name
- Check if package name is available (first publish)

### GitHub Actions Issues
- Verify NPM_TOKEN secret is set correctly
- Check workflow logs in Actions tab
- Ensure package.json version is valid semver

## Security Notes

- Never commit NPM tokens to the repository
- Use automation tokens for CI/CD, not your personal token
- Regularly rotate your NPM tokens
- Review what's being published with `npm pack` before publishing
