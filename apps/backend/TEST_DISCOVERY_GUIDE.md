# Test Discovery Troubleshooting Guide

## Current Status
✅ **Tests work from command line** - 22 tests discovered and can be run successfully
❌ **VS Code test discovery not working** - Tests don't appear in VS Code Test Explorer

## Verified Working Command Line Commands
From the backend directory (`c:\Users\jamie\dev\wildeditor\apps\backend`):

```powershell
# Discover all tests
C:/Users/jamie/dev/wildeditor/.venv/Scripts/python.exe -m pytest --collect-only

# Run all tests
C:/Users/jamie/dev/wildeditor/.venv/Scripts/python.exe -m pytest tests/ -v

# Run specific test file
C:/Users/jamie/dev/wildeditor/.venv/Scripts/python.exe -m pytest tests/test_smoke.py -v
```

## VS Code Configuration Files Created

### Root Workspace Settings (`.vscode/settings.json`)
- Configured pytest as the test framework
- Set proper Python interpreter path
- Added backend source to Python analysis paths

### Backend-Specific Settings (`apps/backend/.vscode/settings.json`)
- Local settings for when opening the backend folder directly
- Relative paths configured for backend-only workspace

## Troubleshooting Steps

### 1. Verify Python Extension
The Python extension (ms-python.python) is installed and should provide test discovery.

### 2. Manual VS Code Commands to Try
Open VS Code and try these commands (Ctrl+Shift+P):
- `Python: Configure Tests`
- `Python: Refresh Tests`
- `Test: Refresh All Tests`
- `Python: Select Interpreter` (choose `.venv/Scripts/python.exe`)

### 3. Check VS Code Status Bar
- Look for Python interpreter in bottom status bar
- Should show Python 3.11.9 from the virtual environment
- Look for test discovery status indicators

### 4. VS Code Test Explorer
- Open Test Explorer panel (Testing icon in sidebar)
- Check if tests appear there
- Look for any error messages or discovery status

### 5. Alternative: Open Backend as Separate Workspace
Try opening just the backend folder in VS Code:
```
File → Open Folder → Select apps/backend folder
```
This might help VS Code discover tests more easily in the simpler project structure.

### 6. Check Output Panels
In VS Code, check these output channels for errors:
- Python
- Python Test Log
- Test Results

### 7. Environment Variables
Make sure the `.env.development` file exists and has proper database configuration (if tests need it).

## Test Structure Summary
- **Location**: `apps/backend/tests/`
- **Files**: `test_main.py`, `test_smoke.py`, `conftest.py`
- **Total Tests**: 22 tests discovered
- **Configuration**: `pytest.ini` with proper test paths and Python path
- **Fixtures**: Test client and database mocking in `conftest.py`

## Next Steps
1. Try the manual VS Code commands listed above
2. Check the Test Explorer panel for any tests or error messages
3. Consider opening just the backend folder as a workspace
4. Check VS Code output panels for Python/test-related errors
5. Verify the Python interpreter is correctly selected in VS Code

If tests still don't appear, the issue might be VS Code-specific and may require restarting VS Code or reinstalling the Python extension.
