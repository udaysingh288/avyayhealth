#!/usr/bin/env python3
"""
Generate Avyay Health Board Advisor Pitch Deck (.pptx)

Target audience: NYU contact who might join board of directors
and help get clients/connections. Meeting tomorrow.

Run: python3 scripts/create_deck.py
Output: AvyayHealth_BoardDeck.pptx
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ── Brand Colors ──────────────────────────────────────────────
FOREST      = RGBColor(0x27, 0x50, 0x0A)
FOREST_DARK = RGBColor(0x1B, 0x3A, 0x07)
TEAL        = RGBColor(0x0D, 0x6B, 0x56)
WARM_BG     = RGBColor(0xF9, 0xF7, 0xF2)
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
CHARCOAL    = RGBColor(0x1A, 0x1A, 0x1A)
MUTED       = RGBColor(0x6B, 0x72, 0x80)
RED_ALERT   = RGBColor(0xC0, 0x39, 0x2B)
AMBER       = RGBColor(0xD9, 0x77, 0x06)
GREEN_IND   = RGBColor(0x27, 0x50, 0x0A)
LIGHT_GREEN = RGBColor(0xE8, 0xF0, 0xE0)
LIGHT_TEAL  = RGBColor(0xE0, 0xF2, 0xEE)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

# ── Helpers ───────────────────────────────────────────────────

def add_solid_bg(slide, color):
    """Fill slide background with a solid color."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, left, top, width, height, fill_color, corner_radius=0):
    """Add a rounded rectangle shape."""
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()  # no border
    if corner_radius:
        shape.adjustments[0] = corner_radius
    return shape

def add_text_box(slide, left, top, width, height, text, font_size=18,
                 bold=False, color=CHARCOAL, alignment=PP_ALIGN.LEFT,
                 font_name="Calibri", line_spacing=1.2):
    """Add a text box with styled text."""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font_name
    p.alignment = alignment
    p.space_after = Pt(0)
    if line_spacing != 1.0:
        p.line_spacing = Pt(font_size * line_spacing)
    return txBox

def add_multiline_box(slide, left, top, width, height, lines, default_size=18,
                      default_color=CHARCOAL, default_bold=False,
                      alignment=PP_ALIGN.LEFT, font_name="Calibri"):
    """Add text box with multiple styled paragraphs.
    lines: list of (text, font_size, bold, color) or just str
    """
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = None

    for i, line in enumerate(lines):
        if isinstance(line, str):
            text, size, bold, color = line, default_size, default_bold, default_color
        else:
            text = line[0]
            size = line[1] if len(line) > 1 else default_size
            bold = line[2] if len(line) > 2 else default_bold
            color = line[3] if len(line) > 3 else default_color

        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()

        p.text = text
        p.font.size = Pt(size)
        p.font.bold = bold
        p.font.color.rgb = color
        p.font.name = font_name
        p.alignment = alignment
        p.space_after = Pt(4)

    return txBox

def add_stat_card(slide, left, top, width, height, number, label,
                  number_color=FOREST, bg_color=WHITE):
    """Add a stat card with a big number and label."""
    card = add_rect(slide, left, top, width, height, bg_color, corner_radius=0.05)

    add_text_box(slide, left + Inches(0.3), top + Inches(0.25),
                 width - Inches(0.6), Inches(0.7),
                 number, font_size=32, bold=True, color=number_color,
                 alignment=PP_ALIGN.CENTER)

    add_text_box(slide, left + Inches(0.3), top + Inches(0.9),
                 width - Inches(0.6), Inches(0.6),
                 label, font_size=13, color=MUTED,
                 alignment=PP_ALIGN.CENTER)

    return card

def add_icon_bullet(slide, left, top, width, icon_text, body_text,
                    icon_color=FOREST, body_color=CHARCOAL):
    """Add a bullet point with colored icon character + text."""
    # Icon
    add_text_box(slide, left, top, Inches(0.4), Inches(0.35),
                 icon_text, font_size=16, color=icon_color, bold=True,
                 alignment=PP_ALIGN.CENTER)
    # Body
    add_text_box(slide, left + Inches(0.45), top, width - Inches(0.45), Inches(0.35),
                 body_text, font_size=15, color=body_color)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 1: TITLE / COVER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
add_solid_bg(slide, FOREST)

# Company name
add_text_box(slide, Inches(1), Inches(1.2), Inches(11), Inches(1),
             "AVYAY HEALTH", font_size=20, bold=True, color=WHITE,
             alignment=PP_ALIGN.LEFT, font_name="Calibri")

# Main headline
add_text_box(slide, Inches(1), Inches(2.0), Inches(10), Inches(1.5),
             "The Care That Follows\nYou Home", font_size=52, bold=True,
             color=WHITE, alignment=PP_ALIGN.LEFT, font_name="Calibri",
             line_spacing=1.15)

