import json
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path("app-store-screenshots")
WIDTH = 1242
HEIGHT = 2688
PURPLE = "#5B4DFF"
LAVENDER = "#F6F3FF"
BORDER = "#E9E5FF"
TEXT = "#050505"
MUTED = "#6E6A7D"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
SANS = FONT_DIR / "Arial.ttf"
SANS_BOLD = FONT_DIR / "Arial Bold.ttf"
SANS_BLACK = FONT_DIR / "Arial Black.ttf"
SERIF = FONT_DIR / "Georgia.ttf"
SERIF_ITALIC = FONT_DIR / "Georgia Italic.ttf"


def font(path, size):
    return ImageFont.truetype(str(path), size)


def draw_lines(draw, lines, xy, size, line_height=None, fill=TEXT, weight="bold", serif=False, italic=False):
    x, y = xy
    if serif:
        path = SERIF_ITALIC if italic else SERIF
    elif weight == "black":
        path = SANS_BLACK
    elif weight in ("bold", "heavy"):
        path = SANS_BOLD
    else:
        path = SANS

    typeface = font(path, size)
    step = line_height or int(size * 1.18)
    for index, line in enumerate(lines):
        draw.text((x, y + index * step), line, font=typeface, fill=fill)


def wrap(text, width):
    return textwrap.wrap(" ".join(text.split()), width=width)


def message(item, name="Nelson"):
    return item["encouragement_template"].replace("{name}", name)


def base():
    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    return image, ImageDraw.Draw(image)


def wordmark(draw, x=86, y=165, size=37):
    draw_lines(draw, ["The", "Weak", "Christian"], (x, y), size, int(size * 0.9), weight="black")


def menu_button(draw, cx=1092, cy=186):
    draw.ellipse((cx - 58, cy - 58, cx + 58, cy + 58), fill="#F3F0FF")
    for dy in (-14, 0, 14):
        draw.line((cx - 22, cy + dy, cx + 22, cy + dy), fill=PURPLE, width=7)


