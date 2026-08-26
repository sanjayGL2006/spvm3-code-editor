# 🔒 SPVM3 CodeForge - Privacy Policy

**Effective Date:** August 26, 2026  
**Last Updated:** August 26, 2026  

At **SPVM3 CodeForge**, we believe that code privacy, local autonomy, and data sovereignty are fundamental rights for developer productivity. CodeForge is designed from the ground up as a **local-first desktop IDE**.

---

## 1. 🛡️ Core Privacy Commitments

1. **Zero External Data Egress**: Your source code, workspace structure, files, configurations, and edits **never leave your local machine**.
2. **No User Tracking or Telemetry**: CodeForge contains **zero telemetry pings, zero usage tracking, zero crash analytics collection**, and zero cookies.
3. **No Mandated Accounts or Subscriptions**: You do not need to register, create an account, or log in to use any feature of CodeForge.

---

## 2. 🧠 Local AI & RAG Indexing Privacy

- **Local LLM Execution**: When utilizing the integrated AI Agent (via Ollama or local LLM runtimes), all model prompts, context parsing, and code explanations are processed **100% locally** on your device's hardware.
- **No Cloud API Transmission**: Prompt inputs, generated completions, and diagnostic fixes are not sent to any cloud server or third-party AI provider unless you explicitly configure an external API endpoint.
- **In-Memory Symbol Indexing**: The Local RAG Code Indexer processes symbols (functions, classes, variables, DOM IDs, CSS classes) in local memory and caches vector structures on your disk locally (`.spvm3/` or application storage).

---

## 3. 📂 Local Storage & File Access

- CodeForge accesses only the files and workspace directories that you explicitly open.
- Settings, themes, layout preferences, and recent file lists are stored locally in standard OS config locations (`%APPDATA%` on Windows, `~/.config` on Linux/macOS).

---

## 4. 🌐 Network Communications & Third-Party Dependencies

CodeForge makes outbound network connections **only** under the following user-initiated scenarios:

- **Local Ollama Connector**: Communicates strictly with `http://localhost:11434` for local LLM inference.
- **Language Runtimes & Package Managers**: Command execution (e.g., `npm install`, `pip install`, `cargo build`) communicates with standard package registries as directed by your terminal commands.
- **Git Source Control**: Pushing or pulling commits (`git push`, `git fetch`) connects directly to your specified remote Git repository (e.g., GitHub, GitLab) using standard Git protocols.

---

## 5. 🔐 Security & Sandboxing

CodeForge executes subprocesses and system compilers (e.g., `python`, `gcc`, `javac`, `node`) directly on your system under your active user account permissions. We recommend running untrusted user scripts inside containerized environments (such as Docker).

---

## 6. 📧 Contact & Governance

If you have questions regarding privacy, local data storage, or security practices in SPVM3 CodeForge:
- **Repository**: [https://github.com/sanjayGL2006/spvm3-code-editor](https://github.com/sanjayGL2006/spvm3-code-editor)
- **Maintainer**: Sanjay G L