# Subheadline
add_text_box(slide, Inches(1), Inches(4.0), Inches(9), Inches(1.0),
             "AI care companion that contacts every discharged patient daily for 30 days —\nvia SMS or app — and alerts care coordinators the moment a patient needs help.",
             font_size=18, color=RGBColor(0xCC, 0xDD, 0xBB),
             alignment=PP_ALIGN.LEFT)

# Bottom bar
add_text_box(slide, Inches(1), Inches(6.2), Inches(11), Inches(0.5),
             "Board Advisory Discussion  ·  April 2026  ·  Confidential",
             font_size=14, color=RGBColor(0x88, 0xAA, 0x77),
             alignment=PP_ALIGN.LEFT)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 2: THE PROBLEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE PROBLEM", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Patients Leave. Hospitals Lose Them.",
             font_size=40, bold=True, color=CHARCOAL)

# Stats row
stats = [
    ("~20%", "of Medicare patients\nreadmitted within 30 days"),
    ("$15K", "average cost per\npreventable readmission"),
    ("2,400+", "hospitals penalized\nunder HRRP in FY2026"),
    ("46%", "can't reach patients\nafter discharge"),
]

card_w = Inches(2.7)
card_h = Inches(1.6)
start_x = Inches(0.8)
gap = Inches(0.25)

for i, (num, label) in enumerate(stats):
    x = start_x + i * (card_w + gap)
    add_stat_card(slide, x, Inches(2.2), card_w, card_h, num, label)

# Primary research callout
add_rect(slide, Inches(0.8), Inches(4.3), Inches(11.5), Inches(2.2),
         WHITE, corner_radius=0.03)

add_text_box(slide, Inches(1.2), Inches(4.5), Inches(10.5), Inches(0.4),
             "FROM OUR PRIMARY RESEARCH — 52 hospital professionals surveyed, March 2026",
             font_size=12, bold=True, color=TEAL)

research_points = [
    "▸  8 in 10 hospital staff rank reducing 30-day readmissions as a top priority",
    "▸  46% say their #1 challenge is simply not being able to reach patients post-discharge",
    "▸  46% still rely on nurses making manual follow-up calls — adding to burnout",
    "▸  37% cite patient comprehension failure as a core breakdown point",
]

for j, point in enumerate(research_points):
    add_text_box(slide, Inches(1.2), Inches(5.0) + j * Inches(0.35),
                 Inches(10.5), Inches(0.35),
                 point, font_size=14, color=CHARCOAL)

# Quote
add_text_box(slide, Inches(0.8), Inches(6.65), Inches(11.5), Inches(0.6),
             '"Many patients don\'t answer the phone. Without a verified number, we simply cannot follow up."  — Discharge Nurse, Survey Respondent',
             font_size=12, color=MUTED, alignment=PP_ALIGN.LEFT,
             font_name="Calibri")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 3: THE SOLUTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE SOLUTION", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Meet Avyay Health",
             font_size=40, bold=True, color=CHARCOAL)

add_text_box(slide, Inches(0.8), Inches(1.7), Inches(10), Inches(0.5),
             "AI-powered post-discharge care companion. No hardware. No app download required. Works on any phone.",
             font_size=17, color=MUTED)

# SMS mockup card (left)
add_rect(slide, Inches(0.8), Inches(2.5), Inches(5.2), Inches(4.5),
         WHITE, corner_radius=0.04)

add_text_box(slide, Inches(1.1), Inches(2.7), Inches(4.5), Inches(0.3),
             "SMS CONVERSATION — DAY 3 POST-DISCHARGE", font_size=11, bold=True, color=MUTED)

sms_lines = [
    ("Avyay Health:", "Hi Maria, it's day 3 after your discharge. How are you feeling today? Any pain, shortness of breath, or swelling?", FOREST),
    ("Maria:", "My ankle is a bit swollen and I feel tired.", CHARCOAL),
    ("Avyay Health:", "Thanks for letting me know. That level of swelling after discharge is worth checking. I'll flag this for your care team now.", FOREST),
]

y = Inches(3.15)
for sender, msg, color in sms_lines:
    add_text_box(slide, Inches(1.2), y, Inches(4.2), Inches(0.25),
                 sender, font_size=12, bold=True, color=color)
    tb = add_text_box(slide, Inches(1.2), y + Inches(0.22), Inches(4.2), Inches(0.6),
                 msg, font_size=12, color=CHARCOAL, line_spacing=1.3)
    y += Inches(0.95)

# Yellow flag badge
flag_shape = add_rect(slide, Inches(1.2), y + Inches(0.05), Inches(2.2), Inches(0.35),
                      AMBER, corner_radius=0.15)
add_text_box(slide, Inches(1.2), y + Inches(0.05), Inches(2.2), Inches(0.35),
             "● Flagged as YELLOW", font_size=12, bold=True, color=WHITE,
             alignment=PP_ALIGN.CENTER)


# Key features (right side)
features_x = Inches(6.5)
features = [
    ("01", "Enrollment", "Nurse enrolls at discharge. Welcome SMS within 24hrs. No hardware, no app download."),
    ("02", "Daily Check-ins", "AI asks about symptoms, meds, recovery. Reads free-text — not just button taps."),
    ("03", "Tapering Care", "Check-ins taper as patient stabilizes. SDOH screening via CMS 5-domain framework."),
    ("04", "Red Alerts", "Flagged symptoms trigger instant coordinator ping with patient summary. <2hr SLA."),
]

