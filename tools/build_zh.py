"""Build the Chinese pages: zh/<page>/index.html from each English page.

Every bilingual element in the English pages carries data-en / data-zh. This script writes the data-zh text into
the element itself, sets <html lang="zh-Hant">, swaps the SEO block for its Chinese version and fixes relative
paths for the extra folder level. Search engines and AI crawlers that do not run JavaScript then see real Chinese
pages at their own URLs (https://onework.io/zh/about/ ...).

  Run:  npm run zh            (also runs before npm run dev and in build.sh)
  Edit: never edit zh/ by hand: change the English page (its data-zh text) and run this again.
"""
import html, json, os, posixpath, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://onework.io/'

# English page -> folder (also its URL path). /c/ is a redirect page and stays English only.
PAGES = {'': 'index.html', 'about/': 'about/index.html', 'product/': 'product/index.html',
         'projects/': 'projects/index.html', 'advisors/': 'advisors/index.html',
         'international-career/': 'international-career/index.html'}

ZH_META = {
    '': ('數位孿生與 BIM 平台｜工一科技 ONEWORK',
         '工一科技 ONEWORK 為建築、工廠與城市打造數位孿生：自研引擎讓 BIM 模型縮小 95%、維持 100% 精度，並把 GIS、AIoT、設施管理與能源管理整合在同一平台。'),
    'about/': ('關於我們｜工一科技 ONEWORK 台北數位孿生公司',
               '關於工一科技 ONEWORK：數位孿生專家，以系統工程、物聯網、數據分析、雲端運算與擴增實境，把建築與系統的全生命週期映射到 BIM。'),
    'product/': ('服務項目：數位孿生、FM、EMS、PMIS 平台｜工一科技 ONEWORK',
                 '工一科技 ONEWORK 服務項目：PMIS 工程專案管理、FM 物業與設施管理、EMS 能源管理、Digital Twin 戰情室、GIS 與智慧城市空間應用、BIM 圖資與網頁模型瀏覽、無人機影像與 AI 實景空間運算。'),
    'projects/': ('專案實績：數位孿生案例｜工一科技 ONEWORK',
                  '工一科技 ONEWORK 專案精選：EMS 能源管理、Digital Twin 戰情室、能源與碳排分析、BERSn-Pro 建築能效評估、PMIS 工程專案管理、物業管理系統、GIS 智慧城市應用、BIM 圖資網頁應用、無人機 AI 實景空間運算與 DCIM 機房管理。'),
    'advisors/': ('顧問與獲獎｜工一科技 ONEWORK',
                  '工一科技 ONEWORK 的顧問（王康隆院士、張懋中院士、UCLA Mobility Lab）與 2019–2025 年的獲獎及里程碑。'),
    'international-career/': ('加入我們：台北與檳城職缺及國際實習｜工一科技 ONEWORK',
                              '加入工一科技 ONEWORK：台北總部與檳城分公司的國際職缺，以及與 TechStart 合作的國際實習計畫。'),
}
ZH_CRUMB = {'Home': '首頁', 'About': '關於我們', 'Services': '服務項目', 'Projects': '專案實績',
            'Advisors & Awards': '顧問與獲獎', 'Career': '加入我們'}

ELEMENT = re.compile(r'<([a-zA-Z][\w-]*)(\s[^>]*?\sdata-zh="([^"]*)"[^>]*)>(.*?)</\1>', re.S)
URL_ATTR = re.compile(r'(\s(?:href|src|data-src|poster)=")([^"]*)(")')
SKIP = ('http:', 'https:', '//', '/', '#', 'mailto:', 'tel:', 'data:', 'javascript:')


def fix_url(url, page_dir):
    """Same relative link inside zh/ for another page (zh/ mirrors the site); one more ../ for everything else."""
    if not url or url.startswith(SKIP):
        return url
    path = re.split(r'[?#]', url, 1)[0]
    target = posixpath.normpath(posixpath.join(page_dir or '.', path)) if path else page_dir.rstrip('/') or '.'
    target = '' if target == '.' else target.rstrip('/') + '/'
    return url if target in PAGES else '../' + url


