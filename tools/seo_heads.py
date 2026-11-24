"""English pages: write title, meta description, canonical, Open Graph/Twitter and JSON-LD into each page's <head>.
Run: python3 tools/seo_heads.py, then npm run zh (tools/build_zh.py turns this block into the Chinese one).
Idempotent: the block lives between <!-- SEO --> and <!-- /SEO --> and is replaced on each run."""
import json, re, sys, html

import os
ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://onework.io/'
OG_IMG = SITE + 'assets/service/fm-overview.jpg'
ORG_ID = SITE + '#organization'

ORG = {
    '@type': 'Organization', '@id': ORG_ID,
    'name': 'ONEWORK', 'alternateName': ['工一科技', '工一科技股份有限公司', 'Onework'],
    'url': SITE, 'logo': SITE + 'assets/onework-brand/favicon.png',
    'description': 'ONEWORK (工一科技) is a Taipei-based digital twin company that integrates BIM, GIS, AIoT and AI analytics '
                   'into one platform for buildings, factories, data centres and cities. Its proprietary BIM engine reduces '
                   'model size by 95% with 100% model fidelity.',
    'foundingDate': '2016',
    'founder': {'@type': 'Person', '@id': SITE + 'about/#carl-yu', 'name': 'Carl Yu'},
    'address': {'@type': 'PostalAddress', 'streetAddress': '8F, No. 16, Beiping E. Rd.', 'addressLocality': 'Taipei',
                'addressCountry': 'TW'},
    'email': 'rubyyou@onework.io',
    'areaServed': ['TW', 'MY', 'SG'],
    'knowsAbout': ['Digital twin', 'Building Information Modeling (BIM)', 'GIS', 'AIoT', 'Facility management',
                   'Energy management systems', 'Smart city', 'Construction project management (PMIS)',
                   '3D Gaussian Splatting', 'Data centre infrastructure management (DCIM)'],
    'award': ['APIGBA Awards — Platinum (2025)', 'APIGBA Awards — Gold (2025)',
              'TAIRA Science Park Competition — Third Place (2020)',
              'BEAMP Built Environment Innovation Award — First Prize (2019)'],
}

def page(path, typ, name, extra=None):
    d = {'@type': typ, '@id': SITE + path + '#webpage', 'url': SITE + path, 'name': name,
         'isPartOf': {'@id': SITE + '#website'}, 'about': {'@id': ORG_ID}, 'inLanguage': 'en'}
    if extra: d.update(extra)
    return d

def crumbs(path, name):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': SITE + path}]}

SERVICES = [
    ('twin', 'Building Digital Twin Command Center', 'Equipment locations, operating data and alarms in a 3D building context.'),
    ('ems', 'Energy Management (EMS / iEMS + ESS)', 'Energy-flow dashboards for generation, storage and loads; integrates Siemens, Schneider and Honeywell SCADA over Modbus, TCP/IP and MQTT.'),
    ('pmis', 'Construction Project Management Information System (PMIS)', 'Construction logs, reports, documents and correspondence with e-signatures and review workflows.'),
    ('fm', 'Facility Management (FM)', 'Assets, NFC/QR smart inspections, maintenance and work orders on one asset register.'),
    ('gis', 'GIS and Smart City Applications', 'Cesium 3D geospatial visualisation, GIS layers and IoT sensor data for infrastructure.'),
    ('bim', 'BIM Data and Web Model Viewing', 'Optimised BIM models in the browser, with an IFC federation QA workspace.'),
    ('spatial', 'Drone and AI Spatial Reconstruction', 'Drone imagery, 3D Gaussian Splatting and AI processing for 3D scenes in GIS and NVIDIA Omniverse.'),
]

