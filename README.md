# ReSet
ReSet is a mobile application built using React Native and Expo, with a Node.js and Express.js backend and an SQLite database. It aims to provide a structured mobile experience supported by backend APIs and database management.
# ReSet

ReSet is a mobile application project developed using **React Native, Expo, Node.js, Express.js, and SQLite**. The project is organized into a frontend application and a backend server.

## Tech Stack

### Frontend
- React Native
- Expo
- JavaScript
- Node.js package management with npm

### Backend
- Node.js
- Express.js
- SQLite database

## Project Structure

```text
ReSet/
├── app58/
│   ├── assets/
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   ├── package.json
│   └── .gitignore
│
├── backend/
│   ├── package.json
│   └── ... backend source files
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following tools before running the project:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ReSet
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the HTTPS URL of your GitHub repository.

### 2. Set Up the Frontend

Open a terminal in the project root and run:

```bash
cd app58
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Follow the instructions displayed in the terminal to run the application on a compatible device, emulator, or supported development environment.

### 3. Set Up the Backend

Open a separate terminal in Visual Studio Code and run:

```bash
cd backend
npm install
```

Start the backend using the start script defined in `backend/package.json`. For example, if the package defines a `start` script:

```bash
npm start
```

Check the backend configuration and package scripts for the correct startup command and required environment variables.

## Development Notes

- Run the frontend and backend in separate terminals when both are required.
- Keep dependencies in `package.json` and `package-lock.json`.
- Do not commit `node_modules/`, environment files containing secrets, or local database files containing private data.
- Configure the frontend to connect to the backend using the correct development server address.
- Keep API configuration and database settings consistent with the local development environment.

## Version Control

Git is used to track project changes, and GitHub can be used to host the repository.

Typical Git commands:

```bash
git status
git add .
git commit -m "Describe your changes"
git push
```

Ensure that sensitive information and unnecessary generated files are excluded before pushing the project to a public repository.

## License

Refer to the project's `LICENSE` file for licensing information.