def to_zh(src, page_dir, rel_src):
    out = src
    if out.count('<html lang="en">') != 1:
        raise SystemExit(f'{rel_src}: expected one <html lang="en">')
    out = out.replace('<html lang="en">', '<html lang="zh-Hant">', 1)
    out = out.replace('<!doctype html>', f'<!doctype html>\n<!-- GENERATED from {rel_src} by tools/build_zh.py: do not edit; change the English page and run npm run zh -->', 1)

    # 1. data-zh text into the element (exactly what the language switch used to do in the browser)
    total, nested = len(re.findall(r'\sdata-zh="', out)), []
    def put_zh(m):
        if '<' in m.group(4):
            nested.append(m.group(2)[:60])
        return f'<{m.group(1)}{m.group(2)}>{m.group(3)}</{m.group(1)}>'
    out, n = ELEMENT.subn(put_zh, out)
    if n != total:
        raise SystemExit(f'{rel_src}: translated {n} of {total} data-zh elements')
    if nested:
        print(f'  note {rel_src}: {len(nested)} element(s) had markup inside, replaced by text as the switch did: {nested[:3]}')

    # 2. paths: one folder deeper
    out = URL_ATTR.sub(lambda m: m.group(1) + fix_url(m.group(2), page_dir) + m.group(3), out)

    # 3. SEO block: Chinese title, description, URLs and structured data
    title, desc = ZH_META[page_dir]
    en_url, zh_url = SITE + page_dir, SITE + 'zh/' + page_dir
    e = lambda s: html.escape(s, quote=True)
    out = re.sub(r'<title>.*?</title>', f'<title>{e(title)}</title>', out, count=1, flags=re.S)
    out = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(desc)}">', out, count=1)
    out = out.replace(f'<link rel="canonical" href="{en_url}">', f'<link rel="canonical" href="{zh_url}">', 1)
    out = out.replace(f'<meta property="og:url" content="{en_url}">', f'<meta property="og:url" content="{zh_url}">', 1)
    out = re.sub(r'(<meta (?:property="og|name="twitter):title" content=")[^"]*', lambda m: m.group(1) + e(title), out)
    out = re.sub(r'(<meta (?:property="og|name="twitter):description" content=")[^"]*', lambda m: m.group(1) + e(desc), out)
    out = out.replace('<meta property="og:locale" content="en_US">\n  <meta property="og:locale:alternate" content="zh_TW">',
                      '<meta property="og:locale" content="zh_TW">\n  <meta property="og:locale:alternate" content="en_US">', 1)

    def zh_ld(m):
        graph = json.loads(m.group(2))
        for node in graph['@graph']:
            if node.get('@type') in ('WebPage', 'AboutPage', 'CollectionPage'):
                node.update({'@id': zh_url + '#webpage', 'url': zh_url, 'name': title, 'inLanguage': 'zh-Hant'})
            if node.get('@type') == 'BreadcrumbList':
                for item in node['itemListElement']:
                    item['name'] = ZH_CRUMB.get(item['name'], item['name'])
                    item['item'] = item['item'].replace(SITE, SITE + 'zh/', 1)
        return m.group(1) + json.dumps(graph, ensure_ascii=False, indent=2) + m.group(3)
    out, n = re.subn(r'(<script type="application/ld\+json">\n)(.*?)(\n  </script>)', zh_ld, out, count=1, flags=re.S)
    if n != 1 or f'href="{zh_url}"' not in out:
        raise SystemExit(f'{rel_src}: SEO block not found: run python3 tools/seo_heads.py first')
    return out


def main():
    for page_dir, rel_src in PAGES.items():
        src = open(os.path.join(ROOT, rel_src), encoding='utf-8').read()
        dest = os.path.join(ROOT, 'zh', page_dir, 'index.html')
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, 'w', encoding='utf-8').write(to_zh(src, page_dir, rel_src))
        print(f'zh/{page_dir}index.html  <-  {rel_src}')


if __name__ == '__main__':
    main()
