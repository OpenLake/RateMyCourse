# Contributing to OpenLake Project

We’re excited that you’re interested in contributing! 🎉  
The OpenLake Project is built with **Next.js** and we welcome contributions of all kinds — code, documentation, testing, design, and new ideas.  

Please read this guide before contributing to ensure smooth collaboration.  

---

## 📢 Discussions & Community
- Join our community on **[Discord](https://discord.gg/QAPbMSzS)** for questions, discussions, and updates.  
- Check open issues and discussions before starting new work.  

---

## 🚀 Getting Started

### 1. Fork the Repository
Click the **Fork** button (top right) to create your copy of the repo.  

### 2. Clone Your Fork
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the root directory.  
Refer to `.env.example` for required keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_SALT=
SUPABASE_SERVICE_ROLE_KEY=
```

### 5. Run Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).  

---

## 🛠️ Contribution Workflow

1. **Create a new branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** (code, docs, tests, etc.).

3. **Commit with a clear message**:
   ```bash
   git commit -m "feat: add login component"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request (PR)**:
   - Go to the original repo and click **New Pull Request**.
   - Provide a meaningful title and description.  
   - Link the issue you’re addressing, if any.  

---

## 📌 Guidelines

- Follow existing **code style and structure**.  
- Write **meaningful commit messages**.  
- Add tests when applicable.  
- Update documentation if you change functionality.  
- Be respectful and collaborative.  

---

## 🌟 Hacktoberfest Notes

- All contributions — code, documentation, bug fixes, or design improvements — are welcome!  
- Issues labeled `good first issue` are great entry points for beginners.  
- Make sure your PRs are high-quality and meaningful.  

---

## 📜 Code of Conduct
By participating, you agree to uphold our values of respect, inclusion, and collaboration.  
