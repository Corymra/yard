# YARD — Yard Access & Retrieval Directory

**A privacy-preserving access code directory for fast, reliable coordination across distributed physical locations.**

---

## Overview

YARD is a lightweight, local-only web application designed to securely store, retrieve, and manage access codes tied to physical locations such as yards, gates, barns, storage areas, facilities, or operational sites.

The system is intentionally:

- **Fast** — instant lookup and editing  
- **Private** — all data stored locally on the device  
- **Simple** — zero accounts, servers, or dependencies  
- **Portable** — runs anywhere a browser exists  

YARD enables real-world coordination of physical access without introducing cloud risk, credential exposure, or infrastructure overhead.

---

## Key Features

### Secure Local Storage
All location names and access codes are stored **only on the user’s device** using browser local storage.  
No data is transmitted, shared, or externally accessible.

### Instant Retrieval
Search any saved location and retrieve its access code immediately — optimized for real operational use where time matters.

### Full Location Management
- Add new locations and codes  
- Edit existing entries  
- Delete outdated records  
- Export stored data  
- Bulk import structured lists  

### Bulk Import Intelligence
- Accepts multiple input formats:
  - `LOCATION, CODE`
  - `LOCATION = CODE`
- **Duplicate locations are ignored after the first occurrence**
- **Location matching is case-insensitive**
  - `shop`, `Shop`, and `SHOP` are treated as the same location

### Zero Infrastructure
No:

- Servers  
- Databases  
- Logins  
- Installers  
- Network dependency  

Just open and use.

---

## Use Cases

YARD is intentionally **industry-agnostic** and applicable anywhere physical access coordination exists, including:

- Equipment or storage yards  
- Agricultural barns or properties  
- Construction sites  
- Fleet or logistics facilities  
- Warehouses and gated lots  
- Multi-site operational environments  

Any scenario where **people must quickly access secured physical locations** can benefit from YARD.

---

## Privacy & Security Philosophy

YARD follows a strict **local-first** design:

- No analytics  
- No tracking  
- No remote storage  
- No credential transmission  

Each deployment is **self-contained** to the device using it.

This makes YARD suitable for environments where:

- Connectivity is unreliable  
- Privacy is critical  
- Simplicity is required  

---

## Technology

YARD is built using:

- HTML  
- CSS  
- Vanilla JavaScript  
- Browser Local Storage  

No frameworks.  
No build process.  
No external dependencies.

---

## Deployment

YARD can run:

- Directly from local files  
- On internal networks  
- Via static hosting (e.g., GitHub Pages)  
- From QR-code distribution to mobile devices  

Because it is fully static, deployment is **instant and universal**.

---

## Design Goals

YARD was created to prove that:

> Small, focused tools solving real physical-world problems  
> can be more valuable than complex software systems.

Primary goals:

- Reliability in real environments  
- Minimal cognitive load  
- Maximum portability  
- Absolute user privacy  

---

## Status

**Production-ready and field-tested.**

Actively used in real operational workflows for:

- Location access coordination  
- Rapid code retrieval  
- Multi-site navigation support  

---

## Author

**Software design by VAALOKTEC Systems™**

---

## License

This project is released for open operational use.
