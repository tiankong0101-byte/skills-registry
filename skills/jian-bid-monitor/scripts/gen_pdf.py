# -*- coding: utf-8 -*-
"""生成吉安招标监控PDF（可点击链接）"""
import sys, os, json, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether
from reportlab.platypus.flowables import Flowable
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = 'C:/Windows/Fonts'
pdfmetrics.registerFont(TTFont('SimHei', f'{FONT_DIR}/simhei.ttf'))
pdfmetrics.registerFont(TTFont('SimSun', f'{FONT_DIR}/simsun.ttc'))


class HyperLink(Flowable):
    def __init__(self, text, url, fontName='SimHei', fontSize=8, textColor=HexColor('#1a73e8'), spaceAfter=4):
        super().__init__()
        self.text = text
        self.url = url
        self.fontName = fontName
        self.fontSize = fontSize
        self.textColor = textColor
        self.spaceAfter = spaceAfter
        self.width = 170 * mm
        self.height = fontSize + 4

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def drawOn(self, canvas, x, y, _sW=0):
        canvas.saveState()
        canvas.setFont(self.fontName, self.fontSize)
        canvas.setFillColor(self.textColor)
        canvas.drawString(x, y + 2, self.text)
        canvas.setLineWidth(0.5)
        canvas.setStrokeColor(self.textColor)
        textWidth = canvas.stringWidth(self.text, self.fontName, self.fontSize)
        canvas.line(x, y + 1, x + textWidth, y + 1)
        canvas.restoreState()
        try:
            canvas.linkURL(self.url, (x, y, x + textWidth, y + self.fontSize + 2), relative=0)
        except Exception:
            pass

LOG_FILE = os.path.join(os.environ.get('USERPROFILE', '.'), '.agent-reach', 'jian-bid-log.json')

def load_log():
    if not os.path.exists(LOG_FILE):
        return {'items': []}
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def tag_color(tag):
    if '预招标' in tag: return HexColor('#ff3b30')
    if '需求征集' in tag: return HexColor('#ff9500')
    if '设备采购' in tag: return HexColor('#007aff')
    return HexColor('#888888')

def build_pdf(output_path):
    log = load_log()
    items = log.get('items', [])
    removed = 0  # not tracked in current log structure

    # Group by date
    by_date = {}
    for item in items:
        d = item.get('date', '1970/01/01')
        by_date.setdefault(d, []).append(item)

    dates = sorted(by_date.keys(), reverse=True)
    today = __import__('datetime').date.today().isoformat().replace('-', '/')

    # Styles
    styles = {
        'title': ParagraphStyle('title', fontName='SimHei', fontSize=18,
            textColor=HexColor('#1a73e8'), alignment=TA_CENTER, spaceAfter=6),
        'meta': ParagraphStyle('meta', fontName='SimHei', fontSize=10,
            textColor=HexColor('#666666'), alignment=TA_CENTER, spaceAfter=4),
        'date_hdr': ParagraphStyle('date_hdr', fontName='SimHei', fontSize=12,
            textColor=HexColor('#1a73e8'), spaceBefore=12, spaceAfter=4),
        'date_hdr_today': ParagraphStyle('date_hdr_today', fontName='SimHei', fontSize=12,
            textColor=colors.white, spaceBefore=12, spaceAfter=4),
        'item_title': ParagraphStyle('item_title', fontName='SimHei', fontSize=10,
            textColor=HexColor('#333333'), spaceAfter=2, leading=14),
        'item_meta': ParagraphStyle('item_meta', fontName='SimHei', fontSize=9,
            textColor=HexColor('#888888'), spaceAfter=1),
        'item_url': ParagraphStyle('item_url', fontName='SimHei', fontSize=8,
            textColor=HexColor('#1a73e8'), spaceAfter=6),
        'footer': ParagraphStyle('footer', fontName='SimHei', fontSize=8,
            textColor=HexColor('#bbbbbb'), alignment=TA_CENTER, spaceBefore=20),
    }

    doc = SimpleDocTemplate(output_path, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm, topMargin=15*mm, bottomMargin=15*mm)

    story = []

    # Title
    story.append(Paragraph('吉安招标监控', styles['title']))
    priority_count = len([i for i in items if (i.get('priority') or 99) <= 3])
    story.append(Paragraph(
        f'共 {len(items)} 条（重点 {priority_count}） · {len(dates)} 天数据',
        styles['meta']))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width='100%', thickness=1, color=HexColor('#e0e0e0')))
    story.append(Spacer(1, 4*mm))

    # Items by date
    for d in dates:
        day_items = by_date[d]
        is_today = d == today
        hdr_style = styles['date_hdr_today'] if is_today else styles['date_hdr']
        label = f'{d}（今日）' if is_today else d
        if is_today:
            tbl = Table([[Paragraph(f'{label}（{len(day_items)} 条）', styles['date_hdr_today'])]],
                        colWidths=[170*mm])
            tbl.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), HexColor('#1a73e8')),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(tbl)
        else:
            story.append(Paragraph(f'{label}（{len(day_items)} 条）', styles['date_hdr']))

        for item in day_items:
            tag = item.get('tag', '')
            title = item.get('title', '')
            source = item.get('source', '')
            date_str = item.get('date', '')
            url = item.get('url', '')

            tag_color_val = tag_color(tag)
            title_text = f'<b>{tag}</b> {title}' if tag else title
            title_text = title_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

            # Tag badge
            if tag:
                tag_para = Paragraph(f'<b>{tag}</b>',
                    ParagraphStyle('tb', fontName='SimHei', fontSize=8,
                        textColor=colors.white, backColor=tag_color_val,
                        leftIndent=0, rightIndent=0, spaceAfter=2))
                tag_cell = Table([[tag_para]], colWidths=[50*mm])
                tag_cell.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), tag_color_val),
                    ('TOPPADDING', (0,0), (-1,-1), 2),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                    ('LEFTPADDING', (0,0), (-1,-1), 4),
                    ('RIGHTPADDING', (0,0), (-1,-1), 4),
                ]))
            else:
                tag_cell = None

            title_para = Paragraph(title_text,
                ParagraphStyle('it', fontName='SimHei', fontSize=10,
                    textColor=HexColor('#222222'), leading=14, spaceAfter=2))
            meta_para = Paragraph(f'{source} · {date_str}', styles['item_meta'])

            if url:
                url_link = HyperLink(url, url)
            else:
                url_link = Spacer(1, 0)

            row_data = [[title_para]]
            if tag_cell:
                row_data.append([tag_cell])
            row_data.append([meta_para])
            row_data.append([url_link])

            card_table = Table(row_data, colWidths=[170*mm])
            card_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), HexColor('#ffffff')),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
                ('BOX', (0,0), (-1,-1), 0.5, HexColor('#e0e0e0')),
                ('LINEBELOW', (0,-1), (-1,-1), 0.5, HexColor('#f0f0f0')),
            ]))

            story.append(KeepTogether(card_table))
            story.append(Spacer(1, 2*mm))

    # Footer
    story.append(Spacer(1, 10*mm))
    story.append(HRFlowable(width='100%', thickness=0.5, color=HexColor('#e0e0e0')))
    story.append(Paragraph(f'吉安招标自动监控 · {__import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M")}',
        styles['footer']))

    doc.build(story)
    print(f'PDF生成成功: {output_path}')

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('output')
    args = parser.parse_args()
    build_pdf(args.output)
