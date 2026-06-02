# CLAUDE.md - Project Context & Rules

## Project Overview
- **Name**: Self-growth
- **Repository**: https://github.com/masterfeng123/Self-growth.git
- **Primary Objective**: Personal growth management system with a focus on local server deployment and automated workflows.

## Environment & Tech Stack
- **Languages**: TypeScript / JavaScript
- **Runtime**: Node.js
- **Preferred Tools**: npm (or yarn), zsh
- **Deployment Target**: Local Server (Zhongli Environment)

## Development Guidelines
- **Communication**: Always respond in **Traditional Chinese (繁體中文)**.
- **Code Style**: Maintain consistency with the existing codebase. Use clear, descriptive variable names.
- **Robustness**: Implement proper error handling (`try/catch`) for all asynchronous operations.
- **Architecture**: Follow First Principles. Keep logic modular and avoid unnecessary dependencies.

## Key Commands
- **Install Dependencies**: `npm install`
- **Development Mode**: `npm run dev`
- **Build Project**: `npm run build`
- **Linting**: `npm run lint`
- **Local Start**: `npm start`

## Deployment Instructions (Local Server)
1. **Configuration**: Ensure `.env` is populated based on `.env.example`.
2. **Persistence**: If using a process manager, use PM2:
   ```bash
   pm2 start npm --name "self-growth" -- run start
   ```
3. **Network**: Verify local port bindings and firewall settings for access within the local network.

## Project Structure Reference
- `/src`: Core application logic.
- `/config`: Configuration and environment management.
- `/scripts`: Automation and deployment scripts.
- `/public`: Static assets.

## Specific Task Context
- When asked to develop new features, prioritize scalability and hardware-software synergy where applicable.
- Always check `package.json` for the latest dependency tree before suggesting code changes.
