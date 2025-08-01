# SSH Setup Guide for CI/CD Deployment

## Generate SSH Key Pair

On your local machine or in a secure environment:

```bash
# Generate a new SSH key pair specifically for CI/CD
ssh-keygen -t ed25519 -f ~/.ssh/wildeditor_deploy -N ""

# Or use RSA if ed25519 is not supported
ssh-keygen -t rsa -b 4096 -f ~/.ssh/wildeditor_deploy -N ""
```

This creates two files:
- `wildeditor_deploy` (private key - add to GitHub secrets)
- `wildeditor_deploy.pub` (public key - add to server)

## Server Setup

### Create deployment user (if needed)
```bash
# As root, create a dedicated user for deployments
sudo useradd -m -s /bin/bash wildedit

# Set a password (optional, since we'll use SSH keys)
sudo passwd wildedit

# Create SSH directory for the user
sudo mkdir -p /home/wildedit/.ssh
sudo chown wildedit:wildedit /home/wildedit/.ssh
sudo chmod 700 /home/wildedit/.ssh
```

1. **Copy the public key to your server:**
```bash
# Copy the public key content
cat ~/.ssh/wildeditor_deploy.pub

# On your server, add it to the wildedit user's authorized_keys
sudo mkdir -p /home/wildedit/.ssh
echo "your-public-key-content-here" | sudo tee -a /home/wildedit/.ssh/authorized_keys
sudo chown -R wildedit:wildedit /home/wildedit/.ssh
sudo chmod 700 /home/wildedit/.ssh
sudo chmod 600 /home/wildedit/.ssh/authorized_keys
```

2. **Test the SSH connection locally:**
```bash
ssh -i ~/.ssh/wildeditor_deploy wildedit@your-server-ip
```

## GitHub Secrets Setup

Add these secrets to your repository (Settings → Secrets and variables → Actions):

1. **PRODUCTION_SSH_KEY**
   ```bash
   # Copy the entire private key content
   cat ~/.ssh/wildeditor_deploy
   ```
   Paste the entire content (including `-----BEGIN...` and `-----END...` lines)

2. **PRODUCTION_HOST**
   ```
   your-server-ip-or-domain.com
   ```

3. **PRODUCTION_USER**
   ```
   wildedit
   ```

4. **MYSQL_DATABASE_URL** (Recommended - store database credentials securely)
   ```
   mysql+pymysql://username:password@host:port/database_name
   # Example: mysql+pymysql://wildeditor:secretpassword@localhost:3306/wildeditor_db
   ```

5. **FRONTEND_URL** (Optional - for CORS configuration)
   ```
   https://your-frontend-domain.com
   # Example: https://wildeditor.luminari.com
   ```

### Security Benefits of Using GitHub Secrets

- **Encrypted storage**: Secrets are encrypted and only decrypted during workflow execution
- **No server-side storage**: Database credentials never stored on the server filesystem
- **Audit trail**: Changes to secrets are logged
- **Access control**: Only authorized workflows can access secrets
- **Environment isolation**: Different secrets for different environments (dev/staging/prod)

### Important Notes

- **Always use `wildedit` as your deployment user** - This guide assumes you've created the `wildedit` user as shown in the Server Setup section
- **Test locally first** - Always verify SSH connection works locally before running CI/CD
- **Use strong passwords** - Even though you're using SSH keys, set a strong password for the `wildedit` user account

## Server Requirements

Ensure your server has:
- Docker installed and running
- User has sudo privileges (or is root)
- SSH service running on port 22
- Firewall allows SSH connections

## Setting Up Sudo Permissions for wildedit User

If you're using a dedicated `wildedit` user for deployment, you'll need to grant sudo permissions:

### Method 1: Add user to sudo group (Ubuntu/Debian)
```bash
# As root or a user with sudo privileges
sudo usermod -aG sudo wildedit

# Verify the user is in the sudo group
groups wildedit
```

### Method 2: Add user to wheel group (CentOS/RHEL/Rocky Linux)
```bash
# As root or a user with sudo privileges
sudo usermod -aG wheel wildedit

# Verify the user is in the wheel group
groups wildedit
```

### Method 3: Add specific sudoers entry (All distributions)
```bash
# Edit the sudoers file safely
sudo visudo

# Add this line at the end of the file:
wildedit ALL=(ALL) NOPASSWD: ALL

# Or for password-required sudo:
wildedit ALL=(ALL:ALL) ALL
```