def draw_icon(draw, name, cx, cy, size=42, color=PURPLE, width=5):
    half = size / 2
    if name == "home":
        draw.line((cx - half * 0.55, cy, cx, cy - half * 0.52, cx + half * 0.55, cy), fill=color, width=width, joint="curve")
        draw.line((cx - half * 0.42, cy, cx - half * 0.42, cy + half * 0.55, cx + half * 0.42, cy + half * 0.55, cx + half * 0.42, cy), fill=color, width=width, joint="curve")
        draw.line((cx - half * 0.12, cy + half * 0.55, cx - half * 0.12, cy + half * 0.18, cx + half * 0.12, cy + half * 0.18, cx + half * 0.12, cy + half * 0.55), fill=color, width=width)
    elif name == "bookmark":
        x0, y0 = cx - half * 0.38, cy - half * 0.58
        x1, y1 = cx + half * 0.38, cy + half * 0.62
        draw.line((x0, y0, x1, y0, x1, y1, cx, cy + half * 0.25, x0, y1, x0, y0), fill=color, width=width, joint="curve")
    elif name == "pencil":
        draw.line((cx - half * 0.5, cy + half * 0.42, cx + half * 0.35, cy - half * 0.43), fill=color, width=width)
        draw.line((cx + half * 0.2, cy - half * 0.58, cx + half * 0.5, cy - half * 0.28), fill=color, width=width)
        draw.line((cx - half * 0.55, cy + half * 0.58, cx + half * 0.35, cy + half * 0.58), fill=color, width=width)
    elif name == "pray":
        draw.line((cx - half * 0.28, cy - half * 0.55, cx - half * 0.08, cy + half * 0.42), fill=color, width=width)
        draw.line((cx + half * 0.28, cy - half * 0.55, cx + half * 0.08, cy + half * 0.42), fill=color, width=width)
        draw.line((cx - half * 0.08, cy + half * 0.42, cx - half * 0.38, cy + half * 0.12), fill=color, width=width)
        draw.line((cx + half * 0.08, cy + half * 0.42, cx + half * 0.38, cy + half * 0.12), fill=color, width=width)
    elif name == "share":
        draw.polygon([(cx - half * 0.58, cy - half * 0.18), (cx + half * 0.58, cy - half * 0.52), (cx + half * 0.16, cy + half * 0.58)], outline=color)
        draw.line((cx - half * 0.58, cy - half * 0.18, cx + half * 0.1, cy + half * 0.05, cx + half * 0.58, cy - half * 0.52), fill=color, width=width)
    elif name == "sun":
        draw.ellipse((cx - half * 0.24, cy - half * 0.24, cx + half * 0.24, cy + half * 0.24), outline=color, width=width)
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-0.7, -0.7), (0.7, -0.7), (-0.7, 0.7), (0.7, 0.7)]:
            draw.line((cx + dx * half * 0.42, cy + dy * half * 0.42, cx + dx * half * 0.64, cy + dy * half * 0.64), fill=color, width=width)
    elif name == "dots":
        radius = max(3, int(size * 0.08))
        for dx in (-half * 0.35, 0, half * 0.35):
            draw.ellipse((cx + dx - radius, cy - radius, cx + dx + radius, cy + radius), fill=color)
    elif name == "search":
        draw.ellipse((cx - half * 0.38, cy - half * 0.38, cx + half * 0.16, cy + half * 0.16), outline=color, width=width)
        draw.line((cx + half * 0.14, cy + half * 0.14, cx + half * 0.48, cy + half * 0.48), fill=color, width=width)
    elif name == "grid":
        r = max(3, int(size * 0.09))
        for xoff in (-0.28, 0.28):
            for yoff in (-0.28, 0.28):
                draw.ellipse((cx + xoff * size - r, cy + yoff * size - r, cx + xoff * size + r, cy + yoff * size + r), outline=color, width=width)
    elif name == "clock":
        draw.ellipse((cx - half * 0.48, cy - half * 0.48, cx + half * 0.48, cy + half * 0.48), outline=color, width=width)
        draw.line((cx, cy, cx, cy - half * 0.28), fill=color, width=width)
        draw.line((cx, cy, cx + half * 0.25, cy + half * 0.14), fill=color, width=width)
    elif name == "user":
        draw.ellipse((cx - half * 0.22, cy - half * 0.48, cx + half * 0.22, cy - half * 0.04), outline=color, width=width)
        draw.arc((cx - half * 0.5, cy, cx + half * 0.5, cy + half * 0.78), 200, 340, fill=color, width=width)
    elif name == "settings":
        draw.ellipse((cx - half * 0.36, cy - half * 0.36, cx + half * 0.36, cy + half * 0.36), outline=color, width=width)
        draw.ellipse((cx - half * 0.1, cy - half * 0.1, cx + half * 0.1, cy + half * 0.1), fill=color)
    elif name == "info":
        draw.ellipse((cx - half * 0.48, cy - half * 0.48, cx + half * 0.48, cy + half * 0.48), outline=color, width=width)
        draw.line((cx, cy - half * 0.04, cx, cy + half * 0.32), fill=color, width=width)
        draw.ellipse((cx - 3, cy - half * 0.28 - 3, cx + 3, cy - half * 0.28 + 3), fill=color)


def draw_chevron(draw, cx, cy, color=MUTED, width=4):
    draw.line((cx - 8, cy - 15, cx + 8, cy, cx - 8, cy + 15), fill=color, width=width, joint="curve")


def header(draw):
    wordmark(draw)
    menu_button(draw)


def nav_bar(draw, y=2422):
    draw.rounded_rectangle((64, y, 1178, y + 158), radius=40, fill="white", outline=BORDER, width=3)
    labels = ["Home", "Save", "Reflect", "Pray", "Share"]
    icons = ["home", "bookmark", "pencil", "pray", "share"]
    label_font = font(SANS_BOLD, 27)
    for index, label in enumerate(labels):
        x = 132 + index * 238
        if index == 0:
            draw.rounded_rectangle((x - 49, y + 17, x + 49, y + 123), radius=28, fill="#F3F0FF")
        if index > 0:
            draw.line((x - 119, y + 22, x - 119, y + 126), fill=BORDER, width=3)
        draw_icon(draw, icons[index], x, y + 58, 45, PURPLE, 5)
        draw.text((x, y + 113), label, font=label_font, fill=PURPLE, anchor="mm")


