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
   # or root, ubuntu, centos, etc. depending on your setup
   ```

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
ssh -v -i ~/.ssh/wildeditor_deploy user@server
```

### Check server logs:
```bash
sudo tail -f /var/log/auth.log
# or
sudo journalctl -f -u ssh
```