### Method 4: Create a sudoers drop-in file (Recommended)
```bash
# Create a dedicated sudoers file for the wildedit user
sudo tee /etc/sudoers.d/wildedit << EOF
# Allow wildedit user to run docker and deployment commands without password
wildedit ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/systemctl, /bin/mkdir, /bin/chmod, /bin/chown
EOF

# Set proper permissions
sudo chmod 0440 /etc/sudoers.d/wildedit

# Test the configuration
sudo visudo -c
```

### Verify sudo access
```bash
# Switch to the wildedit user
sudo su - wildedit

# Test sudo access
sudo docker --version
sudo systemctl status docker
```

### Security Note
For production deployments, it's more secure to grant only specific sudo permissions rather than full sudo access. The Method 4 approach above only allows specific commands needed for deployment.

## Troubleshooting

### Common CI/CD SSH Issues

If you're getting "Permission denied (publickey,password)" errors in GitHub Actions:

1. **Verify GitHub Secrets are set correctly:**
   - `PRODUCTION_SSH_KEY`: Contains the complete private key (including header/footer)
   - `PRODUCTION_HOST`: Your server's IP or domain
   - `PRODUCTION_USER`: Should be set to `wildedit`

2. **Check the private key format in GitHub Secrets:**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [key content]
   -----END OPENSSH PRIVATE KEY-----
   ```
   Make sure there are no extra spaces or missing newlines.

3. **Test SSH connection locally first:**
   ```bash
   # Test with the same key and user that CI/CD will use
   ssh -i ~/.ssh/wildeditor_deploy wildedit@your-server-ip
   ```

4. **Common permission issues on server:**
   ```bash
   # Fix permissions on server
   sudo chmod 700 /home/wildedit/.ssh
   sudo chmod 600 /home/wildedit/.ssh/authorized_keys
   sudo chown -R wildedit:wildedit /home/wildedit/.ssh
   
   # Verify the authorized_keys content
   sudo cat /home/wildedit/.ssh/authorized_keys
   ```

### Check SSH service on server:
```bash
sudo systemctl status ssh
sudo systemctl status sshd
```

### Check authorized_keys permissions:
```bash
ls -la ~/.ssh/
# Should show:
# drwx------ for .ssh directory (700)
# -rw------- for authorized_keys file (600)
```

### Test connection with verbose output:
```bash
ssh -v -i ~/.ssh/wildeditor_deploy wildedit@your-server-ip
```

### Check server logs:
```bash
sudo tail -f /var/log/auth.log
# or
sudo journalctl -f -u ssh
```

### Debug GitHub Actions SSH Issues

Add this debug step to your workflow to troubleshoot:
```yaml
- name: Debug SSH setup
  run: |
    echo "Testing SSH key fingerprint..."
    ssh-keygen -lf ~/.ssh/id_rsa || echo "No default key"
    echo "Testing connection with verbose output..."
    ssh -vvv -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${{ secrets.PRODUCTION_USER }}@${{ secrets.PRODUCTION_HOST }} "echo 'test'" || true
```

### Database Connection Issues

If your container starts but fails health checks, it might be a database connection issue:

1. **Test database connection format:**
   ```bash
   # The MYSQL_DATABASE_URL should be in this format:
   mysql+pymysql://username:password@host:port/database_name
   
   # For local MySQL:
   mysql+pymysql://root:password@localhost:3306/wildeditor_db
   
   # For remote MySQL:
   mysql+pymysql://user:pass@mysql.example.com:3306/dbname
   ```

2. **Check container logs for database errors:**
   ```bash
   # On your server, check container logs
   sudo docker logs wildeditor-backend
   
   # Look for database connection errors like:
   # - "Access denied for user"
   # - "Unknown database"
   # - "Can't connect to MySQL server"
   ```

3. **Test database connectivity from server:**
   ```bash
   # Install MySQL client on server to test connection
   sudo apt install mysql-client
   
   # Test connection (replace with your credentials)
   mysql -h your-db-host -u your-username -p your-database
   ```

4. **Common database URL issues:**
   - Missing port number (default MySQL port is 3306)
   - Wrong username/password
   - Database name doesn't exist
   - Firewall blocking database port
   - SSL/TLS configuration issues