def save(image, name):
    OUT_DIR.mkdir(exist_ok=True)
    image.save(OUT_DIR / f"{name}.png")


def opening():
    image, draw = base()
    draw_lines(draw, ["The", "Weak", "Christian"], (112, 1040), 168, 150, weight="black")
    draw_lines(draw, ["Quiet encouragement", "from Scripture."], (112, 1530), 57, 74, fill=MUTED)
    draw.ellipse((982, 2206, 1126, 2350), fill="#F3F0FF")
    draw.line((1024, 2278, 1080, 2278), fill=PURPLE, width=8)
    draw.line((1058, 2254, 1082, 2278, 1058, 2302), fill=PURPLE, width=8, joint="curve")
    save(image, "01-opening-wordmark")


def home():
    image, draw = base()
    header(draw)
    draw_lines(draw, ["Daily Scripture encouragement"], (72, 486), 42, fill=PURPLE, italic=True)
    draw_lines(draw, ["Start with today"], (72, 604), 96, weight="black")
    draw_lines(draw, ["Nelson"], (72, 760), 45, fill=MUTED)
    draw.rounded_rectangle((72, 878, 1170, 1202), radius=36, fill="white", outline=BORDER, width=3)
    draw_lines(draw, ["Begin"], (124, 966), 37, fill=PURPLE, weight="black", italic=True)
    draw_lines(draw, ["Today's encouragement"], (124, 1064), 63, weight="black")
    draw_lines(draw, ["Read one note, then save,", "reflect, pray, or share."], (124, 1152), 40, 56, fill=MUTED)
    draw_lines(draw, ["DAILY RHYTHM"], (72, 1340), 35, fill=MUTED, weight="black")
    for y, title, body in [
        (1398, "Reflect: Gratitude", "Today I can thank God for..."),
        (1650, "Pray: For Today", "Lord, help me walk through today...")
    ]:
        draw.rounded_rectangle((72, y, 1170, y + 214), radius=28, fill="white", outline=BORDER, width=3)
        draw_lines(draw, [title], (114, y + 74), 51, weight="black")
        draw_lines(draw, [body], (114, y + 143), 35)
    save(image, "02-home-dashboard")


def reader(data):
    item = next((entry for entry in data if entry["verse_reference"] == "2 Timothy 1:2"), data[0])
    message_lines = wrap(message(item), 42)
    message_size = 40 if len(message_lines) <= 11 else 36
    message_height = 55 if len(message_lines) <= 11 else 49
    verse_lines = wrap(item["verse_text"], 48)
    image, draw = base()
    header(draw)
    draw.rounded_rectangle((64, 314, 1178, 2372), radius=54, fill="white", outline=BORDER, width=3)
    draw.ellipse((105, 381, 229, 505), fill="#F3F0FF")
    draw_icon(draw, "sun", 167, 443, 58, PURPLE, 5)
    draw_lines(draw, [item["verse_reference"]], (282, 420), 51, fill=PURPLE, weight="black")
    draw_icon(draw, "bookmark", 981, 445, 55, TEXT, 5)
    draw_icon(draw, "dots", 1078, 448, 56, TEXT, 5)
    draw_lines(draw, message_lines, (124, 650), message_size, message_height, weight="regular", serif=True)
    draw.rounded_rectangle((124, 1768, 1118, 2190), radius=38, fill=LAVENDER)
    draw_lines(draw, ["SCRIPTURE"], (182, 1853), 27, fill=PURPLE, weight="black")
    draw_lines(draw, verse_lines, (182, 1935), 32, 45, weight="regular", serif=True, italic=True)
    draw_lines(draw, [f'{item["verse_reference"]}, KJV'], (182, 2140), 36, fill=PURPLE, weight="regular", serif=True, italic=True)
    nav_bar(draw)
    save(image, "03-todays-encouragement")


