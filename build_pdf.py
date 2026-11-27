import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

pdf_filename = "College_Project_Presentation_Guide.pdf"
pdf_path = os.path.join(os.getcwd(), pdf_filename)

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Title'],
    fontName='Helvetica-Bold',
    fontSize=20,
    leading=24,
    textColor=colors.HexColor('#0f172a'),
    alignment=0,
    spaceAfter=4
)

subtitle_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=15,
    textColor=colors.HexColor('#2563eb'),
    spaceAfter=12
)

h1_style = ParagraphStyle(
    'Heading1_Custom',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=13,
    leading=16,
    textColor=colors.HexColor('#1e3a8a'),
    spaceBefore=12,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'Body_Custom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor('#334155'),
    spaceAfter=5
)

table_header_style = ParagraphStyle(
    'TableHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.white
)

table_cell_style = ParagraphStyle(
    'TableCell',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#1e293b')
)

story = []

# Title & Header
story.append(Paragraph("Online Food Ordering & Hotel Delivery System", title_style))
story.append(Paragraph("Complete College Presentation & Team Division Guide (4 Students)", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

# Section 1: Team Division
story.append(Paragraph("1. Team Presentation Division (4 Students)", h1_style))

data_team = [
    [Paragraph("Student Member", table_header_style), Paragraph("Assigned Module / Role", table_header_style), Paragraph("Presentation Focus & Live Demo Task", table_header_style)],
    [Paragraph("Student 1 (Leader)", table_cell_style), Paragraph("Introduction, Architecture & DB Design", table_cell_style), Paragraph("• Introduction & Problem Statement<br/>• Tech Stack (React, Express, Node.js, MySQL)<br/>• Database ER Diagram & 8 Normalized Tables<br/>• Security (JWT Tokens & Password Hashing)", table_cell_style)],
    [Paragraph("Student 2 (Frontend)", table_cell_style), Paragraph("Customer Ordering & UX Module", table_cell_style), Paragraph("• Home Page & Search Bar Logic<br/>• Dynamic Category Pills ('What's on your mind?')<br/>• Custom Restaurant Banners & Menu Page<br/>• Interactive Cart, Checkout, VAT (13%), & eSewa", table_cell_style)],
    [Paragraph("Student 3 (Backend)", table_cell_style), Paragraph("Restaurant Partner & Kitchen Operations", table_cell_style), Paragraph("• Restaurant Dashboard & Metrics<br/>• Real-time Kitchen Order Queue & Status Buttons<br/>• Food Item CRUD with Photo Uploads<br/>• Category Controls & Legal KYC Profile", table_cell_style)],
    [Paragraph("Student 4 (Admin)", table_cell_style), Paragraph("Main Admin Panel & Project Conclusion", table_cell_style), Paragraph("• Executive Analytics & Financial Metrics<br/>• Legal KYC Approvals (PAN/DFTQC/VAT inspection)<br/>• Restaurant Food Inventory Directory<br/>• One-Click User Password Reset & Viva Q&A", table_cell_style)]
]

t_team = Table(data_team, colWidths=[105, 145, 290])
t_team.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(t_team)
story.append(Spacer(1, 10))

# Section 2: Credentials
story.append(Paragraph("2. System & Database Credentials", h1_style))

data_creds = [
    [Paragraph("Role / Account", table_header_style), Paragraph("Email / Username", table_header_style), Paragraph("Password", table_header_style), Paragraph("Access & Details", table_header_style)],
    [Paragraph("MySQL Database", table_cell_style), Paragraph("root (Host: localhost)", table_cell_style), Paragraph("Komal@123KEW", table_cell_style), Paragraph("Database Name: food_ordering", table_cell_style)],
    [Paragraph("Main Administrator", table_cell_style), Paragraph("admin@food.com", table_cell_style), Paragraph("admin123", table_cell_style), Paragraph("Full Admin Panel, KYC Approvals & Password Resets", table_cell_style)],
    [Paragraph("Kathmandu MoMo Hub", table_cell_style), Paragraph("restaurant1@food.com", table_cell_style), Paragraph("password", table_cell_style), Paragraph("Restaurant Partner (Thamel, Kathmandu)", table_cell_style)],
    [Paragraph("Himalayan Java Coffee", table_cell_style), Paragraph("restaurant2@food.com", table_cell_style), Paragraph("password", table_cell_style), Paragraph("Restaurant Partner (Durbar Marg, Kathmandu)", table_cell_style)],
    [Paragraph("Newa Lahana Restaurant", table_cell_style), Paragraph("restaurant3@food.com", table_cell_style), Paragraph("password", table_cell_style), Paragraph("Restaurant Partner (Kirtipur, Kathmandu)", table_cell_style)],
    [Paragraph("Durbar Grill & Sekuwa", table_cell_style), Paragraph("restaurant4@food.com", table_cell_style), Paragraph("password", table_cell_style), Paragraph("Restaurant Partner (Baneshwor, Kathmandu)", table_cell_style)],
    [Paragraph("Customer Account", table_cell_style), Paragraph("rahul@gmail.com", table_cell_style), Paragraph("password", table_cell_style), Paragraph("Customer Account for placing orders", table_cell_style)]
]

t_creds = Table(data_creds, colWidths=[115, 135, 95, 195])
t_creds.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f0fdf4')]),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(t_creds)
story.append(Spacer(1, 10))

# Section 3: Step-by-Step Live Demo Script
story.append(Paragraph("3. Step-by-Step Live Presentation Script", h1_style))
story.append(Paragraph("<b>Step 1 — Customer Flow (Student 2):</b> Open http://localhost:3000. Search for dish or category, select Kathmandu MoMo Hub, view top custom banner, add items to cart, proceed to checkout with Rs. currency & 13% VAT, select eSewa/COD, and place order.", body_style))
story.append(Paragraph("<b>Step 2 — Restaurant Partner Flow (Student 3):</b> Log into http://localhost:3000/login using restaurant1@food.com / password. View top navbar showing Kathmandu MoMo Hub, open Orders (/restaurant/orders), and demonstrate status progression: Accept -> Preparing -> Ready -> Out for Delivery -> Delivered.", body_style))
story.append(Paragraph("<b>Step 3 — Main Admin Control Flow (Student 4):</b> Log in using admin@food.com / admin123. View Executive Dashboard metrics, inspect legal KYC documents (PAN, DFTQC, VAT), review restaurant food inventory, and perform a One-Click Password Reset.", body_style))

story.append(Spacer(1, 10))

# Section 4: Top Viva Q&A
story.append(Paragraph("4. Key Viva Questions & Expert Answers", h1_style))
story.append(Paragraph("<b>Q1: How is security implemented in the system?</b><br/><i>Answer:</i> Passwords are encrypted using bcryptjs before storage. Session authorization uses JSON Web Tokens (JWT) sent via Authorization Bearer headers, protected by role-based middleware (verifyToken, verifyAdmin).", body_style))
story.append(Paragraph("<b>Q2: How do orders route specifically to each restaurant?</b><br/><i>Answer:</i> Food items contain a restaurant_id foreign key. When an order is placed, POST /api/orders links orders.restaurant_id. The Restaurant Orders API queries WHERE o.restaurant_id = rest_id, ensuring each kitchen only sees its own orders.", body_style))
story.append(Paragraph("<b>Q3: How are image file uploads stored?</b><br/><i>Answer:</i> Uploaded dish images and KYC document PDFs are processed using Multer middleware, saved to backend/uploads/ with unique timestamped filenames, and referenced in MySQL.", body_style))

doc.build(story)
print("PDF successfully generated at:", pdf_path)
