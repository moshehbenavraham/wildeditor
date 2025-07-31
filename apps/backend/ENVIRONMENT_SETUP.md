# Environment Setup Instructions

## 🔒 Security Notice
**NEVER commit .env files to git!** They contain sensitive credentials.

## 📝 Setup Steps

### **For Local Development:**

1. **Copy the example file:**
   ```bash
   cd apps/backend
   cp .env.development.example .env.development
   ```

2. **Edit `.env.development` with your actual values:**
   ```bash
   # Replace these with your actual database credentials:
   MYSQL_DATABASE_URL=mysql+pymysql://wildeditor_dev_user:YOUR_ACTUAL_PASSWORD@localhost:3306/luminari_muddev
   DB_PASSWORD=YOUR_ACTUAL_PASSWORD
   SECRET_KEY=your_actual_development_secret_key
   ```

### **For Server Deployment:**

**Option 1: Environment Variables (Recommended)**
Set these environment variables on your server:

```bash
# Add to ~/.bashrc or ~/.profile
export MYSQL_DATABASE_URL="mysql+pymysql://wildeditor_dev_user:YOUR_ACTUAL_PASSWORD@localhost:3306/luminari_muddev"
export ENVIRONMENT="development"
export DEBUG="true"
export PORT="8000"
export FRONTEND_URL="http://localhost:5173"
export LOG_LEVEL="DEBUG"
export WORKERS="2"
export ENABLE_DOCS="true"

# Reload the profile
source ~/.bashrc
```

**Option 2: Docker Environment File**
If you prefer using a file (less secure but easier):

```bash
# Create environment file on server
sudo mkdir -p /opt/wildeditor-backend
sudo cp apps/backend/.env.development.example /opt/wildeditor-backend/.env.development

# Edit with actual values
sudo nano /opt/wildeditor-backend/.env.development

# Set proper permissions
sudo chmod 600 /opt/wildeditor-backend/.env.development
sudo chown $USER:$USER /opt/wildeditor-backend/.env.development
```

## 🚀 GitHub Actions Setup

The GitHub Actions workflow now expects these environment variables to be set on your server:
- `MYSQL_DATABASE_URL` - The main database connection string
- Other variables are set automatically by the workflow

## 🔍 Verification

Test your environment setup:
```bash
# Check if environment variables are set
echo $MYSQL_DATABASE_URL

# Test the backend
cd apps/backend
python -c "
import os
from dotenv import load_dotenv
load_dotenv('.env.development')
print('MYSQL_DATABASE_URL:', os.getenv('MYSQL_DATABASE_URL', 'NOT SET'))
"
```

## 📋 Required Environment Variables

### **Development:**
- `MYSQL_DATABASE_URL` - Database connection string
- `ENVIRONMENT=development`
- `DEBUG=true`
- `PORT=8000`
- `FRONTEND_URL=http://localhost:5173`

### **Production:**
- `MYSQL_DATABASE_URL` - Production database connection string
- `ENVIRONMENT=production`
- `DEBUG=false`
- `PORT=8000`
- `FRONTEND_URL=https://wildeditor.luminari.com`
- `SECRET_KEY` - Secure secret key for production

## 🛡️ Security Best Practices

1. **Never commit .env files**
2. **Use strong passwords**
3. **Different credentials for dev/prod**
4. **Limit database user permissions**
5. **Use environment variables on servers**
6. **Rotate secrets regularly**