for i, (num, title, desc) in enumerate(features):
    fy = Inches(2.6) + i * Inches(1.1)

    # Number circle
    circ = add_rect(slide, features_x, fy, Inches(0.45), Inches(0.45), FOREST, corner_radius=0.5)
    add_text_box(slide, features_x, fy + Inches(0.02), Inches(0.45), Inches(0.4),
                 num, font_size=14, bold=True, color=WHITE, alignment=PP_ALIGN.CENTER)

    add_text_box(slide, features_x + Inches(0.6), fy, Inches(5.5), Inches(0.3),
                 title, font_size=16, bold=True, color=CHARCOAL)
    add_text_box(slide, features_x + Inches(0.6), fy + Inches(0.3), Inches(5.5), Inches(0.6),
                 desc, font_size=13, color=MUTED, line_spacing=1.3)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 4: COORDINATOR DASHBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE PRODUCT", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "One Dashboard. Every Patient. Real-Time.",
             font_size=40, bold=True, color=CHARCOAL)

add_text_box(slide, Inches(0.8), Inches(1.7), Inches(10), Inches(0.5),
             "Browser-based. No software to install. No training required. Your team is live in under a week.",
             font_size=17, color=MUTED)

# Dashboard mockup card
add_rect(slide, Inches(0.8), Inches(2.5), Inches(11.7), Inches(4.5),
         WHITE, corner_radius=0.04)

# Top metrics bar
metrics = [
    ("47", "Active Patients", FOREST),
    ("3", "Red Alerts", RED_ALERT),
    ("8", "Yellow — Watch", AMBER),
    ("36", "Green — Stable", GREEN_IND),
    ("78%", "Engagement Rate", TEAL),
]

for i, (num, label, color) in enumerate(metrics):
    mx = Inches(1.1) + i * Inches(2.2)
    add_text_box(slide, mx, Inches(2.7), Inches(1.8), Inches(0.5),
                 num, font_size=28, bold=True, color=color,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, mx, Inches(3.15), Inches(1.8), Inches(0.3),
                 label, font_size=11, color=MUTED,
                 alignment=PP_ALIGN.CENTER)

# Divider
add_rect(slide, Inches(1.0), Inches(3.55), Inches(11.3), Inches(0.02),
         RGBColor(0xE5, 0xE7, 0xEB))

# Table header
headers = ["Patient", "Condition", "Risk", "Last Check-in", "Last Reply", "Action"]
col_xs = [Inches(1.1), Inches(3.0), Inches(5.0), Inches(6.4), Inches(8.0), Inches(11.0)]
col_ws = [Inches(1.8), Inches(1.8), Inches(1.2), Inches(1.5), Inches(2.8), Inches(1.3)]

for i, h in enumerate(headers):
    add_text_box(slide, col_xs[i], Inches(3.7), col_ws[i], Inches(0.3),
                 h, font_size=11, bold=True, color=MUTED)

# Table rows
rows = [
    ("Maria T., 68F", "Heart Failure", "RED", "2 hrs ago", "\"Ankle swelling, more breathless\"", "Call now"),
    ("James W., 74M", "COPD", "YELLOW", "4 hrs ago", "\"Coughing more than usual\"", "Follow up"),
    ("Sandra K., 61F", "Heart Failure", "GREEN", "1 hr ago", "\"Feeling good, went for a walk\"", "No action"),
]

risk_colors = {"RED": RED_ALERT, "YELLOW": AMBER, "GREEN": GREEN_IND}
risk_bgs = {
    "RED": RGBColor(0xFD, 0xE8, 0xE8),
    "YELLOW": RGBColor(0xFE, 0xF3, 0xCD),
    "GREEN": LIGHT_GREEN,
}

for ri, (patient, cond, risk, checkin, reply, action) in enumerate(rows):
    ry = Inches(4.15) + ri * Inches(0.65)

    # Zebra stripe
    if ri % 2 == 0:
        add_rect(slide, Inches(1.0), ry - Inches(0.05), Inches(11.3), Inches(0.6),
                 RGBColor(0xFA, 0xFB, 0xFC))

    values = [patient, cond, "", checkin, reply, action]
    for ci, val in enumerate(values):
        if ci == 2:  # risk badge
            badge_w = Inches(0.9)
            badge = add_rect(slide, col_xs[ci], ry + Inches(0.05),
                           badge_w, Inches(0.3), risk_bgs[risk], corner_radius=0.15)
            add_text_box(slide, col_xs[ci], ry + Inches(0.05),
                        badge_w, Inches(0.3),
                        f"● {risk}", font_size=10, bold=True,
                        color=risk_colors[risk], alignment=PP_ALIGN.CENTER)
        elif ci == 5:  # action
            act_color = RED_ALERT if "Call" in val else (AMBER if "Follow" in val else MUTED)
            add_text_box(slide, col_xs[ci], ry + Inches(0.05),
                        col_ws[ci], Inches(0.3),
                        val, font_size=12, bold=True, color=act_color)
        else:
            add_text_box(slide, col_xs[ci], ry + Inches(0.05),
                        col_ws[ci], Inches(0.3),
                        val, font_size=12, color=CHARCOAL)