def menu():
    image = Image.new("RGB", (WIDTH, HEIGHT), "#808080")
    draw = ImageDraw.Draw(image)
    wordmark(draw, 60, 180, 35)
    draw.rounded_rectangle((378, 0, 1288, 2688), radius=64, fill="white")
    draw.ellipse((1032, 140, 1148, 256), fill="#F3F0FF")
    draw.line((1070, 178, 1110, 218), fill=PURPLE, width=5)
    draw.line((1110, 178, 1070, 218), fill=PURPLE, width=5)
    draw_lines(draw, ["Good morning,", "Nelson"], (444, 370), 45, 57, weight="black")
    draw_lines(draw, ["You are loved. You are not alone.", "Let's grow closer to Jesus today."], (444, 545), 30, 42, fill=MUTED)
    draw.line((444, 666, 1138, 666), fill="#E2E0EA", width=3)
    draw_lines(draw, ["MY LIBRARY"], (444, 752), 22, fill=MUTED, weight="black")
    for icon, label, y in [
        ("bookmark", "Saved Notes", 842), ("clock", "Recently Seen", 948), ("pencil", "My Reflections", 1054), ("pray", "My Prayers", 1160),
        ("search", "Explore Scriptures", 1415), ("grid", "Topics & Themes", 1521), ("sun", "Encouragements", 1627),
        ("user", "Profile", 1885), ("settings", "Settings", 1991), ("info", "About", 2097)
    ]:
        if y == 1415:
            draw.line((444, 1240, 1138, 1240), fill="#E2E0EA", width=3)
            draw_lines(draw, ["EXPLORE"], (444, 1325), 22, fill=MUTED, weight="black")
        if y == 1885:
            draw.line((444, 1710, 1138, 1710), fill="#E2E0EA", width=3)
            draw_lines(draw, ["APP"], (444, 1795), 22, fill=MUTED, weight="black")
        draw_icon(draw, icon, 478, y - 10, 40, TEXT, 4)
        draw.text((540, y), label, font=font(SANS_BOLD, 34), fill=TEXT)
        draw_chevron(draw, 1100, y - 10)
    draw.rounded_rectangle((444, 2242, 1138, 2392), radius=28, fill=LAVENDER)
    draw_lines(draw, ["Care Note"], (535, 2288), 29, weight="black")
    draw_lines(draw, ["Spiritual encouragement for ordinary days."], (535, 2342), 22, fill=MUTED)
    save(image, "04-burger-menu")


def reflect_pray():
    image, draw = base()
    header(draw)
    draw_lines(draw, ["Private reflections"], (72, 430), 34, fill=PURPLE, italic=True)
    draw_lines(draw, ["Journal"], (72, 512), 79, weight="black")
    draw.rounded_rectangle((72, 675, 1170, 990), radius=34, fill="white", outline=BORDER, width=3)
    draw_lines(draw, ["Reflection on Psalms 51:1"], (126, 784), 45, weight="black")
    draw_lines(draw, ["This encouragement is showing me", "where mercy meets my ordinary day..."], (126, 860), 35, 48, fill=MUTED)
    draw_lines(draw, ["Requests and answers"], (72, 1130), 34, fill=PURPLE, italic=True)
    draw_lines(draw, ["Prayer List"], (72, 1212), 79, weight="black")
    draw.rounded_rectangle((72, 1375, 1170, 1700), radius=34, fill="white", outline=BORDER, width=3)
    draw_lines(draw, ["Prayer from 2 Timothy 1:2"], (126, 1485), 45, weight="black")
    draw_lines(draw, ["Lord, help me receive this word", "with faith and walk in it today..."], (126, 1561), 35, 48, fill=MUTED)
    draw.rounded_rectangle((126, 1622, 322, 1676), radius=27, fill="#F3F0FF")
    draw_lines(draw, ["Prayed once"], (156, 1638), 24, fill=PURPLE, weight="black")
    nav_bar(draw, 2388)
    save(image, "05-reflect-and-pray")


OUT_DIR.mkdir(exist_ok=True)
with open("src/data/encouragements.json", "r", encoding="utf-8") as file:
    data = json.load(file)

opening()
home()
reader(data)
menu()
reflect_pray()

print(f"Wrote 1242x2688 App Store screenshot PNGs to {OUT_DIR}")
