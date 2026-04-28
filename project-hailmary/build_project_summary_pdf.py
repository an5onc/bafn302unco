from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.textlabels import Label


OUTPUT = "project-hailmary-summary.pdf"


portfolio_rows = [
    ["Member", "Individual Stock", "Ending Value", "Gain", "Total Return", "CAGR"],
    ["Anson", "TSLA", "$84,380.34", "$34,380.34", "68.76%", "10.36%"],
    ["Mikey", "EA", "$83,256.67", "$33,256.67", "66.51%", "10.08%"],
    ["Paige", "BRK.B", "$89,716.04", "$39,716.04", "79.43%", "11.65%"],
]

benchmark_rows = [
    ["Investment", "Role", "Buy Price", "Shares", "4/27/26 Price", "Ending Value", "Return", "CAGR"],
    ["SPY", "S&P 500 index", "$371.33", "26.93", "$715.17", "$19,259.53", "92.60%", "13.15%"],
    ["QQQ", "Growth ETF #1", "$311.86", "32.07", "$664.23", "$21,301.86", "113.02%", "15.31%"],
    ["VUG", "Growth ETF #2", "$41.88", "238.80", "$83.49", "$19,937.41", "99.37%", "13.89%"],
    ["AGG", "Core bond ETF", "$117.92", "84.80", "$99.44", "$8,432.51", "-15.67%", "-3.16%"],
]

individual_rows = [
    ["Member", "Stock", "Buy Price", "Shares", "4/27/26 Price", "Ending Value", "Return", "CAGR", "Outcome"],
    ["Anson", "TSLA", "$245.04", "40.81", "$378.56", "$15,449.03", "54.49%", "8.54%", "Positive but trailed SPY, QQQ, and VUG."],
    ["Mikey", "EA", "$141.32", "70.76", "$202.45", "$14,325.36", "43.25%", "7.01%", "Solid gain but weakest equity result."],
    ["Paige", "BRK.B", "$227.47", "43.96", "$472.81", "$20,784.73", "107.85%", "14.78%", "Best individual stock; nearly matched QQQ."],
]

position_ranking_rows = [
    ["Rank", "Position", "Ending Value", "Total Return", "What it showed"],
    ["1", "QQQ", "$21,301.86", "113.02%", "Growth concentration produced the highest project return."],
    ["2", "BRK.B", "$20,784.73", "107.85%", "Disciplined diversified conglomerate outperformed most ETFs."],
    ["3", "VUG", "$19,937.41", "99.37%", "Broad growth exposure beat SPY but trailed QQQ."],
    ["4", "SPY", "$19,259.53", "92.60%", "Broad index compounding beat TSLA and EA."],
    ["5", "TSLA", "$15,449.03", "54.49%", "Headline-driven upside with substantial volatility."],
    ["6", "EA", "$14,325.36", "43.25%", "Company-specific gains lagged diversified funds."],
    ["7", "AGG", "$8,432.51", "-15.67%", "Bond sleeve hurt by rising interest rates."],
]

rubric_rows = [
    ["Rubric Requirement", "How the Project Covers It", "Outcome"],
    ["Cover page", "The PDF opens with course, project, members, dates, and portfolio objective.", "Covered"],
    ["Benchmark ETF results", "SPY, QQQ, VUG, and AGG are summarized with buy price, shares, ending value, return, and CAGR.", "Covered"],
    ["Individual stock pages", "Anson tracks TSLA, Mikey tracks EA, and Paige tracks BRK.B in the same format.", "Covered"],
    ["News analysis", "The website includes dated stock and market events; this PDF condenses the major price-impact stories.", "Covered"],
    ["Group reflection", "The four required reflection questions are answered in a dedicated section.", "Covered"],
    ["Charts and tables", "The site uses Chart.js charts; this PDF includes summary tables plus portfolio and value-over-time charts.", "Covered"],
    ["Excel tracking files", "Rubric says Excel files are uploaded separately. No .xlsx file was present in this repo folder.", "Separate upload"],
]


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=32,
            textColor=colors.HexColor("#111827"),
            alignment=TA_CENTER,
            spaceAfter=14,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=12,
            leading=17,
            textColor=colors.HexColor("#4b5563"),
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#111827"),
            spaceBefore=6,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1f2937"),
            spaceBefore=8,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            textColor=colors.HexColor("#374151"),
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#6b7280"),
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#111827"),
            backColor=colors.HexColor("#eef2ff"),
            borderColor=colors.HexColor("#c7d2fe"),
            borderWidth=0.75,
            borderPadding=7,
            spaceBefore=6,
            spaceAfter=10,
        ),
        "center": ParagraphStyle(
            "Center",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#111827"),
        ),
    }


