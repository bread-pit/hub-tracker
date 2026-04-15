import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

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

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_TARGET = os.getenv("GITHUB_TARGET", "")  # GitHub user or org whose repos to list
GITHUB_API_URL = "https://api.github.com"

class IssueRequest(BaseModel):
    repo: str
    title: str
    body: Optional[str] = ""
    labels: Optional[List[str]] = []

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    print(f"FastAPI server starting on http://localhost:{port}")
    if not GITHUB_TOKEN:
        print("GITHUB_TOKEN is not set in .env file!")
    uvicorn.run(app, host="0.0.0.0", port=port)