PAGES = {
    'index.html': dict(
        path='', title='Digital Twin & BIM Platforms | ONEWORK 工一科技',
        desc='ONEWORK 工一科技 builds digital twins for buildings, factories and cities: BIM models 95% lighter, with GIS, AIoT, facility and energy management in one platform.',
        ld=lambda: [ORG,
                    {'@type': 'WebSite', '@id': SITE + '#website', 'url': SITE, 'name': 'ONEWORK 工一科技',
                     'publisher': {'@id': ORG_ID}, 'inLanguage': ['en', 'zh-Hant']},
                    page('', 'WebPage', 'Digital Twin & BIM Platforms | ONEWORK 工一科技')]),
    'about/index.html': dict(
        path='about/', title='About ONEWORK 工一科技 | Digital Twin Company in Taipei',
        desc='Since 2016, ONEWORK 工一科技 has built digital twins for the AEC industry, integrating BIM, GIS, IoT and AI. Led by founder Carl Yu, an MIT-trained BIM specialist.',
        ld=lambda: [page('about/', 'AboutPage', 'About ONEWORK 工一科技'),
                    {'@type': 'Person', '@id': SITE + 'about/#carl-yu', 'name': 'Carl Yu',
                     'jobTitle': 'Founder / Tech-Lead', 'worksFor': {'@id': ORG_ID},
                     'alumniOf': {'@type': 'CollegeOrUniversity', 'name': 'Massachusetts Institute of Technology'},
                     'image': SITE + 'assets/about/carl-yu.jpg',
                     'knowsAbout': ['Computational BIM', 'Parametric design', 'Digital twin']},
                    crumbs('about/', 'About')]),
    'product/index.html': dict(
        path='product/', title='Digital Twin, FM, EMS & PMIS Platforms | ONEWORK 工一科技',
        desc='Seven platforms on one twin: digital twin command center, facility management, EMS/iEMS energy management, construction PMIS, GIS smart city, BIM viewer and drone 3D.',
        ld=lambda: [page('product/', 'WebPage', 'ONEWORK Service Offerings'),
                    {'@type': 'ItemList', 'name': 'ONEWORK platforms', 'itemListElement': [
                        {'@type': 'ListItem', 'position': i + 1, 'item': {
                            '@type': 'Service', '@id': SITE + 'product/#' + k, 'url': SITE + 'product/#' + k,
                            'name': n, 'description': d, 'provider': {'@id': ORG_ID}}}
                        for i, (k, n, d) in enumerate(SERVICES)]},
                    crumbs('product/', 'Services')]),
    'projects/index.html': dict(
        path='projects/', title='Digital Twin Projects & Case Studies | ONEWORK 工一科技',
        desc='Selected ONEWORK 工一科技 projects: energy management, digital twin command centers, BERSn energy ratings, PMIS, property management, GIS smart city, BIM web apps and DCIM.',
        ld=lambda: [page('projects/', 'CollectionPage', 'ONEWORK Projects'), crumbs('projects/', 'Projects')]),
    'advisors/index.html': dict(
        path='advisors/', title='Advisors & Awards | ONEWORK 工一科技',
        desc='ONEWORK 工一科技 is advised by Academicians Kang L. Wang and Mau-Chung Frank Chang and UCLA Mobility Lab, with awards including APIGBA Platinum (2025) and BEAMP First Prize.',
        ld=lambda: [page('advisors/', 'WebPage', 'ONEWORK Advisors & Awards'),
                    {'@type': 'Person', 'name': 'Kang L. Wang', 'alternateName': '王康隆',
                     'jobTitle': 'Academician, Academia Sinica', 'image': SITE + 'assets/advisors/kang-wang.jpg',
                     'affiliation': [{'@type': 'CollegeOrUniversity', 'name': 'UCLA'}],
                     'knowsAbout': ['Nanotechnology', 'Semiconductors', 'Quantum science']},
                    {'@type': 'Person', 'name': 'Mau-Chung Frank Chang', 'alternateName': '張懋中',
                     'jobTitle': 'Academician, Academia Sinica'},
                    crumbs('advisors/', 'Advisors & Awards')]),
    'international-career/index.html': dict(
        path='international-career/', title='Careers & Internships in Taipei and Penang | ONEWORK 工一科技',
        desc='Build smart cities and digital twins with ONEWORK 工一科技 in Taipei or Penang: IoT, frontend/backend and DevOps careers, plus a 2–6 month internship with TechStart.',
        ld=lambda: [page('international-career/', 'WebPage', 'Careers at ONEWORK'),
                    crumbs('international-career/', 'Career')]),
}

def esc(s): return html.escape(s, quote=True)

for f, p in PAGES.items():
    fp = f'{ROOT}/{f}'
    s = open(fp, encoding='utf-8').read()
    s = re.sub(r'\n  <!-- SEO -->.*?<!-- /SEO -->', '', s, flags=re.S)
    url = SITE + p['path']
    nodes = p['ld']()
    if ORG not in nodes: nodes = [ORG] + nodes
    graph = {'@context': 'https://schema.org', '@graph': nodes}
    block = f'''
  <!-- SEO -->
  <link rel="canonical" href="{url}">
  <link rel="alternate" hreflang="en" href="{url}">
  <link rel="alternate" hreflang="zh-Hant" href="{SITE}zh/{p['path']}">
  <link rel="alternate" hreflang="x-default" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ONEWORK 工一科技">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{esc(p['title'])}">
  <meta property="og:description" content="{esc(p['desc'])}">
  <meta property="og:image" content="{OG_IMG}">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="zh_TW">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(p['title'])}">
  <meta name="twitter:description" content="{esc(p['desc'])}">
  <meta name="twitter:image" content="{OG_IMG}">
  <script type="application/ld+json">
{json.dumps(graph, ensure_ascii=False, indent=2)}
  </script>
  <!-- /SEO -->'''
    s, n1 = re.subn(r'<title>.*?</title>', f'<title>{esc(p["title"])}</title>', s, count=1, flags=re.S)
    s, n2 = re.subn(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(p["desc"])}">', s, count=1)
    assert n1 == 1 and n2 == 1, f
    s = s.replace('<meta name="description"', '<meta name="description"', 1)
    i = s.index('>', s.index('<meta name="description"')) + 1
    s = s[:i] + block + s[i:]
    open(fp, 'w', encoding='utf-8').write(s)
    print(f'{f}: title {len(p["title"])} chars, desc {len(p["desc"])} chars')
