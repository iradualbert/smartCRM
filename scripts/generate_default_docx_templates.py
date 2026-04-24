from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DIR = ROOT / "corebackend" / "sales" / "default"
FILES_DIR = ROOT / "corebackend" / "files" / "templates"

NAVY = RGBColor(15, 23, 42)
SLATE = RGBColor(71, 85, 105)
MUTED = RGBColor(100, 116, 139)
BORDER = "D9E2EC"
HEADER_FILL = "E8EEF6"
ACCENT_FILL = "F5F8FC"
TOTAL_FILL = "EEF8F4"


def set_cell_background(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_borders(cell, color=BORDER, size=8):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right"):
        element = tc_borders.find(qn(f"w:{edge}"))
        if element is None:
            element = OxmlElement(f"w:{edge}")
            tc_borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), str(size))
        element.set(qn("w:color"), color)


def set_table_borders(table, color=BORDER, size=8):
    tbl = table._tbl
    tbl_pr = tbl.tblPr
    tbl_borders = tbl_pr.first_child_found_in("w:tblBorders")
    if tbl_borders is None:
        tbl_borders = OxmlElement("w:tblBorders")
        tbl_pr.append(tbl_borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = tbl_borders.find(qn(f"w:{edge}"))
        if element is None:
            element = OxmlElement(f"w:{edge}")
            tbl_borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), str(size))
        element.set(qn("w:color"), color)


