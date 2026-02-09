# Python Package v0.1.1 Release Guide

## Version Updates

✅ **Python:** `reference/python/pyproject.toml` → v0.1.1  
✅ **Python:** `reference/python/sgaip/__init__.py` → v0.1.1  
✅ **Documentation:** README.md, CHANGELOG.md updated

## Changes in v0.1.1

- Updated documentation to reflect successful npm publication
- Added publication URLs (PyPI & npm)
- Updated version numbers across all files

## Building & Publishing to PyPI

### Step 1: Navigate to Python Package

```bash
cd reference/python
```

### Step 2: Clean Previous Builds

```bash
rm -rf build dist *.egg-info
```

### Step 3: Build the Package

```bash
python -m build
```

This creates:
- `dist/sgaip-0.1.1.tar.gz` (source distribution)
- `dist/sgaip-0.1.1-py3-none-any.whl` (wheel)

### Step 4: Upload to PyPI

**Option A: With twine (recommended)**

```bash
twine upload dist/sgaip-0.1.1*
```

**Option B: With poetry (if using poetry)**

```bash
poetry publish
```

### Requirements

Before publishing, ensure you have:

1. **PyPI Account**
   - Create at https://pypi.org/account/register/

2. **Build Tools**
   ```bash
   pip install build twine
   ```

3. **PyPI Credentials** (one of):
   - `.pypirc` file with credentials
   - `token` authentication configured
   - Interactive login (will prompt)

### Authentication Methods

**Method 1: API Token (Recommended)**

1. Generate token at: https://pypi.org/manage/account/
2. Configure locally:
   ```bash
   pip install keyring
   keyring set https://upload.pypi.org/legacy/ __token__
   # Paste your __token__YOUR_TOKEN_HERE when prompted
   ```

**Method 2: Username/Password**

1. Create `.pypirc` in home directory:
   ```ini
   [distutils]
   index-servers = pypi

   [pypi]
   username = your_username
   password = your_password
   ```

**Method 3: Interactive Login**

```bash
twine upload dist/*
# Will prompt for username and password
```

---

## Verification

After publishing, verify the package is live:

```bash
# Check PyPI
pip install --upgrade sgaip==0.1.1

# Verify installation
python -c "import sgaip; print(sgaip.__version__)"
```

Should output: `0.1.1`

---

## PyPI Package URL

Once published: https://pypi.org/project/sgaip/0.1.1/

---

## Summary

| Component | Status | Version |
|-----------|--------|---------|
| Python (pyproject.toml) | ✅ Ready | 0.1.1 |
| Python (__init__.py) | ✅ Ready | 0.1.1 |
| JavaScript (package.json) | ✅ Published | 0.1.0 |
| Documentation | ✅ Updated | Current |

---

## Next Steps

1. **Publish Python:** Run `twine upload dist/sgaip-0.1.1*`
2. **Verify:** `pip install sgaip==0.1.1`
3. **Update Docs:** Update CHANGELOG with publication date/time
4. **Tag Release:** `git tag v0.1.1` (if using git)

---

For questions or issues, see [DEVELOPMENT.md](../../DEVELOPMENT.md)
