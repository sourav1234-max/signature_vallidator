import os
import tempfile
from datetime import datetime, timedelta, timezone
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
    from pyhanko.sign import fields, signers
    HAVE_SIGNING = True
except ImportError:
    HAVE_SIGNING = False

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "sample_pdfs")
os.makedirs(OUT_DIR, exist_ok=True)


def create_plain_pdf(filename: str, title: str):
    path = os.path.join(OUT_DIR, filename)
    c = canvas.Canvas(path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, title)
    c.setFont("Helvetica", 10)
    c.drawString(50, 730, f"Generated for testing on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(50, 700, "This document contains sample content for signature verification tests.")
    c.drawString(50, 680, "Document SHA-256 and digital signature integrity checks will evaluate this file.")
    c.showPage()
    c.save()
    return path


def generate_self_signed_cert():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, "Government Digital Signer CA"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Dept of Electronics & IT"),
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
    ])
    now = datetime.now(timezone.utc)
    cert = x509.CertificateBuilder().subject_name(
        name
    ).issuer_name(
        name
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        now - timedelta(days=1)
    ).not_valid_after(
        now + timedelta(days=365)
    ).sign(key, hashes.SHA256())
    
    key_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)
    
    return key_pem, cert_pem


def sign_pdf_file(input_pdf: str, output_pdf: str):
    if not HAVE_SIGNING:
        print("Cryptography/pyHanko not installed for signing.")
        return
        
    key_pem, cert_pem = generate_self_signed_cert()
    
    # Save temp PEM files for pyHanko SimpleSigner.load
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pem") as kf:
        kf.write(key_pem)
        key_path = kf.name
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pem") as cf:
        cf.write(cert_pem)
        cert_path = cf.name

    try:
        signer = signers.SimpleSigner.load(
            key_file=key_path,
            cert_file=cert_path,
            key_passphrase=None
        )
        
        with open(input_pdf, 'rb') as inf:
            w = IncrementalPdfFileWriter(inf)
            fields.append_signature_field(
                w, sig_field_spec=fields.SigFieldSpec(sig_field_name="Signature1")
            )
            meta = signers.PdfSignatureMetadata(field_name="Signature1")
            with open(output_pdf, 'wb') as outf:
                signers.sign_pdf(
                    w,
                    meta,
                    signer=signer,
                    output=outf
                )
    finally:
        if os.path.exists(key_path):
            os.remove(key_path)
        if os.path.exists(cert_path):
            os.remove(cert_path)


def main():
    print("Generating sample PDFs...")
    # 1. Unsigned PDF
    unsigned_path = create_plain_pdf("unsigned_document.pdf", "OFFICIAL NOTICE - UNSIGNED DRAFT")
    print(f"Created: {unsigned_path}")

    # 2. Valid Signed PDF
    temp_pdf = create_plain_pdf("temp_for_signing.pdf", "GOVERNMENT DIGITAL DECREE - VALID SIGNED")
    valid_signed_path = os.path.join(OUT_DIR, "valid_signed_document.pdf")
    try:
        sign_pdf_file(temp_pdf, valid_signed_path)
        print(f"Created: {valid_signed_path}")
        if os.path.exists(temp_pdf):
            os.remove(temp_pdf)
    except Exception as e:
        print(f"Error creating valid signed PDF: {e}")

    # 3. Modified Signed PDF
    modified_signed_path = os.path.join(OUT_DIR, "modified_signed_document.pdf")
    if os.path.exists(valid_signed_path):
        with open(valid_signed_path, "rb") as f:
            data = f.read()
        corrupted_data = data + b"\n% TAMPERED CONTENT APPENDED AFTER SIGNATURE \n"
        with open(modified_signed_path, "wb") as f:
            f.write(corrupted_data)
        print(f"Created: {modified_signed_path}")

if __name__ == "__main__":
    main()