def set_table_layout(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = widths[idx]


def clear_cell(cell):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return paragraph


def add_text(paragraph, text, size=10.5, bold=False, color=SLATE):
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Aptos"
    run.font.size = Pt(size)
    run.font.color.rgb = color
    return run


def add_cell_label(cell, text):
    p = clear_cell(cell)
    p.space_after = Pt(1)
    add_text(p, text, size=8, bold=True, color=MUTED)


def add_cell_value(cell, text, size=10.5, bold=False, color=NAVY):
    p = cell.paragraphs[0] if cell.paragraphs else clear_cell(cell)
    p.space_after = Pt(0)
    add_text(p, text, size=size, bold=bold, color=color)


def add_title(doc, label, number_placeholder):
    header = doc.add_table(rows=1, cols=2)
    set_table_layout(header, [Inches(2.2), Inches(4.7)])
    set_table_borders(header, color="FFFFFF", size=0)

    left = header.cell(0, 0)
    right = header.cell(0, 1)
    left.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    right.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

    p_logo = clear_cell(left)
    p_logo.alignment = WD_ALIGN_PARAGRAPH.LEFT
    add_text(p_logo, "[[CompanyLogo]]", size=10, color=MUTED)

    p_title = clear_cell(right)
    p_title.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_text(p_title, label.upper(), size=22, bold=True, color=NAVY)

    p_number = right.add_paragraph()
    p_number.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    add_text(p_number, number_placeholder, size=12, bold=True, color=SLATE)


def add_company_client_block(doc, customer_heading="Bill to"):
    table = doc.add_table(rows=1, cols=2)
    set_table_layout(table, [Inches(3.45), Inches(3.45)])
    set_table_borders(table)
    for cell in table.row_cells(0):
        set_cell_background(cell, ACCENT_FILL)
        set_cell_borders(cell)

    company = table.cell(0, 0)
    customer = table.cell(0, 1)

    add_cell_label(company, "FROM")
    add_cell_value(company, "[[CompanyLegalName]]", size=12, bold=True)
    company.add_paragraph("[[CompanyAddress]]")
    company.add_paragraph("[[CompanyEmail]]")
    company.add_paragraph("[[CompanyPhone]]")
    company.add_paragraph("[[CompanyWebsite]]")
    company.add_paragraph("Tax number: [[CompanyTaxNumber]]")

    add_cell_label(customer, customer_heading.upper())
    add_cell_value(customer, "[[ClientName]]", size=12, bold=True)
    customer.add_paragraph("[[ClientDetails]]")
    return table


def add_metadata_table(doc, fields):
    table = doc.add_table(rows=2, cols=len(fields))
    set_table_layout(table, [Inches(6.9 / len(fields))] * len(fields))
    set_table_borders(table)
    for idx, (label, value) in enumerate(fields):
        top = table.cell(0, idx)
        bottom = table.cell(1, idx)
        set_cell_background(top, HEADER_FILL)
        set_cell_borders(top)
        set_cell_borders(bottom)
        add_cell_label(top, label)
        add_cell_value(bottom, value, size=11, bold=True)
    return table


def add_lines_table(doc, include_unit_price=True, include_total=True):
    cols = 4 if include_unit_price and include_total else 2
    table = doc.add_table(rows=2, cols=cols)
    widths = [Inches(3.8), Inches(0.9)]
    if include_unit_price:
        widths.append(Inches(1.1))
    if include_total:
        widths.append(Inches(1.1))
    set_table_layout(table, widths)
    set_table_borders(table)

    headers = ["Description", "Qty"]
    if include_unit_price:
        headers.append("Unit price")
    if include_total:
        headers.append("Line total")

    for idx, header in enumerate(headers):
        cell = table.cell(0, idx)
        set_cell_background(cell, HEADER_FILL)
        set_cell_borders(cell)
        p = clear_cell(cell)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx else WD_ALIGN_PARAGRAPH.LEFT
        add_text(p, header, size=9, bold=True, color=NAVY)

    placeholders = ["[[LineDescription]]", "[[LineQty]]"]
    if include_unit_price:
        placeholders.append("[[LineUnitPrice]]")
    if include_total:
        placeholders.append("[[LineTotal]]")
    for idx, placeholder in enumerate(placeholders):
        cell = table.cell(1, idx)
        set_cell_borders(cell)
        p = clear_cell(cell)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx else WD_ALIGN_PARAGRAPH.LEFT
        add_text(p, placeholder, size=10.5, color=SLATE)
    return table


def add_totals_table(doc, rows):
    table = doc.add_table(rows=len(rows), cols=2)
    set_table_layout(table, [Inches(1.7), Inches(1.4)])
    table.alignment = WD_TABLE_ALIGNMENT.RIGHT
    set_table_borders(table)

    for idx, (label, value, emphasize) in enumerate(rows):
        left = table.cell(idx, 0)
        right = table.cell(idx, 1)
        set_cell_borders(left)
        set_cell_borders(right)
        if emphasize:
            set_cell_background(left, TOTAL_FILL)
            set_cell_background(right, TOTAL_FILL)
        add_cell_label(left, label)
        add_cell_value(right, value, size=12 if emphasize else 10.5, bold=emphasize)
        right.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    return table


def add_notes_block(doc, heading="Notes"):
    table = doc.add_table(rows=2, cols=1)
    set_table_layout(table, [Inches(6.9)])
    set_table_borders(table)
    set_cell_background(table.cell(0, 0), HEADER_FILL)
    add_cell_label(table.cell(0, 0), heading.upper())
    add_cell_value(table.cell(1, 0), "[[Notes]]", size=10.5, color=SLATE)
    return table


def finalize(doc):
    section = doc.sections[0]
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    section.page_width
    style = doc.styles["Normal"]
    style.font.name = "Aptos"
    style.font.size = Pt(10.5)
    style.font.color.rgb = SLATE


def spacing(doc, after=0.16):
    doc.add_paragraph().paragraph_format.space_after = Pt(after * 72)


def build_invoice():
    doc = Document()
    finalize(doc)
    add_title(doc, "Invoice", "[[DocumentNumber]]")
    spacing(doc)
    add_company_client_block(doc, customer_heading="Bill to")
    spacing(doc)
    add_metadata_table(
        doc,
        [
            ("Issued", "[[DocumentDate]]"),
            ("Due", "[[DueDate]]"),
            ("Currency", "[[Currency]]"),
        ],
    )
    spacing(doc)
    add_lines_table(doc, include_unit_price=True, include_total=True)
    spacing(doc)
    add_totals_table(
        doc,
        [
            ("Subtotal", "[[SubTotal]]", False),
            ("Tax ([[TaxRatePercent]])", "[[Tax]]", False),
            ("Total", "[[Total]]", True),
        ],
    )
    spacing(doc)
    add_notes_block(doc)
    return doc


def build_quotation():
    doc = Document()
    finalize(doc)
    add_title(doc, "Quotation", "[[DocumentNumber]]")
    spacing(doc)
    add_company_client_block(doc, customer_heading="Prepared for")
    spacing(doc)
    add_metadata_table(
        doc,
        [
            ("Date", "[[DocumentDate]]"),
            ("Valid until", "[[ValidUntil]]"),
            ("Currency", "[[Currency]]"),
        ],
    )
    spacing(doc)
    add_lines_table(doc, include_unit_price=True, include_total=True)
    spacing(doc)
    add_totals_table(
        doc,
        [
            ("Subtotal", "[[SubTotal]]", False),
            ("Discount", "[[Discount]]", False),
            ("Tax ([[TaxRatePercent]])", "[[Tax]]", False),
            ("Total", "[[Total]]", True),
        ],
    )
    spacing(doc)
    add_notes_block(doc, heading="Scope and notes")
    return doc


def build_proforma():
    doc = Document()
    finalize(doc)
    add_title(doc, "Proforma Invoice", "[[DocumentNumber]]")
    spacing(doc)
    add_company_client_block(doc, customer_heading="Prepared for")
    spacing(doc)
    add_metadata_table(
        doc,
        [
            ("Date", "[[DocumentDate]]"),
            ("Due", "[[DueDate]]"),
            ("Currency", "[[Currency]]"),
        ],
    )
    spacing(doc)
    add_lines_table(doc, include_unit_price=True, include_total=True)
    spacing(doc)
    add_totals_table(
        doc,
        [
            ("Subtotal", "[[SubTotal]]", False),
            ("Discount", "[[Discount]]", False),
            ("Tax ([[TaxRatePercent]])", "[[Tax]]", False),
            ("Total", "[[Total]]", True),
        ],
    )
    spacing(doc)
    add_notes_block(doc)
    return doc


def build_receipt():
    doc = Document()
    finalize(doc)
    add_title(doc, "Receipt", "[[DocumentNumber]]")
    spacing(doc)
    add_company_client_block(doc, customer_heading="Received from")
    spacing(doc)
    add_metadata_table(
        doc,
        [
            ("Date", "[[DocumentDate]]"),
            ("Invoice", "[[InvoiceNumber]]"),
            ("Currency", "[[Currency]]"),
        ],
    )
    spacing(doc)
    add_totals_table(
        doc,
        [
            ("Amount received", "[[AmountPaid]]", True),
            ("Payment method", "[[PaymentMethod]]", False),
        ],
    )
    spacing(doc)
    add_notes_block(doc)
    return doc


def build_delivery_note():
    doc = Document()
    finalize(doc)
    add_title(doc, "Delivery Note", "[[DocumentNumber]]")
    spacing(doc)
    add_company_client_block(doc, customer_heading="Deliver to")
    spacing(doc)
    add_metadata_table(
        doc,
        [
            ("Issued", "[[DocumentDate]]"),
            ("Delivery date", "[[DeliveryDate]]"),
        ],
    )
    spacing(doc)
    add_lines_table(doc, include_unit_price=False, include_total=False)
    spacing(doc)
    add_notes_block(doc, heading="Delivery notes")
    return doc


BUILDERS = {
    "quotation_standard_template.docx": build_quotation,
    "proforma_standard_template.docx": build_proforma,
    "invoice_standard_template.docx": build_invoice,
    "receipt_standard_template.docx": build_receipt,
    "delivery_note_standard_template.docx": build_delivery_note,
}

FILES_BUILDERS = {
    "quotation_pro.docx": build_quotation,
    "proforma_pro.docx": build_proforma,
    "invoice_standard_template.docx": build_invoice,
    "receipt_pro.docx": build_receipt,
    "delivery_note_pro.docx": build_delivery_note,
}


def save_all():
    DEFAULT_DIR.mkdir(parents=True, exist_ok=True)
    FILES_DIR.mkdir(parents=True, exist_ok=True)

    for filename, builder in BUILDERS.items():
        doc = builder()
        doc.save(str(DEFAULT_DIR / filename))

    for filename, builder in FILES_BUILDERS.items():
        doc = builder()
        doc.save(str(FILES_DIR / filename))


if __name__ == "__main__":
    save_all()