# Footer note
add_text_box(slide, Inches(0.8), Inches(7.0), Inches(11), Inches(0.3),
             "Live product demo available  ·  iOS app + hospital dashboard built and functional",
             font_size=13, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 5: WHY WE'RE DIFFERENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "DIFFERENTIATION", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Built for Hospitals That Can't Afford to Wait",
             font_size=40, bold=True, color=CHARCOAL)

# Comparison table
table_data = [
    ["Feature", "Avyay Health", "Manual Calls", "IVR / Portals", "Digital Health Tools"],
    ["Engagement", "SMS + App\nmeets patients where they are", "40-50% reach rate\nhigh staff cost", "20-30% open rate\nlow completion", "30-50% depends on\napp download"],
    ["Language", "English + Spanish\nat launch", "Requires bilingual\nstaff", "English-only\nor basic", "Limited translation\nlayers"],
    ["SDOH Screening", "CMS 5-domain\nbuilt in", "Ad hoc,\ninconsistent", "Not\nsupported", "Optional\nadd-on"],
    ["Implementation", "<24hr enrollment\nADT feed only", "Ongoing staffing\nneed", "4-8 weeks\nIT integration", "6-12 weeks\napp rollout"],
    ["Hardware", "None — works on\nany phone", "Phone +\nstaff time", "Portal access\nrequired", "Tablet or app\ndownload"],
]

num_rows = len(table_data)
num_cols = len(table_data[0])
table_left = Inches(0.8)
table_top = Inches(2.0)
table_w = Inches(11.7)
table_h = Inches(4.8)

col_widths = [Inches(1.8), Inches(2.5), Inches(2.5), Inches(2.5), Inches(2.4)]
row_h = Inches(0.8)
header_h = Inches(0.5)

for ri, row in enumerate(table_data):
    for ci, cell in enumerate(row):
        cx = table_left + sum(w.inches for w in col_widths[:ci]) * 914400 / 914400
        cx_actual = Inches(0.8)
        for k in range(ci):
            cx_actual += col_widths[k]

        cy = table_top + (Inches(0) if ri == 0 else Inches(0.5) + Inches(0.8) * (ri - 1))
        ch = header_h if ri == 0 else row_h

        # Background
        if ri == 0:
            bg = FOREST
        elif ci == 1:
            bg = LIGHT_GREEN
        else:
            bg = WHITE if ri % 2 == 1 else RGBColor(0xF5, 0xF5, 0xF5)

        add_rect(slide, cx_actual, cy, col_widths[ci], ch, bg, corner_radius=0)

        # Text
        txt_color = WHITE if ri == 0 else (FOREST if ci == 1 else CHARCOAL)
        is_bold = ri == 0 or ci == 0
        fsize = 12 if ri == 0 else (11 if ci == 0 else 11)

        add_text_box(slide, cx_actual + Inches(0.12), cy + Inches(0.05),
                     col_widths[ci] - Inches(0.24), ch - Inches(0.1),
                     cell, font_size=fsize, bold=is_bold, color=txt_color,
                     alignment=PP_ALIGN.LEFT if ci == 0 else PP_ALIGN.CENTER)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 6: BUSINESS MODEL / CMS REIMBURSEMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "BUSINESS MODEL", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Avyay Doesn't Cost Hospitals Money.\nIt Makes Them Money.",
             font_size=38, bold=True, color=CHARCOAL, line_spacing=1.15)

# LEFT: CMS codes
add_rect(slide, Inches(0.8), Inches(2.3), Inches(5.5), Inches(4.6),
         WHITE, corner_radius=0.04)

add_text_box(slide, Inches(1.1), Inches(2.5), Inches(5), Inches(0.35),
             "CMS REIMBURSEMENT STACK", font_size=13, bold=True, color=TEAL)

codes = [
    ("99453", "RPM device setup", "$21.71", "one-time"),
    ("99454", "Device supply monthly", "$52.11", "/month"),
    ("99457", "RPM management 20 min", "$51.77", "/month"),
    ("99458", "RPM management add-on", "$41.42", "/month"),
    ("99490", "CCM first 20 min", "$66.13", "/month"),
    ("99496", "TCM high complexity", "$298.00", "per discharge"),
]

