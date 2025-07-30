# Secure Database Credentials for Backend Deployment

To keep your MySQL database credentials secure and out of source code, follow these best practices for deployment:

---

## 1. Never Commit Secrets
- **Do not commit** your `.env` file or any file containing secrets to version control.
- Add `.env` to your `.gitignore` file.

## 2. Set Environment Variables on the Server

### Linux (Shell or systemd)
- **Temporary (per shell):**
  ```sh
  export MYSQL_DATABASE_URL='mysql+pymysql://user:password@host:port/dbname'
  ```
- **Persistent (per user):**
  Add the above line to `~/.bashrc` or `~/.profile`.
- **systemd service:**
  Add to your service file:
  ```ini
  [Service]
  Environment="MYSQL_DATABASE_URL=mysql+pymysql://user:password@host:port/dbname"
  ```

### Windows (PowerShell or System Environment)
- **Current user:**
  ```powershell
  [System.Environment]::SetEnvironmentVariable("MYSQL_DATABASE_URL", "mysql+pymysql://user:password@host:port/dbname", "User")
  ```
- **System-wide:**
  ```powershell
  [System.Environment]::SetEnvironmentVariable("MYSQL_DATABASE_URL", "mysql+pymysql://user:password@host:port/dbname", "Machine")
  ```
- **GUI:**
  Use System Properties > Environment Variables to add `MYSQL_DATABASE_URL`.

## 3. Use a Secrets Manager (Recommended for Production)
- For advanced security, use a secrets manager (e.g., AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) to inject environment variables at runtime.

## 4. Limit Access
- Only trusted admins should have access to the deployment server and its environment variables.

---

**Your backend code will automatically read the `MYSQL_DATABASE_URL` from the environment.**

For questions or platform-specific help, contact the backend maintainers.
