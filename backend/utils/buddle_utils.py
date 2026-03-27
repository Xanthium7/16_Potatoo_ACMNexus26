import shutil
import os
# Simple function to zip a folder
def zip_folder(folder_path: str):
    print("zipping folder ", folder_path, flush=True)
    """Zip a folder and return the zip file path"""
    if not os.path.exists(folder_path):
        return None
    zip_path = shutil.make_archive(folder_path, 'zip', folder_path)
    return zip_path


def cleanup_files(package_name: str):
    folder_path = os.path.join("./codespace", package_name)
    zip_path = os.path.join("./codespace", f"{package_name}.zip")

    # delete folder
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)

    # delete zip
    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"🧹 Cleaned up {package_name}", flush=True)