for i, (code, desc, amount, freq) in enumerate(codes):
    cy = Inches(3.05) + i * Inches(0.48)

    add_text_box(slide, Inches(1.1), cy, Inches(0.7), Inches(0.3),
                 code, font_size=12, bold=True, color=FOREST,
                 font_name="Courier New")
    add_text_box(slide, Inches(1.85), cy, Inches(2.3), Inches(0.3),
                 desc, font_size=12, color=CHARCOAL)
    add_text_box(slide, Inches(4.2), cy, Inches(0.9), Inches(0.3),
                 amount, font_size=12, bold=True, color=CHARCOAL,
                 alignment=PP_ALIGN.RIGHT)
    add_text_box(slide, Inches(5.15), cy, Inches(0.9), Inches(0.3),
                 freq, font_size=10, color=MUTED)

# Total line
add_rect(slide, Inches(1.1), Inches(5.95), Inches(5.0), Inches(0.02), FOREST)
add_text_box(slide, Inches(1.1), Inches(6.1), Inches(3), Inches(0.35),
             "Total per CHF patient/year:", font_size=14, bold=True, color=CHARCOAL)
add_text_box(slide, Inches(3.8), Inches(6.1), Inches(1.5), Inches(0.35),
             "$3,164+", font_size=22, bold=True, color=FOREST,
             alignment=PP_ALIGN.RIGHT)


# RIGHT: ROI + HRRP
roi_x = Inches(6.8)

add_rect(slide, roi_x, Inches(2.3), Inches(5.5), Inches(2.0),
         FOREST, corner_radius=0.04)

add_text_box(slide, roi_x + Inches(0.3), Inches(2.5), Inches(5), Inches(0.35),
             "ROI PROJECTION", font_size=13, bold=True, color=RGBColor(0xBB, 0xDD, 0xAA))

roi_lines = [
    ("100 patients", "$42-60K fee", "~$316K CMS revenue", "5-7x ROI"),
    ("500 patients", "$210-300K fee", "~$1.58M CMS revenue", "5-6x ROI"),
]

for i, (patients, fee, rev, roi) in enumerate(roi_lines):
    ry = Inches(3.0) + i * Inches(0.55)
    add_text_box(slide, roi_x + Inches(0.3), ry, Inches(1.3), Inches(0.3),
                 patients, font_size=13, bold=True, color=WHITE)
    add_text_box(slide, roi_x + Inches(1.6), ry, Inches(1.3), Inches(0.3),
                 fee, font_size=12, color=RGBColor(0xBB, 0xDD, 0xAA))
    add_text_box(slide, roi_x + Inches(3.0), ry, Inches(1.5), Inches(0.3),
                 rev, font_size=12, color=WHITE)
    add_text_box(slide, roi_x + Inches(4.4), ry, Inches(0.8), Inches(0.3),
                 roi, font_size=13, bold=True, color=RGBColor(0xFF, 0xEE, 0x77))


# HRRP box
add_rect(slide, roi_x, Inches(4.7), Inches(5.5), Inches(2.2),
         WHITE, corner_radius=0.04)

add_text_box(slide, roi_x + Inches(0.3), Inches(4.9), Inches(5), Inches(0.35),
             "HRRP PENALTY CONTEXT", font_size=13, bold=True, color=RED_ALERT)

hrrp_lines = [
    "A 300-bed hospital with a 0.5% HRRP penalty",
    "on $200M Medicare revenue loses $1M/year.",
    "",
    "Reducing readmissions by 20% saves $500K",
    "in penalties alone — before counting",
    "CMS reimbursement revenue.",
]

for i, line in enumerate(hrrp_lines):
    add_text_box(slide, roi_x + Inches(0.3), Inches(5.35) + i * Inches(0.28),
                 Inches(5), Inches(0.3),
                 line, font_size=13, color=CHARCOAL)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 7: MARKET OPPORTUNITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "MARKET OPPORTUNITY", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "A $490B Problem Hiding in Plain Sight",
             font_size=40, bold=True, color=CHARCOAL)

add_text_box(slide, Inches(0.8), Inches(1.7), Inches(10), Inches(0.5),
             "Post-acute & transitional care is the most under-served segment of the healthcare value chain.",
             font_size=17, color=MUTED)

# Three market boxes
market_cards = [
    ("$490B", "Post-acute care\nmarket size (US)", "Medicare spending on post-acute services\ncontinues to grow as population ages"),
    ("4,000+", "Community hospitals\nin the US", "Our beachhead: mid-size community hospitals\npenalized by HRRP with limited resources"),
    ("35M+", "Annual hospital\ndischarges", "Each one is a patient who needs\n30-day follow-up monitoring"),
]

for i, (num, title, desc) in enumerate(market_cards):
    cx = Inches(0.8) + i * Inches(4.1)
    add_rect(slide, cx, Inches(2.5), Inches(3.8), Inches(2.8),
             WHITE, corner_radius=0.04)

    add_text_box(slide, cx + Inches(0.3), Inches(2.8), Inches(3.2), Inches(0.6),
                 num, font_size=42, bold=True, color=FOREST,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, cx + Inches(0.3), Inches(3.45), Inches(3.2), Inches(0.5),
                 title, font_size=15, bold=True, color=CHARCOAL,
                 alignment=PP_ALIGN.CENTER)
    add_text_box(slide, cx + Inches(0.3), Inches(4.1), Inches(3.2), Inches(0.8),
                 desc, font_size=12, color=MUTED,
                 alignment=PP_ALIGN.CENTER, line_spacing=1.3)

