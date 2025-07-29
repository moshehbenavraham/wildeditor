# Contributing to Luminari Wilderness Editor

Thank you for your interest in contributing to the Luminari Wilderness Editor! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** and npm
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Code editor** (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/wildeditor.git
   cd wildeditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify the setup**
   - Open `http://localhost:5173` in your browser
   - Ensure the application loads without errors

## 📋 Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
```bash
git checkout -b feature/polygon-editing-tools
git checkout -b fix/coordinate-display-bug
git checkout -b docs/api-documentation-update
```

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(map): add polygon drawing tool"
git commit -m "fix(coordinates): resolve zoom level calculation bug"
git commit -m "docs: update API documentation for regions endpoint"
```

## 🏗️ Code Standards

### TypeScript Guidelines

- **Use TypeScript strictly** - No `any` types unless absolutely necessary
- **Define interfaces** for all data structures
- **Use proper typing** for function parameters and return values
- **Leverage type inference** where appropriate

```typescript
// Good
interface Region {
  id: number;
  name: string;
  coordinates: [number, number][];
  type: RegionType;
}

// Avoid
const region: any = { /* ... */ };
```

### React Component Guidelines

- **Use functional components** with hooks
- **Follow naming conventions** - PascalCase for components
- **Keep components focused** - Single responsibility principle
- **Use proper prop typing** with interfaces

```typescript
// Good
interface MapViewProps {
  regions: Region[];
  onRegionSelect: (region: Region) => void;
  zoom: number;
}

export const MapView: React.FC<MapViewProps> = ({ regions, onRegionSelect, zoom }) => {
  // Component implementation
};
```

### Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow mobile-first** responsive design
- **Use semantic class names** when custom CSS is needed
- **Maintain consistent spacing** using Tailwind's spacing scale

```tsx
// Good
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Region Editor</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Content */}
  </div>
</div>
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Write tests for new features** and bug fixes
- **Use descriptive test names** that explain the expected behavior
- **Follow the AAA pattern** - Arrange, Act, Assert
- **Mock external dependencies** appropriately

```typescript
describe('CoordinateDisplay', () => {
  it('should display coordinates with correct precision at 100% zoom', () => {
    // Arrange
    const coordinates = { x: 123.456, y: 789.012 };
    const zoom = 1;

    // Act
    render(<CoordinateDisplay coordinates={coordinates} zoom={zoom} />);

    // Assert
    expect(screen.getByText('X: 123, Y: 789')).toBeInTheDocument();
  });
});
```

## 📝 Documentation

### Code Documentation

- **Add JSDoc comments** for complex functions
- **Document component props** with clear descriptions
- **Include usage examples** for utility functions

```typescript
/**
 * Converts screen coordinates to wilderness coordinates
 * @param screenX - X coordinate on screen
 * @param screenY - Y coordinate on screen
 * @param zoom - Current zoom level (1 = 100%)
 * @param mapBounds - Map boundary information
 * @returns Wilderness coordinates
 */
export function screenToWilderness(
  screenX: number,
  screenY: number,
  zoom: number,
  mapBounds: MapBounds
): WildernessCoordinates {
  // Implementation
}
```

### README Updates

When adding new features:
- Update the features list in README.md
- Add usage examples if applicable
- Update the project structure if new directories are added

## 🐛 Bug Reports

### Before Submitting

1. **Search existing issues** to avoid duplicates
2. **Test with the latest version** to ensure the bug still exists
3. **Gather relevant information** about your environment

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js version: [e.g., 18.12.0]
```

## ✨ Feature Requests

### Before Submitting

1. **Check existing feature requests** to avoid duplicates
2. **Consider the scope** - Does it fit the project's goals?
3. **Think about implementation** - Is it technically feasible?

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Explain why this feature would be useful.

**Proposed Solution**
Describe how you envision this feature working.

**Alternatives Considered**
Any alternative solutions you've considered.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code follows** the style guidelines
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Test thoroughly** in different browsers/environments

### Pull Request Template

```markdown
**Description**
Brief description of changes made.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

**Testing**
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Tested in multiple browsers

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge by maintainers

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Help others learn** and grow
- **Focus on the code**, not the person

### Communication

- **Use clear, descriptive language**
- **Be patient** with new contributors
- **Ask questions** when something is unclear
- **Share knowledge** and best practices

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check the docs/ directory first
- **Code Comments** - Look for inline documentation

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to the Luminari Wilderness Editor! 🎉
