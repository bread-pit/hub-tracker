import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException, Request, UploadFile, File

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="HubTracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files to serve uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_TARGET = os.getenv("GITHUB_TARGET", "")  # GitHub user or org whose repos to list
GITHUB_API_URL = "https://api.github.com"

class IssueRequest(BaseModel):
    repo: str
    title: str
    body: Optional[str] = ""
    labels: Optional[List[str]] = []

class UploadResponse(BaseModel):
    url: str
    message: str

@app.get("/health")
def health_check():
    return {"status": "ok", "backend": "python/fastapi"}

@app.get("/api/repos")
async def get_repos():
    if not GITHUB_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="GITHUB_TOKEN is not configured on the server."
        )
    if not GITHUB_TARGET:
        raise HTTPException(
            status_code=500,
            detail="GITHUB_TARGET is not configured on the server."
        )

    username = GITHUB_TARGET

    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "HubTracker-App"
    }

    async with httpx.AsyncClient() as client:
        try:
            # Step 1: resolve who owns the token
            me_res = await client.get(f"{GITHUB_API_URL}/user", headers=headers)
            token_owner = me_res.json().get("login", "") if me_res.status_code == 200 else ""

            # Step 2: look up the target account to determine its type
            profile_res = await client.get(f"{GITHUB_API_URL}/users/{username}", headers=headers)
            if profile_res.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub user or org '{username}' not found.")

            account_type = profile_res.json().get("type", "User")  # "User" or "Organization"

            # Step 3: choose the right endpoint
            if username.lower() == token_owner.lower():
                # Authenticated user's own account — full access (public + private)
                url = f"{GITHUB_API_URL}/user/repos?sort=updated&per_page=100&type=owner"
            elif account_type == "Organization":
                # Org the token may have access to — returns all repos the token can see
                url = f"{GITHUB_API_URL}/orgs/{username}/repos?sort=updated&per_page=100&type=all"
            else:
                # Another individual — GitHub only exposes their public repos
                url = f"{GITHUB_API_URL}/users/{username}/repos?sort=updated&per_page=100"

            response = await client.get(url, headers=headers)

            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"'{username}' not found.")
            if response.status_code == 200:
                repos = response.json()
                # For orgs, keep all accessible repos; for users, keep only repos they own
                if account_type != "Organization":
                    repos = [r for r in repos if r["owner"]["login"].lower() == username.lower()]
                return [
                    {
                        "id": r["id"],
                        "full_name": r["full_name"],
                        "name": r["name"],
                        "description": r.get("description") or "",
                        "stars": r["stargazers_count"],
                        "language": r.get("language") or "",
                        "fork": r.get("fork", False),
                        "private": r.get("private", False)
                    } for r in repos
                ]
            else:
                error_data = response.json()
                detail = error_data.get("message", "Error fetching repositories from GitHub")
                raise HTTPException(status_code=response.status_code, detail=detail)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Network error while fetching repositories: {str(exc)}")
@app.post("/api/issues")
async def create_issue(issue: IssueRequest):
    if not GITHUB_TOKEN:
        raise HTTPException(
            status_code=500, 
            detail="GITHUB_TOKEN is not configured on the server."
        )

    # Repository should be in 'owner/repo' format
    url = f"{GITHUB_API_URL}/repos/{issue.repo}/issues"
    
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "HubTracker-App"
    }
    
    payload = {
        "title": issue.title,
        "body": issue.body,
        "labels": issue.labels
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code == 201:
                data = response.json()
                return {
                    "message": "Issue created successfully",
                    "html_url": data.get("html_url"),
                    "number": data.get("number")
                }
            else:
                # Handle GitHub API errors
                error_data = response.json()
                detail = error_data.get("message", "Error communicating with GitHub API")
                raise HTTPException(status_code=response.status_code, detail=detail)
                
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting {exc.request.url!r}.")

@app.post("/api/upload", response_model=UploadResponse)
async def upload_image(request: Request, file: UploadFile = File(...)):
    try:
        # Generate a unique filename to avoid collisions
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the file locally
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Construct the URL. Use request.base_url as fallback
        # If the app is behind a proxy, base_url should follow the proxy headers
        base_url = str(request.base_url).rstrip("/")
        file_url = f"{base_url}/uploads/{unique_filename}"
        
        # Log for debugging
        print(f"File saved to {file_path}")
        print(f"Accessible at {file_url}")
        
        return UploadResponse(url=file_url, message="Image uploaded successfully")
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    print(f"FastAPI server starting on http://localhost:{port}")
    if not GITHUB_TOKEN:
        print("GITHUB_TOKEN is not set in .env file!")
    uvicorn.run(app, host="0.0.0.0", port=port)