# Go-to-market
add_rect(slide, Inches(0.8), Inches(5.7), Inches(11.7), Inches(1.3),
         FOREST, corner_radius=0.04)

add_text_box(slide, Inches(1.2), Inches(5.9), Inches(3), Inches(0.35),
             "GO-TO-MARKET STRATEGY", font_size=13, bold=True, color=RGBColor(0xBB, 0xDD, 0xAA))

gtm = [
    ("Phase 1:", "Free 90-day pilot at 2-3 community hospitals → prove outcomes"),
    ("Phase 2:", "Convert pilots to paid contracts → land-and-expand within health systems"),
    ("Phase 3:", "Scale to regional hospital networks → build toward platform for all chronic conditions"),
]

for i, (phase, desc) in enumerate(gtm):
    gy = Inches(6.3) + i * Inches(0.3)
    add_text_box(slide, Inches(1.2), gy, Inches(1.0), Inches(0.3),
                 phase, font_size=13, bold=True, color=WHITE)
    add_text_box(slide, Inches(2.2), gy, Inches(9.5), Inches(0.3),
                 desc, font_size=13, color=RGBColor(0xDD, 0xEE, 0xCC))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 8: FREE PILOT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE PILOT", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Free 90-Day Pilot. No Budget. No IT Lift.",
             font_size=40, bold=True, color=CHARCOAL)

# LEFT: What we provide
add_rect(slide, Inches(0.8), Inches(2.2), Inches(5.5), Inches(4.0),
         FOREST, corner_radius=0.04)

add_text_box(slide, Inches(1.2), Inches(2.45), Inches(5), Inches(0.35),
             "WHAT WE PROVIDE", font_size=14, bold=True, color=WHITE)

provides = [
    "200 CHF or COPD patients enrolled",
    "One care unit, one coordinator",
    "ADT discharge feed only — no EHR write-back",
    "Full setup and onboarding handled by Avyay",
    "Complete outcomes report: readmission data,\nengagement metrics, SDOH flags",
    "Dedicated support throughout the pilot",
]

for i, item in enumerate(provides):
    py = Inches(3.0) + i * Inches(0.48)
    add_text_box(slide, Inches(1.3), py, Inches(0.3), Inches(0.3),
                 "✓", font_size=15, bold=True, color=RGBColor(0xBB, 0xDD, 0xAA))
    add_text_box(slide, Inches(1.65), py, Inches(4.3), Inches(0.45),
                 item, font_size=14, color=WHITE, line_spacing=1.2)


# RIGHT: What we need
add_rect(slide, Inches(6.8), Inches(2.2), Inches(5.5), Inches(2.2),
         WHITE, corner_radius=0.04)

add_text_box(slide, Inches(7.2), Inches(2.45), Inches(5), Inches(0.35),
             "WHAT WE NEED FROM THE HOSPITAL", font_size=14, bold=True, color=FOREST)

needs = [
    "ADT discharge data feed",
    "1 clinical champion (care coordinator)",
    "30 minutes to onboard",
]

for i, item in enumerate(needs):
    ny = Inches(3.0) + i * Inches(0.48)
    add_text_box(slide, Inches(7.3), ny, Inches(0.3), Inches(0.3),
                 "→", font_size=15, bold=True, color=FOREST)
    add_text_box(slide, Inches(7.65), ny, Inches(4.3), Inches(0.3),
                 item, font_size=14, color=CHARCOAL)


# Conversion terms
add_rect(slide, Inches(6.8), Inches(4.7), Inches(5.5), Inches(1.5),
         LIGHT_GREEN, corner_radius=0.04)

add_text_box(slide, Inches(7.2), Inches(4.9), Inches(5), Inches(0.35),
             "CONVERSION TERMS", font_size=14, bold=True, color=FOREST)

add_text_box(slide, Inches(7.2), Inches(5.35), Inches(4.8), Inches(0.7),
             "If the pilot shows ≥15% readmission reduction,\nwe convert to a paid contract.\nIf not, we part as friends.",
             font_size=14, color=CHARCOAL, line_spacing=1.4)


# Bottom CTA
add_rect(slide, Inches(2.5), Inches(6.6), Inches(8.3), Inches(0.6),
         FOREST, corner_radius=0.15)
add_text_box(slide, Inches(2.5), Inches(6.63), Inches(8.3), Inches(0.6),
             "Zero risk for the hospital  ·  Full outcomes data  ·  Ready to deploy now",
             font_size=16, bold=True, color=WHITE, alignment=PP_ALIGN.CENTER)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 9: THE TEAM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE TEAM", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Built by People Who Have Been\nInside Your Hospital",
             font_size=40, bold=True, color=CHARCOAL, line_spacing=1.1)

# Diksha card
add_rect(slide, Inches(0.8), Inches(2.3), Inches(5.5), Inches(4.2),
         WHITE, corner_radius=0.04)

