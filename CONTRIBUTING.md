# Contributing to Multi-College Data Collection System

First off, thank you for considering contributing to this project! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful** of differing viewpoints and experiences
- **Be collaborative** and open to feedback
- **Be inclusive** and welcoming to all contributors
- **Focus on what is best** for the community
- **Show empathy** towards other community members

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**Good bug reports include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, Node version)
- Error messages and stack traces

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 96]
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.17.0]

**Additional context**
Any other relevant information.
```

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **Clear use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions you've considered
- **Additional context**: Mockups, examples, references

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Mockups, screenshots, or examples.
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Git
- Code editor (VS Code recommended)

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/multi-college-data-collection-system.git
   cd multi-college-data-collection-system
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   npm run create-admin
   npm run dev
   ```

3. **Set up frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with backend URL
   npm run dev
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Linting
npm run lint
```

## 📝 Coding Standards

### General Guidelines

- Write clean, readable code
- Add comments for complex logic
- Follow existing code style
- Keep functions small and focused
- Use meaningful variable names
- Avoid code duplication

### JavaScript/React Standards

**Follow these conventions:**

```javascript
// Use const/let, not var
const userName = 'admin';
let counter = 0;

// Use arrow functions
const getUserData = async (userId) => {
  return await api.get(`/users/${userId}`);
};

// Use template literals
console.log(`User ${userName} logged in`);

// Use destructuring
const { username, role } = user;

// Use async/await instead of callbacks
const data = await fetchData();

// Component naming: PascalCase
function UserProfile() { }

// File naming: PascalCase for components, camelCase for utilities
UserProfile.jsx
apiService.js
```

### Backend Standards

- **Route naming**: Use kebab-case (`/api/college-data`)
- **Function naming**: Use camelCase (`getUserById`)
- **Model naming**: Use PascalCase (`User`, `College`)
- **Error handling**: Always use try-catch
- **Validation**: Use Joi schemas
- **Database**: Use Mongoose models

**Example:**
```javascript
// routes/users.js
router.post('/', adminAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Process request
    const user = await User.create({ username, password });
    
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

### Frontend Standards

- **Component structure**: Functional components with hooks
- **State management**: Use Context API or props
- **Styling**: Use Bootstrap classes
- **API calls**: Use axios with error handling

**Example:**
```jsx
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id}>{user.username}</div>
      ))}
    </div>
  );
}
```

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(colleges): add bulk delete functionality

Added ability to delete multiple colleges at once from the admin panel.
Includes confirmation dialog and undo option.

Closes #123

---

fix(auth): resolve token expiration bug

Fixed issue where tokens were not being refreshed properly,
causing users to be logged out unexpectedly.

Fixes #456

---

docs(readme): update deployment instructions

Updated Vercel deployment guide with new environment variables
and troubleshooting section.
```

## 🔄 Pull Request Process

1. **Update your fork**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure code quality**
   - All tests pass
   - Code is linted
   - No console errors
   - Documentation is updated

3. **Create Pull Request**
   - Clear title describing the change
   - Detailed description of what changed
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] Code follows project style
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tested on multiple browsers (if frontend)
```

4. **Review Process**
   - Maintainers will review your PR
   - Address any feedback
   - Make requested changes
   - Once approved, it will be merged!

## 🧪 Testing Guidelines

### Backend Testing

```javascript
// Example test structure
describe('User API', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ username: 'testuser', password: 'test123' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
  });
});
```

### Frontend Testing

```jsx
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';

test('login form submits correctly', async () => {
  render(<Login />);
  
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'admin' }
  });
  
  fireEvent.click(screen.getByText(/login/i));
  
  await screen.findByText(/welcome/i);
});
```

## 🏗️ Project Structure

Understanding the project structure helps in contributing:

```
multi-college-data-collection-system/
├── backend/
│   ├── middleware/     # Auth, validation
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   └── server.js       # Express server
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # Global state
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── vite.config.js
└── docs/              # Documentation
```

## 💡 Tips for Contributors

- Start with good first issues labeled `good first issue`
- Ask questions if something is unclear
- Don't be afraid to make mistakes
- Review existing PRs to understand the process
- Join discussions in issues
- Help review other PRs
- Improve documentation
- Write tests for your code

## 🙏 Recognition

All contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Email**: For private concerns

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉 Every contribution, no matter how small, makes a difference.
