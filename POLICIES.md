# 📜 SPVM3 CodeForge - Terms, Usage & Security Policies

**Effective Date:** August 26, 2026  

---

## 1. ⚖️ Terms of Use & Open Source License

SPVM3 CodeForge is distributed under the **MIT License**.

- You are free to use, modify, distribute, package, and commercialize CodeForge.
- **Disclaimer**: CodeForge is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.

---

## 2. 🛡️ Security & Subprocess Execution Policy

1. **Subprocess Isolation**: CodeForge provides single-click code execution for system compilers (GCC, Python, Node.js, Java, .NET). Code execution runs with the privileges of the active OS user.
2. **Local AI Safety**: AI code fixes and explanations generated locally are advisory. Review generated code before applying changes to production applications.
3. **Containerized Execution**: For sandboxed execution of unverified scripts, use the integrated Docker container view (`Dockerfile` provided in repository).

---

## 3. 🚨 Responsible Disclosure Policy

If you discover a security vulnerability or bug within SPVM3 CodeForge (such as Electron IPC security flaws or file traversal vulnerabilities):

1. **Do not create a public issue immediately**.
2. Contact the maintainer directly via GitHub repository private advisory or repository contact options.
3. Provide steps to reproduce, expected vs actual behavior, and potential mitigation strategies.

---

## 4. 🐳 Docker & Container Governance

- Official Docker builds must follow the multi-stage build rules outlined in [`Dockerfile`](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/Dockerfile).
- Containerized instances must enforce read-only mount paths for sensitive host system directories.