# Avatar circle
circ = add_rect(slide, Inches(1.2), Inches(2.6), Inches(0.8), Inches(0.8),
                FOREST, corner_radius=0.5)
add_text_box(slide, Inches(1.2), Inches(2.65), Inches(0.8), Inches(0.75),
             "DD", font_size=22, bold=True, color=WHITE, alignment=PP_ALIGN.CENTER)

add_text_box(slide, Inches(2.2), Inches(2.65), Inches(3.8), Inches(0.35),
             "Diksha Deshmukh", font_size=20, bold=True, color=CHARCOAL)
add_text_box(slide, Inches(2.2), Inches(3.0), Inches(3.8), Inches(0.3),
             "CEO & Co-Founder  ·  MPH", font_size=14, color=TEAL, bold=True)

add_text_box(slide, Inches(1.2), Inches(3.6), Inches(4.8), Inches(2.5),
             '"I spent 3 years inside hospital systems studying post-discharge care failure '
             'firsthand — not from the outside. I\'ve personally spoken with 52 hospital '
             'professionals to validate every assumption before writing a line of code. '
             'That\'s not research. That\'s obsession."',
             font_size=13, color=CHARCOAL, line_spacing=1.4)

add_text_box(slide, Inches(1.2), Inches(5.6), Inches(4.8), Inches(0.6),
             "Clinical Research & Healthcare Expert\nHospital relationships, regulatory, business development",
             font_size=12, color=MUTED, line_spacing=1.3)


# Uday card
add_rect(slide, Inches(6.8), Inches(2.3), Inches(5.5), Inches(4.2),
         WHITE, corner_radius=0.04)

circ = add_rect(slide, Inches(7.2), Inches(2.6), Inches(0.8), Inches(0.8),
                TEAL, corner_radius=0.5)
add_text_box(slide, Inches(7.2), Inches(2.65), Inches(0.8), Inches(0.75),
             "KS", font_size=22, bold=True, color=WHITE, alignment=PP_ALIGN.CENTER)

add_text_box(slide, Inches(8.2), Inches(2.65), Inches(3.8), Inches(0.35),
             "Kunwar Uday Singh", font_size=20, bold=True, color=CHARCOAL)
add_text_box(slide, Inches(8.2), Inches(3.0), Inches(3.8), Inches(0.3),
             "Co-Founder  ·  Data, AI/ML & Engineering", font_size=14, color=TEAL, bold=True)

add_text_box(slide, Inches(7.2), Inches(3.6), Inches(4.8), Inches(2.5),
             '"I build the AI infrastructure that makes Avyay work — the LLM classification '
             'engine, the SMS infrastructure, the real-time risk scoring system. Healthcare '
             'data is my domain."',
             font_size=13, color=CHARCOAL, line_spacing=1.4)

add_text_box(slide, Inches(7.2), Inches(5.2), Inches(4.8), Inches(0.6),
             "Full-stack AI/ML, product engineering\nTechnical architecture, data infrastructure",
             font_size=12, color=MUTED, line_spacing=1.3)


# Company info
add_text_box(slide, Inches(0.8), Inches(6.8), Inches(11.5), Inches(0.4),
             "Avyay Health, Inc.  ·  Founded March 2026  ·  Jersey City, NJ  ·  Pre-seed stage",
             font_size=14, color=MUTED, alignment=PP_ALIGN.CENTER)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 10: THE ASK — ADVISORY ROLE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, WARM_BG)

add_text_box(slide, Inches(0.8), Inches(0.5), Inches(5), Inches(0.4),
             "THE OPPORTUNITY", font_size=13, bold=True, color=TEAL)

add_text_box(slide, Inches(0.8), Inches(0.9), Inches(11), Inches(0.9),
             "Why an Advisory Board Member\nMatters Right Now",
             font_size=40, bold=True, color=CHARCOAL, line_spacing=1.1)

# What we're looking for
add_rect(slide, Inches(0.8), Inches(2.2), Inches(5.5), Inches(2.8),
         WHITE, corner_radius=0.04)

add_text_box(slide, Inches(1.2), Inches(2.4), Inches(5), Inches(0.35),
             "WHAT WE'RE LOOKING FOR", font_size=14, bold=True, color=FOREST)

looking_for = [
    ("Hospital network access", "Warm introductions to VP Quality, CMOs, and care transition directors at community hospitals"),
    ("Credibility signal", "Academic and industry credibility that accelerates trust with hospital decision-makers"),
    ("Strategic guidance", "Advice on navigating hospital procurement, compliance, and pilot partnerships"),
]

for i, (title, desc) in enumerate(looking_for):
    ly = Inches(2.95) + i * Inches(0.65)
    add_text_box(slide, Inches(1.3), ly, Inches(4.7), Inches(0.25),
                 f"▸  {title}", font_size=14, bold=True, color=FOREST)
    add_text_box(slide, Inches(1.65), ly + Inches(0.25), Inches(4.3), Inches(0.35),
                 desc, font_size=12, color=MUTED, line_spacing=1.2)


