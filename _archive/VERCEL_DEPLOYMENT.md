# Deploying DataSynth Next.js to Vercel

**Quick guide to deploying the `nextjs-migration` branch to Vercel**

---

## 🚀 Method 1: Vercel Dashboard (Easiest)

### Step 1: Go to Vercel
Visit: https://vercel.com

### Step 2: Sign In
- Click "Login" or "Sign Up"
- Use your GitHub account (recommended)
- Authorize Vercel to access your repos

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your repo: **`luismqueral/data-synth`**
3. Click **"Import"**

### Step 4: Configure Build Settings

**IMPORTANT:** Your Next.js project is in a subdirectory!

Configure these settings:

```
Framework Preset: Next.js
Root Directory: datasynth-next    ← IMPORTANT!
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 20.x
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Get your URL: `https://data-synth-xxxxx.vercel.app`

### Step 6: Enable Branch Previews

After first deployment:

1. Go to **Project Settings** → **Git**
2. Under **"Production Branch"**, keep as `main`
3. Under **"Preview Branches"**, select:
   - ✅ **All branches** (or specifically `nextjs-migration`)
4. Click **Save**

Now every push to `nextjs-migration` will auto-deploy!

**Preview URL format:**
```
https://data-synth-git-nextjs-migration-your-username.vercel.app
```

---

## 🚀 Method 2: Vercel CLI (Advanced)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy from Project Directory

```bash
# Navigate to Next.js project
cd datasynth-next

# Deploy (first time)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? datasynth-next
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod

# Or deploy just this branch (preview)
vercel
```

### Deploy Specific Branch

```bash
# Make sure you're on nextjs-migration branch
git branch --show-current

# Deploy as preview
cd datasynth-next
vercel

# Your preview URL will be shown!
```

---

## 🔧 Method 3: Fix Root Directory Issue

Since your Next.js app is in a subdirectory (`datasynth-next/`), you have two options:

### Option A: Configure Root Directory in Vercel

When importing, set:
```
Root Directory: datasynth-next
```

### Option B: Move to Root (Recommended for Vercel)

```bash
# Create a new branch for this
git checkout -b nextjs-root

# Move contents up one level
mv datasynth-next/* .
mv datasynth-next/.gitignore .
mv datasynth-next/.nvmrc .

# Remove now-empty directory
rmdir datasynth-next

# Commit
git add .
git commit -m "refactor: move Next.js to root for Vercel deployment"
git push -u origin nextjs-root
```

Then import `nextjs-root` branch with no subdirectory config needed.

---

## 📋 Deployment Checklist

### Before Deploying

- [x] Next.js project builds successfully (`npm run build`)
- [x] All environment variables identified
- [x] `.nvmrc` specifies Node 20+ ✅
- [x] Dependencies in `package.json` ✅
- [x] No hardcoded localhost URLs

### Vercel Configuration

```
Project Name: datasynth-next
Framework: Next.js
Node Version: 20.x
Root Directory: datasynth-next (if in subdirectory)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Environment Variables (if needed)

Currently none required! But if you add API keys later:

1. Go to **Project Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_API_KEY=your-key`
   - etc.

---

## 🌐 Finding Your Preview

### After Vercel Import

1. **Dashboard:** https://vercel.com/dashboard
2. Click your project: **datasynth-next**
3. See deployments:
   - **Production:** `main` branch
   - **Preview:** `nextjs-migration` branch

### Preview URL Format

```
Production (main):
https://datasynth-next.vercel.app

Preview (nextjs-migration):
https://datasynth-next-git-nextjs-migration-yourusername.vercel.app

Preview (specific commit):
https://datasynth-next-abc123def.vercel.app
```

### Finding Preview URL

**Method 1: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click on the `nextjs-migration` deployment
4. See the URL at the top

**Method 2: GitHub Integration**
- Every commit to `nextjs-migration` will get a comment from Vercel bot
- The comment contains the preview URL

**Method 3: Vercel CLI**
```bash
vercel ls
# Shows all deployments with URLs
```

---

## 🐛 Troubleshooting

### "Root Directory" Error

**Problem:** Vercel tries to build from repo root but Next.js is in `datasynth-next/`

**Solution:** Set Root Directory in Vercel:
```
Settings → General → Root Directory: datasynth-next
```

### "Node Version" Error

**Problem:** Default Node version too old

**Solution:** `.nvmrc` file already created with `20.9.0`
Vercel will auto-detect and use it ✅

### "Build Failed"

**Problem:** Missing dependencies or build errors

**Solutions:**
1. Check Vercel build logs
2. Verify `npm run build` works locally
3. Check all imports are correct
4. Ensure all dependencies in `package.json`

### "Page Not Found"

**Problem:** Routing issue

**Solution:** 
- Ensure `src/app/page.tsx` exists ✅
- Check build output in Vercel logs

---

## 🎯 Recommended Approach

### For Testing (Right Now)

**Use Vercel Dashboard:**
1. Visit https://vercel.com
2. Sign in with GitHub
3. Import `luismqueral/data-synth`
4. Set Root Directory: `datasynth-next`
5. Deploy!

**Your preview will be live in ~2 minutes!**

### For Future Updates

**Automatic Previews:**
- Every push to `nextjs-migration` auto-deploys
- Get a new preview URL for each commit
- Comment appears on PR (if you create one)

---

## 🌟 Bonus: Deploy Both Versions

You can deploy both the original and Next.js version:

### Original HTML Version
Create `vercel.json` in root:
```json
{
  "buildCommand": "echo 'Static files, no build needed'",
  "outputDirectory": ".",
  "routes": [
    { "src": "/", "dest": "/index.html" }
  ]
}
```

### Next.js Version
Already configured! Just set Root Directory to `datasynth-next`

---

## 📱 After Deployment

### Share Your Preview
```
https://datasynth-next-git-nextjs-migration-yourusername.vercel.app
```

Test on:
- Desktop browsers (Chrome, Firefox, Safari)
- Mobile browsers
- Different screen sizes
- Different devices

### Monitor Performance
Vercel shows:
- Build time
- Bundle size
- Lighthouse scores
- Analytics

---

## 🎉 Quick Start (TL;DR)

```bash
# 1. Go to Vercel
https://vercel.com

# 2. Import your GitHub repo
# 3. Set Root Directory: datasynth-next
# 4. Deploy!

# Preview URL will be:
https://datasynth-next-git-nextjs-migration-yourusername.vercel.app
```

---

**Your Next.js version will be live in minutes!** 🚀

The branch is already pushed, so Vercel can access it. Just import and configure the root directory!

