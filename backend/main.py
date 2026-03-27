from fastapi import FastAPI
from fastapi.responses import FileResponse
import shutil
import os
from agent_pipeline import run_pipeline
app = FastAPI()

# Simple function to zip a folder
def zip_folder(folder_path: str):
    """Zip a folder and return the zip file path"""
    if not os.path.exists(folder_path):
        return None
    zip_path = shutil.make_archive(folder_path, 'zip', folder_path)
    return zip_path

@app.get("/")
async def home():
    return {"message":"Server is running hahahaha", "status":"online"}


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
    folder_path = os.path.join("../codespace", f"{package_name}")
    
    # Zip the folder
    zip_path = zip_folder(folder_path)
    
    if not zip_path:
        return {"error": "Folder not found"}
    
    # Return zip file
    return FileResponse(
        zip_path, 
        filename=f"{package_name}.zip",
        media_type="application/zip"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
