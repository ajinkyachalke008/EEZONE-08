# 🤝 Contributing to EE ZONE

Thank you for your interest in contributing to **EE ZONE**! This platform was built to make electrical engineering accessible to everyone, and community contributions are a huge part of that mission.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Coding Standards](#coding-standards)

---

## 📜 Code of Conduct

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, constructive, and collaborative.

---

## 🛠 How to Contribute

### 1. Fork the Repository

```bash
git fork https://github.com/ajinkyachalke008/EEZONE-08
```

### 2. Create a Branch

Use a descriptive branch name:

```bash
git checkout -b feat/add-transformer-calculator
git checkout -b fix/quiz-suspense-boundary
git checkout -b docs/update-api-guide
```

**Branch naming conventions:**
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation
- `refactor/` — code cleanup
- `test/` — adding tests

### 3. Make Your Changes

Keep commits focused and well-described:

```bash
git commit -m "feat: add transformer turns ratio calculator to power tools"
```

### 4. Push & Open a PR

```bash
git push origin feat/your-branch-name
```

Then open a Pull Request on GitHub with a clear title and description.

---

## ⚙️ Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/EEZONE-08.git
cd EEZONE-08

# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Fill in your Turso, Better Auth, and OpenRouter keys

# Push DB schema
bun run drizzle-kit push

# Start dev server
bun run dev
```

---

## ✅ Pull Request Guidelines

Before submitting a PR, please ensure:

- [ ] Your code builds without errors (`bun run build`)
- [ ] TypeScript types are correct (no `any` unless justified)
- [ ] New components follow the existing NeoLumen dark theme
- [ ] Any new DB tables are added to `src/db/schema.ts`
- [ ] You haven't broken existing routes or API endpoints
- [ ] The PR description explains **what** changed and **why**

---

## 🐛 Reporting Bugs

Open a [GitHub Issue](https://github.com/ajinkyachalke008/EEZONE-08/issues) with:

1. **Title:** Short, clear description of the bug
2. **Steps to reproduce:** Numbered list
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happens
5. **Environment:** Browser, OS, screen size if relevant
6. **Screenshots:** If applicable

---

## 💡 Suggesting Features

Open a [GitHub Issue](https://github.com/ajinkyachalke008/EEZONE-08/issues) with the label `enhancement` and include:

1. **Problem statement:** What problem does this solve?
2. **Proposed solution:** How should it work?
3. **Alternatives considered:** Any other approaches?
4. **Impact:** Who benefits and how?

---

## 🎨 Coding Standards

**TypeScript**
- Use strict types — avoid `any`
- Use interfaces for object shapes, types for unions
- Export types from a central location where reused

**Components**
- Use functional components with hooks
- Keep components under 300 lines — split if larger
- Follow the existing NeoLumen glass-surface visual style

**API Routes**
- All routes live under `src/app/api/`
- Use Drizzle ORM for all DB queries — no raw SQL
- Return consistent `{ success, data, error }` shapes

**Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org):
```
feat: add solar PV calculator
fix: resolve auth session expiry bug
docs: add API route documentation
refactor: simplify circuit simulation state
```

---

## 🙏 Recognition

All contributors will be listed in the project's contributor section. Your work helps make engineering education more accessible worldwide.

Questions? Email [ajinkyachalke008@gmail.com](mailto:ajinkyachalke008@gmail.com)

---

*Built with ⚡ by Ajinkya Chalke — Karad, Maharashtra, India*
