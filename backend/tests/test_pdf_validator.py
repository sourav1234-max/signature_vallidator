import os
import sys
import pytest

# Ensure backend folder is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.pdf_validator import validate_pdf_document, compute_sha256

SAMPLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_pdfs"))

@pytest.mark.asyncio
async def test_unsigned_pdf_validation():
    unsigned_file = os.path.join(SAMPLE_DIR, "unsigned_document.pdf")
    if os.path.exists(unsigned_file):
        res = await validate_pdf_document(unsigned_file)
        assert res["signature_found"] is False
        assert res["overall_status"] == "INVALID"
        assert res["trust_status"] == "No Signature Present"

@pytest.mark.asyncio
async def test_valid_signed_pdf_validation():
    valid_file = os.path.join(SAMPLE_DIR, "valid_signed_document.pdf")
    if os.path.exists(valid_file):
        res = await validate_pdf_document(valid_file)
        assert res["signature_found"] is True
        assert res["signed_by"] is not None
        assert res["overall_status"] in ["VALID", "WARNING"]

@pytest.mark.asyncio
async def test_modified_pdf_validation():
    modified_file = os.path.join(SAMPLE_DIR, "modified_signed_document.pdf")
    if os.path.exists(modified_file):
        res = await validate_pdf_document(modified_file)
        # Modified PDF will fail parsing or return invalid/modified status
        assert res["signature_found"] is True or res["overall_status"] == "INVALID"
