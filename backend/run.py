import uvicorn
import os
import sys

if __name__ == "__main__":
    # Add backend directory to python path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, backend_dir)
    os.chdir(backend_dir)
    print("Starting Digital Signature Validator Backend Server on http://localhost:8000...")
    print("Swagger API Documentation available at: http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
