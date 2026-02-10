import kagglehub
from kagglehub import KaggleDatasetAdapter
import shutil
import os

def download_ecg_data():
    print("Downloading requested ECG Dataset (devavratatripathy/ecg-dataset)...")
    
    # Download latest version
    path = kagglehub.dataset_download("devavratatripathy/ecg-dataset")
    
    print("Path to dataset files:", path)
    
    # Load and validate with Pandas as requested
    print("Validating dataset records...")
    df = kagglehub.dataset_load(
        KaggleDatasetAdapter.PANDAS,
        "devavratatripathy/ecg-dataset",
        "ecg.csv", # Specify the filename in the dataset
    )
    print("First 5 records of ecg.csv:")
    print(df.head())
    
    # Define target directory
    target_dir = os.path.join(os.getcwd(), "backend/data/ecg_dataset")
    
    # Create target directory if it doesn't exist
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        
    # Move files to target directory
    for file_name in os.listdir(path):
        full_file_name = os.path.join(path, file_name)
        if os.path.isfile(full_file_name):
            shutil.copy(full_file_name, target_dir)
            print(f"Copied {file_name} to {target_dir}")
            
    print("Dataset integration and validation complete.")

if __name__ == "__main__":
    download_ecg_data()