S = styles()


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#d1d5db"))
    canvas.line(0.65 * inch, 0.55 * inch, 7.85 * inch, 0.55 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6b7280"))
    canvas.drawString(0.65 * inch, 0.38 * inch, "project-hailmary · BAFN 302 Essentials of Finance · Spring 2026")
    canvas.drawRightString(7.85 * inch, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def table(data, col_widths=None, font_size=7.8, header_bg="#111827"):
    processed = []
    for row in data:
        processed.append([
            cell if isinstance(cell, Paragraph) else Paragraph(str(cell), S["small"])
            for cell in row
        ])
    t = Table(processed, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_bg)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
        ("LEADING", (0, 0), (-1, -1), font_size + 2.2),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d1d5db")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
    ]))
    return t


def bullet(text):
    return Paragraph(f"• {text}", S["body"])


def portfolio_bar_chart():
    d = Drawing(450, 210)
    chart = VerticalBarChart()
    chart.x = 45
    chart.y = 38
    chart.height = 135
    chart.width = 350
    chart.data = [[84380.34, 83256.67, 89716.04]]
    chart.categoryAxis.categoryNames = ["Anson", "Mikey", "Paige"]
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 100000
    chart.valueAxis.valueStep = 20000
    chart.bars[0].fillColor = colors.HexColor("#2563eb")
    chart.barLabels.nudge = 8
    chart.barLabels.fontName = "Helvetica"
    chart.barLabels.fontSize = 7
    chart.barLabels.fillColor = colors.HexColor("#374151")
    chart.valueAxis.labels.fontSize = 7
    chart.categoryAxis.labels.fontSize = 8
    d.add(chart)
    d.add(String(45, 188, "Ending Portfolio Value by Member", fontName="Helvetica-Bold", fontSize=11, fillColor=colors.HexColor("#111827")))
    d.add(String(45, 20, "All three began with $50,000; Paige finished highest because BRK.B was the strongest individual stock.", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#6b7280")))
    return d


def ranking_bar_chart():
    values = [21301.86, 20784.73, 19937.41, 19259.53, 15449.03, 14325.36, 8432.51]
    labels = ["QQQ", "BRK.B", "VUG", "SPY", "TSLA", "EA", "AGG"]
    d = Drawing(470, 230)
    chart = VerticalBarChart()
    chart.x = 45
    chart.y = 45
    chart.height = 140
    chart.width = 370
    chart.data = [values]
    chart.categoryAxis.categoryNames = labels
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 24000
    chart.valueAxis.valueStep = 6000
    chart.bars[0].fillColor = colors.HexColor("#059669")
    chart.valueAxis.labels.fontSize = 7
    chart.categoryAxis.labels.fontSize = 8
    d.add(chart)
    d.add(String(45, 202, "$10,000 Position Ending Values", fontName="Helvetica-Bold", fontSize=11, fillColor=colors.HexColor("#111827")))
    d.add(String(45, 24, "QQQ finished first overall. AGG was the only holding below the original $10,000.", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#6b7280")))
    return d


def line_chart():
    series = {
        "TSLA": [10000, 14365, 5020, 10121, 16446, 15449],
        "SPY": [10000, 12872, 10287, 12792, 15754, 19260],
        "QQQ": [10000, 12860, 8499, 13085, 16901, 21302],
        "VUG": [10000, 13094, 9194, 13134, 17034, 19937],
        "AGG": [10000, 9243, 8226, 8226, 8183, 8433],
        "EA": [10000, 9765, 8562, 9482, 10472, 14325],
        "BRK.B": [10000, 13276, 13320, 15958, 20397, 20785],
    }
    palette = ["#dc2626", "#2563eb", "#059669", "#d97706", "#6b7280", "#7c3aed", "#111827"]
    d = Drawing(500, 260)
    chart = HorizontalLineChart()
    chart.x = 50
    chart.y = 48
    chart.height = 155
    chart.width = 365
    chart.data = list(series.values())
    chart.categoryAxis.categoryNames = ["Jan 2021", "2021", "2022", "2023", "2024", "Apr 2026"]
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 24000
    chart.valueAxis.valueStep = 4000
    chart.valueAxis.labels.fontSize = 7
    chart.categoryAxis.labels.fontSize = 6.5
    for i, color in enumerate(palette):
        chart.lines[i].strokeColor = colors.HexColor(color)
        chart.lines[i].strokeWidth = 1.8
    d.add(chart)
    d.add(String(50, 230, "$10,000 Investment Value Over Time", fontName="Helvetica-Bold", fontSize=11, fillColor=colors.HexColor("#111827")))
    x, y = 430, 190
    for i, (name, color) in enumerate(zip(series.keys(), palette)):
        yy = y - i * 17
        d.add(Line(x, yy + 4, x + 18, yy + 4, strokeColor=colors.HexColor(color), strokeWidth=2))
        d.add(String(x + 24, yy, name, fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor("#374151")))
    d.add(String(50, 25, "2022 was the shared stress point: growth stocks and AGG both declined as rates rose.", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#6b7280")))
    return d


def cover_page():
    return [
        Spacer(1, 0.65 * inch),
        Paragraph("Five-Year Buy-and-Track Market Project", S["title"]),
        Paragraph("Website and Project Summary PDF", S["subtitle"]),
        Spacer(1, 0.25 * inch),
        Paragraph("BAFN 302 · Essentials of Finance · Spring 2026", S["center"]),
        Spacer(1, 0.15 * inch),
        Paragraph("Group: project-hailmary · Members: Anson, Mikey, and Paige", S["center"]),
        Spacer(1, 0.35 * inch),
        Paragraph(
            "This report summarizes the static website built for the group stock project. The site explains the class simulation, shows each member's five-position portfolio, compares shared benchmark ETFs, analyzes major market/news events, and answers the required group reflection questions.",
            S["body"],
        ),
        Paragraph(
            "Rubric date note: the DOCX rubric lists an end date of 04/23/26. The website and this PDF use the project's stated presentation checkpoint of Apr 27, 2026, because that is the date used throughout the completed project pages and calculations.",
            S["callout"],
        ),
        Spacer(1, 0.15 * inch),
        table([
            ["Starting Assumption", "Project Implementation"],
            ["Start date", "January 5, 2021, first trading Tuesday of 2021"],
            ["Starting amount", "$10,000 per position; five positions per student; $50,000 per student"],
            ["Shared ETFs", "SPY, QQQ, VUG, and AGG"],
            ["Assigned individual stocks", "Anson: TSLA; Mikey: EA; Paige: BRK.B"],
            ["Final checkpoint used by website", "April 27, 2026"],
        ], [2.2 * inch, 4.6 * inch], 8.3),
        PageBreak(),
    ]


def rubric_section():
    return [
        Paragraph("Rubric Coverage", S["h1"]),
        Paragraph(
            "The PDF is organized around the submission requirements from the DOCX rubric. The website itself acts as an interactive version of the project, while this document packages the same evidence into a class-report format.",
            S["body"],
        ),
        table(rubric_rows, [1.65 * inch, 4.0 * inch, 1.15 * inch], 7.3),
        Spacer(1, 0.18 * inch),
        Paragraph("Website Map", S["h2"]),
        table([
            ["File/Page", "Purpose"],
            ["index.html", "Redirects visitors to the group home page."],
            ["home.html", "Group landing page with member cards, group comparison chart, ETF table, and project overview."],
            ["anson.html, mikey.html, paige.html", "Member portfolio pages in the same structure: metrics, allocation, table, timeline, and reflection."],
            ["tesla.html, ea.html, brkb.html", "Individual stock research pages for the three assigned stocks."],
            ["spy.html, qqq.html, vug.html, agg.html", "Benchmark ETF pages explaining role, calculations, timeline, events, and reflections."],
            ["reflection.html", "Group reflection page answering the four required questions and comparing all portfolios."],
            ["app.js / style.css", "Shared data, Chart.js rendering, responsive layout, visual styling, and reusable page behavior."],
            ["musk-empire-explorer.html", "Supplemental interactive Tesla-related explorer; not part of the core rubric submission."],
        ], [1.65 * inch, 5.15 * inch], 7.4),
        PageBreak(),
    ]


def outcome_section():
    return [
        Paragraph("Project Outcome", S["h1"]),
        Paragraph(
            "The group's core outcome is that all three portfolios grew meaningfully from the $50,000 starting value, but the shared ETFs did most of the heavy lifting. Paige finished highest because BRK.B nearly matched QQQ and significantly beat TSLA and EA.",
            S["body"],
        ),
        table(portfolio_rows, [1.0 * inch, 1.4 * inch, 1.25 * inch, 1.15 * inch, 1.05 * inch, 0.85 * inch], 7.9),
        Spacer(1, 0.15 * inch),
        ranking_bar_chart(),
        Spacer(1, 0.08 * inch),
        table(position_ranking_rows, [0.45 * inch, 0.8 * inch, 1.05 * inch, 0.9 * inch, 3.6 * inch], 7.1),
        PageBreak(),
    ]


def benchmark_section():
    return [
        Paragraph("Benchmark ETF Results", S["h1"]),
        Paragraph(
            "The benchmark ETFs were identical across all three portfolios. Their results show the project lesson clearly: diversified stock exposure, especially growth exposure, beat most individual stock picks, while the bond ETF lost value during the rate-hike cycle.",
            S["body"],
        ),
        table(benchmark_rows, [0.78 * inch, 1.12 * inch, 0.76 * inch, 0.58 * inch, 0.86 * inch, 1.0 * inch, 0.76 * inch, 0.76 * inch], 6.8),
        Spacer(1, 0.18 * inch),
        line_chart(),
        Paragraph("ETF Takeaways", S["h2"]),
        bullet("QQQ was the strongest overall investment, turning $10,000 into $21,301.86 with a 113.02% total return."),
        bullet("VUG nearly doubled and showed that broad growth exposure can compete with more concentrated funds while spreading company risk."),
        bullet("SPY delivered strong broad-market compounding and beat TSLA and EA without relying on a single company."),
        bullet("AGG was the only holding below cost. The result illustrated interest-rate risk and the limits of assuming bonds are always safe."),
        PageBreak(),
    ]


def individual_section():
    return [
        Paragraph("Individual Stock Pages", S["h1"]),
        Paragraph(
            "Each student selected a different U.S. stock and used the same worksheet logic: $10,000 invested on January 5, 2021, share count calculated from buy price, ending value calculated from the project checkpoint price, then gain/loss, total return, and CAGR.",
            S["body"],
        ),
        table(individual_rows, [0.62 * inch, 0.6 * inch, 0.72 * inch, 0.55 * inch, 0.78 * inch, 0.9 * inch, 0.62 * inch, 0.58 * inch, 2.2 * inch], 6.4),
        Spacer(1, 0.16 * inch),
        Paragraph("Member Outcomes", S["h2"]),
        bullet("Anson's TSLA portfolio ended at $84,380.34. Tesla added volatility and finished positive, but it ranked behind the shared equity ETFs."),
        bullet("Mikey's EA portfolio ended at $83,256.67. EA gained 43.25%, but it trailed TSLA, BRK.B, SPY, QQQ, and VUG."),
        bullet("Paige's BRK.B portfolio ended at $89,716.04. Berkshire Hathaway was the strongest individual stock and made Paige's total portfolio the group winner."),
        Paragraph("Website Format Consistency", S["h2"]),
        Paragraph(
            "The individual stock pages follow the same structure as the ETF pages: hero metrics, share and price snapshot, position table, value-over-time chart, dated event timeline, news-event cards, and a reflection/portfolio connection box. That consistency directly supports the rubric's requirement for individual stock pages in the same format per student.",
            S["body"],
        ),
        PageBreak(),
    ]


def news_section():
    return [
        Paragraph("News and Market Event Analysis", S["h1"]),
        Paragraph(
            "The website includes dated news and market events for each holding. The key story across the whole project is that interest rates, inflation, AI enthusiasm, and company-specific decisions shaped the five-year outcomes.",
            S["body"],
        ),
        table([
            ["Area", "Major Events Covered", "Price/Portfolio Meaning"],
            ["TSLA", "2021 Musk share-sale poll; 2022 stock split and rate-driven collapse; 2024 delivery slowdown and 2025 volatility.", "Tesla gained overall but had the sharpest company-specific swings, proving that exciting stocks can lag diversified funds."],
            ["EA", "FIFA license transition to EA SPORTS FC; gaming-cycle uncertainty; later recovery in franchises and publisher earnings.", "EA produced a gain but remained the weakest equity position in the group."],
            ["BRK.B", "Buffett succession planning; Berkshire's insurance/energy strength; OxyChem acquisition and disciplined capital allocation.", "Berkshire behaved like a diversified business portfolio and became the strongest individual stock."],
            ["Market / SPY", "Inflation reached a 41-year high; the Fed began the fastest hiking cycle in decades; later soft-landing and AI-led recovery.", "SPY showed broad market resilience and outperformed TSLA and EA."],
            ["Growth / QQQ / VUG", "2022 growth drawdown; ChatGPT launch; Nvidia AI earnings; Magnificent Seven concentration; DeepSeek shock.", "Growth exposure had higher volatility but generated the best ending values."],
            ["Bonds / AGG", "Fed rate hikes; 2022 stock-bond correlation flip; 10-year Treasury near 5%; 2024 Fed cut cycle.", "AGG was stable day-to-day but still lost value because bond prices fell as rates rose."],
        ], [0.9 * inch, 2.85 * inch, 3.05 * inch], 7.0),
        Spacer(1, 0.14 * inch),
        Paragraph(
            "Outcome: the news analysis connects prices to real market conditions rather than only listing calculations. The repeated theme is that risk can come from different places: company headlines, sector concentration, broad market cycles, and interest-rate movements.",
            S["callout"],
        ),
        PageBreak(),
    ]


def reflection_section():
    return [
        Paragraph("Group Reflection Answers", S["h1"]),
        Paragraph("1. Which investment grew the most over five years?", S["h2"]),
        Paragraph(
            "QQQ grew the most overall. It turned $10,000 into $21,301.86, a 113.02% total return and 15.31% CAGR. The main reason was its heavy exposure to large technology and growth companies that recovered strongly after 2022 and benefited from the AI investment cycle.",
            S["body"],
        ),
        Paragraph("2. Which investment was the most stable?", S["h2"]),
        Paragraph(
            "AGG was the most stable in the sense of having less daily stock-like volatility, but it was not the safest return outcome. It ended at $8,432.51, below the $10,000 starting value, because rising interest rates pushed bond prices down. SPY was the most stable equity position because it spread company risk across the S&P 500.",
            S["body"],
        ),
        Paragraph("3. How did AGG behave when stocks were volatile?", S["h2"]),
        Paragraph(
            "AGG did not fully play the traditional bond-buffer role during the 2022 selloff. Stocks and bonds both fell as inflation and Fed rate hikes hurt growth-stock valuations and existing bond prices at the same time. The project showed that diversification helps, but it does not guarantee every asset class rises when another falls.",
            S["body"],
        ),
        Paragraph("4. If this had been real money, what surprised the group most?", S["h2"]),
        Paragraph(
            "The biggest surprise was how much one individual-stock choice separated portfolios that were otherwise almost identical. Four out of five positions were shared, yet Paige finished more than $6,400 ahead of Mikey and more than $5,300 ahead of Anson because BRK.B performed so well. Another surprise was that simple ETFs beat two of the three individual stocks.",
            S["body"],
        ),
        Spacer(1, 0.15 * inch),
        Paragraph("Final Project Lesson", S["h2"]),
        Paragraph(
            "The website's final message is that markets reward patience and diversification, but different risks show up in different ways. QQQ rewarded concentration in growth, SPY rewarded broad diversification, BRK.B rewarded disciplined capital allocation, and AGG demonstrated that bonds can lose money when rates rise quickly.",
            S["callout"],
        ),
        PageBreak(),
    ]


def implementation_section():
    return [
        Paragraph("Website Implementation Summary", S["h1"]),
        Paragraph(
            "The completed project is a static presentation website. It can run directly in a browser and does not require a backend server. The code is organized around reusable CSS styling and shared JavaScript data so every page uses consistent numbers, colors, charts, and formatting.",
            S["body"],
        ),
        table([
            ["Component", "What It Does"],
            ["HTML pages", "Separate pages for home, each member, each holding, group reflection, and supplemental explorer content."],
            ["style.css", "Dark finance-dashboard visual system with responsive cards, tables, timelines, navigation, and portfolio sections."],
            ["app.js", "Central investment/portfolio data store plus Chart.js rendering functions for comparison, doughnut, mini, timeline, and group charts."],
            ["Chart.js CDN", "Used to render visual comparisons directly in the browser."],
            ["project-hailmary.pptx", "Presentation deck artifact present in the folder for class presentation support."],
            ["Stock Project Spring 2026.docx", "Original assignment/rubric document used to verify PDF coverage."],
        ], [1.45 * inch, 5.35 * inch], 7.5),
        Spacer(1, 0.2 * inch),
        Paragraph("Suggested Submission Package", S["h2"]),
        bullet("Submit this PDF as the group written summary/report if the instructor wants one consolidated PDF."),
        bullet("Use the website for the live walkthrough because it contains navigation, charts, portfolio pages, and reflection pages."),
        bullet("Upload each student's Excel tracking file separately as required by the rubric. This repo folder did not contain those Excel files at the time this PDF was generated."),
        Spacer(1, 0.25 * inch),
        Paragraph("End Result", S["h2"]),
        Paragraph(
            "The project meets the assignment's purpose: it shows how $10,000 positions changed over five years, compares stocks against stock funds and a bond fund, ties market events to price movements, and turns the group's investing observations into clear lessons about risk, return, diversification, and patience.",
            S["body"],
        ),
    ]


def build():
    doc = BaseDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.72 * inch,
        title="project-hailmary Website and Project Summary",
        author="project-hailmary",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])
    story = []
    for section in [
        cover_page,
        rubric_section,
        outcome_section,
        benchmark_section,
        individual_section,
        news_section,
        reflection_section,
        implementation_section,
    ]:
        story.extend(section())
    doc.build(story)


if __name__ == "__main__":
    build()