# What we offer
add_rect(slide, Inches(6.8), Inches(2.2), Inches(5.5), Inches(2.8),
         FOREST, corner_radius=0.04)

add_text_box(slide, Inches(7.2), Inches(2.4), Inches(5), Inches(0.35),
             "WHAT WE OFFER AN ADVISOR", font_size=14, bold=True,
             color=RGBColor(0xBB, 0xDD, 0xAA))

offers = [
    "Board advisory seat with equity participation",
    "A built, functional product (not a slide deck)",
    "Clear CMS reimbursement revenue model (5-7x ROI)",
    "Primary research validation (52 hospitals surveyed)",
    "Zero competition in this exact niche",
    "First-mover advantage in AI post-discharge care",
]

for i, item in enumerate(offers):
    oy = Inches(2.95) + i * Inches(0.38)
    add_text_box(slide, Inches(7.3), oy, Inches(0.3), Inches(0.3),
                 "✓", font_size=14, bold=True, color=RGBColor(0xBB, 0xDD, 0xAA))
    add_text_box(slide, Inches(7.65), oy, Inches(4.3), Inches(0.3),
                 item, font_size=13, color=WHITE)


# Bottom: Where we are + where we're going
add_rect(slide, Inches(0.8), Inches(5.4), Inches(11.7), Inches(1.7),
         WHITE, corner_radius=0.04)

add_text_box(slide, Inches(1.2), Inches(5.6), Inches(5), Inches(0.35),
             "WHERE WE ARE", font_size=14, bold=True, color=FOREST)

where_now = [
    "✓  Product built: iOS app + hospital dashboard + AI engine",
    "✓  Primary research complete: 52 hospital professionals surveyed",
    "✓  Revenue model validated: $3,164+/patient/year CMS reimbursement",
    "✓  Ready for pilot deployment at first hospital partner",
]

for i, item in enumerate(where_now):
    add_text_box(slide, Inches(1.2), Inches(6.0) + i * Inches(0.3),
                 Inches(5), Inches(0.3),
                 item, font_size=12, color=CHARCOAL)


add_text_box(slide, Inches(7.2), Inches(5.6), Inches(5), Inches(0.35),
             "WHERE WE'RE GOING", font_size=14, bold=True, color=TEAL)

where_going = [
    "→  Land 2-3 pilot hospitals in Q2-Q3 2026",
    "→  Prove ≥15% readmission reduction",
    "→  Convert pilots to paid contracts",
    "→  Raise seed round based on pilot outcomes",
]

for i, item in enumerate(where_going):
    add_text_box(slide, Inches(7.2), Inches(6.0) + i * Inches(0.3),
                 Inches(5), Inches(0.3),
                 item, font_size=12, color=CHARCOAL)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SLIDE 11: CLOSING / CTA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

slide = prs.slides.add_slide(prs.slide_layouts[6])
add_solid_bg(slide, FOREST)

add_text_box(slide, Inches(1), Inches(1.5), Inches(11), Inches(1.2),
             "Let's Build This Together.", font_size=48, bold=True,
             color=WHITE, alignment=PP_ALIGN.CENTER)

add_text_box(slide, Inches(2), Inches(3.0), Inches(9), Inches(0.8),
             "We have the product. We have the research. We have the revenue model.\nWhat we need is the right people at the table.",
             font_size=20, color=RGBColor(0xCC, 0xDD, 0xBB),
             alignment=PP_ALIGN.CENTER, line_spacing=1.4)

# Contact card
add_rect(slide, Inches(3.5), Inches(4.3), Inches(6.3), Inches(2.0),
         RGBColor(0x1B, 0x3A, 0x07), corner_radius=0.04)

add_text_box(slide, Inches(3.8), Inches(4.5), Inches(5.8), Inches(0.4),
             "AVYAY HEALTH, INC.", font_size=14, bold=True,
             color=RGBColor(0xBB, 0xDD, 0xAA), alignment=PP_ALIGN.CENTER)

contact_lines = [
    "diksha@avyayhealth.com",
    "avyayhealth.com",
    "",
    "Diksha Deshmukh, CEO  ·  Kunwar Uday Singh, Co-Founder",
    "Jersey City, NJ  ·  Founded March 2026",
]

for i, line in enumerate(contact_lines):
    add_text_box(slide, Inches(3.8), Inches(4.95) + i * Inches(0.28),
                 Inches(5.8), Inches(0.3),
                 line, font_size=14, color=WHITE,
                 alignment=PP_ALIGN.CENTER)

# Tagline
add_text_box(slide, Inches(2), Inches(6.65), Inches(9), Inches(0.4),
             "The care that follows you home.", font_size=16,
             color=RGBColor(0x88, 0xAA, 0x77), alignment=PP_ALIGN.CENTER)


# ── Save ──────────────────────────────────────────────────────
output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                           "AvyayHealth_BoardDeck.pptx")
prs.save(output_path)
print(f"✅ Deck saved to: {output_path}")
print(f"   Slides: {len(prs.slides)}")
