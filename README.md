# HubTracker — GitHub Issue Creator

An application to submit issues directly to GitHub repositories without leaving the app.

## Project Structure

- `/frontend`: React + Vite + Tailwind CSS v4
  - `src/components/ui`: Reusable UI elements (Button, Input, Banner)
  - `src/components/github`: Repository-specific components (LabelSelector)
  - `src/components`: Page-level components (Header)
- `/backend`: Python + FastAPI + httpx

---

## 🚀 How to Run

### 1. Configure GitHub Token

Before running the servers, set up your GitHub Personal Access Token (PAT).

1. Go to `backend/.env`.
2. Set your token: `GITHUB_TOKEN=ghp_your_secret_token_here`.
3. (Optional) Change the `PORT` if 5000 is occupied.

### 2. Start the Backend (Python)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   # Windows
   .\venv\Scripts\activate
   ```
3. Install dependencies (if not already done):
   ```bash
   pip install fastapi uvicorn httpx python-dotenv
   ```
4. Run the server:
   ```bash
   python main.py
   ```
   _The backend will be live at http://localhost:5000_

### 3. Start the Frontend (Node.js)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   _Follow the link provided in the terminal (usually http://localhost:5173)_

---

## 🛠 Features

- **FastAPI Backend**: Async requests to GitHub API.
- **Tailwind v4**: Next-gen styling with a sleek dark theme.
- **Security**: GitHub tokens are stored on the server side (`.env`), never exposed to the browser.
- **Markdown Support**: Preview your issue body before submitting.

## 📄 API Docs

Once the backend is running, visit:

- [Interactive Docs (Swagger UI)](http://localhost:5000/docs)
- [Alternative Docs (Redoc)](http://localhost:5000/redoc)
