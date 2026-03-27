from fastapi import FastAPI,BackgroundTasks
from fastapi.responses import FileResponse
from utils.buddle_utils import zip_folder,cleanup_files
import os

from agent_pipeline import run_pipeline
app = FastAPI()


@app.get("/")
async def home():
    return {"message":"Server is running hahahaha", "status":"online"}


@app.get("/download/{package_name}")
async def download(package_name: str, background_tasks: BackgroundTasks):
    zip_path = os.path.join("./codespace", f"{package_name}.zip")

    if not os.path.exists(zip_path):
        return {"error": "File not found"}

   # background_tasks.add_task(cleanup_files, package_name)

    return FileResponse(
        zip_path,
        filename=f"{package_name}.zip",
        media_type="application/zip"
    )



# POST route to receive package name and return zip
@app.post("/generate")
async def generate(package_name: str):
    """Receive package name and return zipped package"""

    # WRITE LOGIC TO CALL THE AGENTS
    print("here iam flag ",package_name, flush=True)
    print("here iam flag 0 ",flush=True)

    run_pipeline(package_name=package_name)
    print("here iam flag 1 ")
    # Construct folder path
    folder_path = os.path.join("./codespace", f"{package_name}")
    
    # Zip the folder
    zip_path = zip_folder(folder_path)
    
    if not zip_path:
        return {"error": "Zip failed"}

    return {
        "message": "Package ready ✅",
        "download_url": f"http://localhost:8000/download/{package_name}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
