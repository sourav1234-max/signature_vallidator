import io
import json
import csv
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


def generate_qr_code_image(data: str) -> io.BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def generate_pdf_certificate(report_data: dict, document_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0F172A'),
        alignment=0,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=8
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor('#334155')
    )

    cell_text = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header section with Title & Verification ID
    report_id = report_data.get('id', 'N/A')
    created_at = report_data.get('created_at', datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"))
    overall_status = report_data.get('overall_status', 'INVALID')
    
    story.append(Paragraph("DIGITAL SIGNATURE VERIFICATION CERTIFICATE", title_style))
    story.append(Paragraph(f"Official Validation Report • ID: {report_id} • Generated: {created_at}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

    # Status Banner
    status_bg = colors.HexColor('#DCFCE7') if overall_status == 'VALID' else (colors.HexColor('#FEF9C3') if overall_status == 'WARNING' else colors.HexColor('#FEE2E2'))
    status_text_color = colors.HexColor('#15803D') if overall_status == 'VALID' else (colors.HexColor('#A16207') if overall_status == 'WARNING' else colors.HexColor('#B91C1C'))
    
    status_paragraph = Paragraph(
        f"<font size=14 color='{status_text_color.hexval()}'><b>OVERALL STATUS: {overall_status}</b></font><br/>"
        f"<font size=9 color='#475569'>Trust Status: {report_data.get('trust_status', 'N/A')}</font>",
        styles['Normal']
    )
    
    status_table = Table([[status_paragraph]], colWidths=[530])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), status_bg),
        ('PADDING', (0,0), (-1,-1), 12),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 15))

    # Document & Signature Details Table
    story.append(Paragraph("Document & Signature Attributes", section_heading))
    
    details_data = [
        [Paragraph("Document Name", cell_bold), Paragraph(str(document_data.get('filename', 'N/A')), cell_text)],
        [Paragraph("Document Hash (SHA-256)", cell_bold), Paragraph(str(document_data.get('sha256_hash', 'N/A')), cell_text)],
        [Paragraph("File Size & Pages", cell_bold), Paragraph(f"{round(document_data.get('file_size', 0)/1024, 2)} KB ({document_data.get('page_count', 1)} Pages)", cell_text)],
        [Paragraph("Digital Signature Found", cell_bold), Paragraph("Yes" if report_data.get('signature_found') else "No", cell_text)],
        [Paragraph("Cryptographic Signature", cell_bold), Paragraph("Valid (Intact)" if report_data.get('signature_valid') else "Invalid / Corrupted", cell_text)],
        [Paragraph("Document Integrity", cell_bold), Paragraph("Not Modified" if not report_data.get('document_modified') else "Modified After Signing", cell_text)],
        [Paragraph("Signed By (Subject CN)", cell_bold), Paragraph(str(report_data.get('signed_by', 'N/A')), cell_text)],
        [Paragraph("Certificate Issuer (CA)", cell_bold), Paragraph(str(report_data.get('certificate_issuer', 'N/A')), cell_text)],
        [Paragraph("Certificate Serial Number", cell_bold), Paragraph(str(report_data.get('certificate_serial', 'N/A')), cell_text)],
        [Paragraph("Signing Date & Time", cell_bold), Paragraph(str(report_data.get('signing_time', 'N/A')), cell_text)],
        [Paragraph("Certificate Expiry Date", cell_bold), Paragraph(str(report_data.get('certificate_expiry', 'N/A')), cell_text)],
        [Paragraph("Validation Performance", cell_bold), Paragraph(f"{report_data.get('validation_time_ms', 0)} ms", cell_text)]
    ]
    
    table = Table(details_data, colWidths=[170, 360])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(table)
    story.append(Spacer(1, 15))

    # Verification Summary Checklist
    story.append(Paragraph("Verification Summary Checklist", section_heading))
    checklist_raw = report_data.get('summary_checklist', [])
    if isinstance(checklist_raw, str):
        try:
            checklist_items = json.loads(checklist_raw)
        except Exception:
            checklist_items = []
    else:
        checklist_items = checklist_raw or []
        
    chk_rows = []
    for item in checklist_items:
        status_symbol = "✓ PASS" if item.get('status') == 'PASS' else "✗ FAIL"
        sym_color = "#16A34A" if item.get('status') == 'PASS' else "#DC2626"
        chk_rows.append([
            Paragraph(f"<font color='{sym_color}'><b>{status_symbol}</b></font>", cell_bold),
            Paragraph(item.get('label', ''), cell_text)
        ])
    
    if not chk_rows:
        chk_rows.append([Paragraph("N/A", cell_bold), Paragraph("No items evaluated", cell_text)])
        
    chk_table = Table(chk_rows, colWidths=[80, 450])
    chk_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 15))

    # QR Code & Audit Seal Section
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=10))
    
    qr_url = f"https://validator.domain/report/{report_id}"
    qr_img_buffer = generate_qr_code_image(qr_url)
    qr_img = Image(qr_img_buffer, width=1.1*inch, height=1.1*inch)
    
    seal_text = Paragraph(
        "<b>OFFICIAL VALIDATION AUDIT TRAIL</b><br/>"
        f"Certificate ID: <b>{report_id}</b><br/>"
        "This document certifies that the uploaded digital PDF signature was evaluated using high-precision cryptographic algorithms (pyHanko / X.509 standard).<br/>"
        "Scan the QR code to verify this certificate on the validation server.",
        styles['Normal']
    )
    
    qr_table = Table([[qr_img, seal_text]], colWidths=[100, 430])
    qr_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(qr_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_json_report(report_data: dict, document_data: dict) -> str:
    combined = {
        "metadata": {
            "application": "Digital Signature Validator",
            "version": "1.0.0",
            "generated_at": datetime.utcnow().isoformat() + "Z"
        },
        "document": document_data,
        "validation_report": report_data
    }
    return json.dumps(combined, indent=2)


def generate_csv_report(report_data: dict, document_data: dict) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Field", "Value"])
    writer.writerow(["Report ID", report_data.get('id')])
    writer.writerow(["Document Name", document_data.get('filename')])
    writer.writerow(["File Size (Bytes)", document_data.get('file_size')])
    writer.writerow(["Page Count", document_data.get('page_count')])
    writer.writerow(["SHA-256 Hash", document_data.get('sha256_hash')])
    writer.writerow(["Overall Status", report_data.get('overall_status')])
    writer.writerow(["Signature Found", report_data.get('signature_found')])
    writer.writerow(["Signature Valid", report_data.get('signature_valid')])
    writer.writerow(["Document Modified", report_data.get('document_modified')])
    writer.writerow(["Signed By", report_data.get('signed_by')])
    writer.writerow(["Certificate Issuer", report_data.get('certificate_issuer')])
    writer.writerow(["Certificate Serial", report_data.get('certificate_serial')])
    writer.writerow(["Signing Time", report_data.get('signing_time')])
    writer.writerow(["Certificate Expiry", report_data.get('certificate_expiry')])
    writer.writerow(["Trust Status", report_data.get('trust_status')])
    writer.writerow(["Validation Time (ms)", report_data.get('validation_time_ms')])
    writer.writerow(["Created At", report_data.get('created_at')])
    
    return output.getvalue()
