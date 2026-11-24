// ONEWORK — Projects page. Mist tone. Banner: the ribbon tower gathers from scattered pieces (MOTION.md §4) while the
// words keep changing type. Hall: projects on a ring of curved screens that turns with scroll.
import * as THREE from 'three';
import { gsap, ScrollTrigger, motion, STATIC, isSmall, root, setupReveals, onLangChange, onMotionChange, fontsReady } from './site.js?v=20261124m';

const animated = () => !STATIC && !motion.calm;
// Image paths are worked out from this script's address, so they work on /projects/ and /zh/projects/ alike.
const ASSETS = new URL('../', import.meta.url).href;
const lang = () => (root.lang === 'zh-Hant' ? 'zh' : 'en');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const C = { teal900: 0x47868d, teal700: 0x5b8f96, teal500: 0x759fa4, teal300: 0x8badb1, teal100: 0x9eb9bd, paper: 0xf2f2f2 };

/* ---------- Projects (from onework.io/projects; images to be provided) ---------- */
// img: the feature image, shown on the ring, in the hover preview and at the top of the project window.
// shots: screenshots shown below the copy inside the window, in the suggested order.
// ALL_PROJECTS keeps every project; only those with a real feature image are shown for now.
const ALL_PROJECTS = [
  { key: 'fm', tone: '#47868D', img: null, platform: 'fm',
    en: { t: '3D Facility Management', c: 'FM · Facility Management', d: 'Building data from SCADA and gateway systems, managed inside one 3D model.' },
    zh: { t: '3D 設施管理', c: 'FM · 設施管理', d: '把 SCADA 與閘道器系統的建築數據，放進同一個 3D 模型管理。' },
    tags: ['SCADA', 'Gateway', 'BIM'] },
  { key: 'gis-city', tone: '#5B8F96', img: null, platform: 'cim',
    en: { t: '3D GIS City Monitoring', c: 'CIM · Smart City', d: '3D BIM, Cesium and IoT combined to monitor sensors across a whole city.' },
    zh: { t: '3D GIS 城市監控', c: 'CIM · 智慧城市', d: '結合 3D BIM、Cesium 與 IoT，監控整座城市的感測器。' },
    tags: ['GIS', 'Cesium', 'IoT'] },
  { key: 'scan', tone: '#759FA4', img: null, platform: 'cim',
    en: { t: 'AI 3D Scanning', c: 'Reality Capture', d: 'Drones and 3D scanners turn real sites into measurable models.' },
    zh: { t: 'AI 3D 掃描', c: '實景擷取', d: '用無人機與 3D 掃描設備，把真實現場變成可量測的模型。' },
    tags: ['Drone', '3D Scan', 'AI'] },
  { key: 'disaster', tone: '#3D3D3D', img: null, platform: 'cim',
    en: { t: 'Post-disaster 3D Reconstruction', c: 'Reality Capture', d: 'AI 3D scanning applied to rebuilding damaged sites as accurate models.' },
    zh: { t: '災後 3D 重建', c: '實景擷取', d: '以 AI 3D 掃描，把受損現場重建成精確模型。' },
    tags: ['Drone', '3D Scan', 'AI'] },
  { key: 'lifecycle', tone: '#5B8F96', img: null, platform: 'pmis',
    en: { t: 'Construction Lifecycle', c: 'Airhub · BIM + PLM', d: 'Airhub SaaS lets every party of a construction project co-work online.' },
    zh: { t: '營建全生命週期', c: 'Airhub · BIM + PLM', d: 'Airhub SaaS 讓營建專案的所有參與者在線上協作。' },
    tags: ['Airhub', 'BIM', 'PLM'] },
  { key: 'terrain', tone: '#47868D', img: null, platform: 'cim',
    en: { t: 'GIS Terrain Analysis', c: 'CIM · Airport', d: 'A GIS web tool for airport terrain analysis and measurement.' },
    zh: { t: 'GIS 地形分析', c: 'CIM · 機場', d: '機場地形分析與量測的 GIS 網頁工具。' },
    tags: ['GIS', 'Terrain', 'Airport'] },
  { key: 'ems', tone: '#759FA4', img: ASSETS + 'projects/ems/00-feature.jpg', platform: 'ems',
    en: { t: 'EMS Energy Management', c: 'EMS · Energy', d: 'Power data from SCADA and smart meters, with AI forecasts and monthly reports.',
      h: 'Understand site operations from energy flows to event tracking',
      p: ['The Energy Management System presents the relationships between solar generation, battery storage, generators and electrical loads through an energy flow dashboard. Generation, load power, battery state of charge (SOC) and equipment status help operators understand supply and demand and storage charging and discharging without repeatedly switching between equipment interfaces.',
        'A single-line diagram (SLD) visualizes the electrical architecture, while generation, load and revenue trends support performance comparisons across periods. An alarm and maintenance log brings event and handling information together for follow-up. Where project integration maps spaces, equipment and measurement points to a building digital twin, operators can examine energy data in its asset and location context.'] },
    zh: { t: 'EMS 能源管理', c: 'EMS · 能源', d: '讀取 SCADA 與智慧電表的電力數據，AI 產出用電預測與月報。',
      h: '從能源流向到事件追蹤，掌握場域運轉狀態',
      p: ['能源管理系統以能源流向儀表板（Energy Flow Dashboard）呈現太陽光電、儲能系統、發電機與用電負載之間的關係。管理人員可透過發電量、負載功率、儲能荷電狀態（State of Charge, SOC）及設備運轉狀態，掌握供需與儲能充放電情形，降低在多個設備介面間交叉比對的負擔。',
        '電力單線圖（Single-Line Diagram, SLD）提供電力架構的視覺化檢視；發電、負載與收益趨勢圖則有助於比較不同期間的能源表現。告警與維護紀錄（Alarm and Maintenance Log）集中呈現事件及處理資訊，協助營運人員追蹤異常。若與建築數位分身的空間、設備及量測點建立對應關係，可進一步在設備與位置脈絡中檢視能源資料；串接範圍須依專案確認。'] },
    shots: [
      { src: ASSETS + 'projects/ems/01-FEATURE-energy-flow-dashboard.png', en: 'Energy flow and live operations dashboard', zh: '能源流向與即時運轉儀表板' },
      { src: ASSETS + 'projects/ems/02-electrical-single-line-diagram.png', en: 'Electrical single-line diagram', zh: '電力單線圖' },
      { src: ASSETS + 'projects/ems/03-generation-sales-overview.png', en: 'Generation and revenue trends', zh: '發電與收益趨勢分析' },
      { src: ASSETS + 'projects/ems/04-mine-load-analysis.png', en: 'Load analysis', zh: '負載趨勢分析' },
      { src: ASSETS + 'projects/ems/05-alarm-maintenance-log.png', en: 'Alarm and maintenance log', zh: '告警與維護紀錄' },
    ],
    tags: ['SCADA', 'Modbus', 'AI'] },
  { key: 'command-center', tone: '#47868D', img: ASSETS + 'projects/command-center/00-feature.jpg', platform: 'twin',
    en: { t: 'Building Digital Twin Command Center', c: 'Digital Twin · Command Center', d: 'Equipment status, alarms and site indicators shown on a 3D building model.',
      h: 'Bring equipment status and alarms together in a spatial model',
      p: ['A building digital twin command center brings spatial context to equipment status and alarms through a 3D building model. Operators can move from the site overview to views of HVAC, lighting, temperature, elevators, EV charging and solar generation, and review equipment information by location; the server room view presents UPS status through equipment racks and measurements.',
        'Alarm markers on the building model, together with an alarm list and associated imagery, help operators locate and investigate events. Connected equipment, update frequency, alarm workflows and control capabilities depend on the equipment and integration scope of each project.'] },
    zh: { t: 'Digital Twin 戰情室', c: 'Digital Twin · 戰情室', d: '以三維建築模型呈現設備狀態、告警與場域指標。',
      h: '以空間模型整合設備狀態與告警資訊',
      p: ['Digital Twin 戰情室以三維建築模型為操作脈絡，呈現設備位置、系統狀態與場域指標。管理人員可由場域總覽切換至空調、照明、溫度、電梯、充電樁及太陽光電等視圖，依空間位置檢視設備相關資訊；機房 UPS 畫面則以設備機櫃與量測資訊呈現機房運轉狀態。',
        '告警視圖將事件標示於建築模型，並搭配告警清單及影像畫面，協助維運人員辨識事件位置與檢視相關資訊。實際接入設備、資料更新頻率、告警流程及控制功能，須依專案設備與整合範圍確認。'] },
    shots: [
      { src: ASSETS + 'projects/command-center/01-FEATURE-building-overview.jpg', en: 'Building model and cross-system overview', zh: '建築模型與跨系統總覽' },
      { src: ASSETS + 'projects/command-center/02-spatial-alarms.jpg', en: 'Spatial alarms and events', zh: '空間告警與事件畫面' },
      { src: ASSETS + 'projects/command-center/03-operations-dashboard.jpg', en: 'Site operations dashboard', zh: '場域營運指標總覽' },
      { src: ASSETS + 'projects/command-center/04-temperature-heatmap.jpg', en: 'Floor temperature distribution', zh: '樓層溫度分布' },
      { src: ASSETS + 'projects/command-center/05-hvac-monitoring.jpg', en: 'HVAC equipment status', zh: '空調設備狀態' },
      { src: ASSETS + 'projects/command-center/06-ups-monitoring.jpg', en: 'Server room racks and UPS status', zh: '機櫃與 UPS 狀態' },
      { src: ASSETS + 'projects/command-center/07-lighting-monitoring.jpg', en: 'Floor lighting view', zh: '樓層照明視圖' },
      { src: ASSETS + 'projects/command-center/08-solar-monitoring.jpg', en: 'Solar equipment view', zh: '光電設備視圖' },
      { src: ASSETS + 'projects/command-center/09-ev-charging.jpg', en: 'EV charging view', zh: '充電設備視圖' },
      { src: ASSETS + 'projects/command-center/10-elevator-monitoring.jpg', en: 'Elevator view', zh: '電梯空間視圖' },
    ],
    tags: ['3D Model', 'Alarms', 'HVAC', 'UPS'] },
  { key: 'energy-analytics', tone: '#5B8F96', img: ASSETS + 'projects/energy-analytics/00-feature.jpg', platform: null,
    en: { t: 'Energy and Carbon Analytics', c: 'EMS · Energy & Carbon', d: 'Energy data from multiple EMS platforms and sites, with Scope 1, 2 and 3 carbon analysis, KPI tracking and inventory reports.',
      h: 'Bring energy and carbon data together for efficiency and decarbonization',
      p: ['Integrate data from multiple energy management systems (EMS) and site sources to manage electricity, water and other resource use across buildings, campuses, ports and other large sites. Cross-area and time-period analysis helps managers identify high-consumption areas and peak loads, plan efficiency measures, manage energy costs and track results over time. Available views include energy trends, demand, time-of-use and area comparisons.',
        'Carbon analysis totals greenhouse gas emissions in tCO₂e by Scope 1, 2 and 3, by year, month, week, day or a custom period, with a selectable GWP basis such as IPCC AR5 or AR6. KPI tracking compares the base year, reduction target and annualized estimate to show whether the target is on track, while scope shares, the top five emission sources and monthly trends against the same period last year point to where emissions come from.',
        'Purchased electricity and water can sync automatically; other sources are recorded by hand with supporting documents, and items such as waste removal can link to property management. The greenhouse gas inventory moves through four steps (completeness check, emissions confirmation, quality assessment and export), records how each source is measured (continuous, periodic or financial records, or self-assessed), notes the inventory basis such as ISO 14064-1 and the GHG Protocol, and exports to ODS, Excel and PDF.',
        'Results depend on metering, data quality, emission factors, GWP settings and tariff configuration, and are confirmed for each project; the platform does not replace third-party verification. Example platforms that can be assessed for integration include Siemens Building X Energy Manager, Schneider Electric EcoStruxure Power Monitoring Expert and Honeywell Forge Sustainability+ for Buildings (Carbon & Energy Management); these are examples for assessment, not claims of completed integrations.'] },
    zh: { t: '能源與碳排分析', c: 'EMS · 能源與碳排', d: '整合多家 EMS 與場域能源資料，並以範疇一、二、三分析碳排放、追蹤減碳 KPI 及產出盤查清冊。',
      h: '整合能源與碳排資訊，支援節能改善與減碳管理',
      p: ['整合多家能源管理系統（EMS）與場域能源資料，集中蒐集及管理用電、用水等資訊，適用於建築、園區、港區及其他大範圍場域。透過跨區域及跨期間分析，協助管理人員掌握用能分布、辨識高耗能區域與尖峰負載，作為擬定節能措施、管理能源成本及追蹤改善成效的依據；系統畫面提供用電趨勢、需量、尖離峰、區域及時間對比等分析視角。',
        '碳排分析依範疇一、二、三彙整溫室氣體排放量（tCO₂e），可依年、月、週、日或自訂期間檢視，並選擇 IPCC AR5、AR6 等 GWP 版本。KPI 追蹤比對基準年排放量、減碳目標與年化推估，判斷是否可望達標；範疇占比、排放源 Top 5 及月度趨勢（含去年同期比較）協助找出主要排放來源。',
        '外購電力與自來水等資料可自動同步，其他排放源以手填登記並附佐證，廢棄物清運等項目可與物業管理連動。盤查清冊依完整性檢查、排放量確認、品質評估及匯出清冊四個步驟進行，標示各排放源的量測頻率（連續量測、定期量測／財務單據、自行評估），可記錄 ISO 14064-1、GHG Protocol 等盤查依據，並匯出 ODS、Excel 與 PDF。',
        '分析結果取決於計量配置、資料品質、排放係數、GWP 設定及費率條件，依專案確認，並不取代第三方查證。可評估整合之公開系統範例包括 Siemens Building X Energy Manager、Schneider Electric EcoStruxure Power Monitoring Expert 及 Honeywell Forge Sustainability+ for Buildings（Carbon & Energy Management）；上述為公開產品範例，並非已完成整合之聲明。'] },
    shots: [
      { src: ASSETS + 'projects/energy-analytics/01-FEATURE-energy-dashboard.jpg', en: 'Energy indicators and daily load profile', zh: '能源指標與日負載曲線' },
      { src: ASSETS + 'projects/energy-analytics/02-demand-analysis.jpg', en: 'Demand curve and contract capacity', zh: '需量曲線與契約容量' },
      { src: ASSETS + 'projects/energy-analytics/03-time-of-use-analysis.jpg', en: 'Time-of-use consumption', zh: '分時用電結構' },
      { src: ASSETS + 'projects/energy-analytics/04-energy-consumption-analysis.jpg', en: 'Consumption composition and distribution', zh: '用電組成與分布' },
      { src: ASSETS + 'projects/energy-analytics/05-area-energy-analysis.jpg', en: 'Area trends and comparison', zh: '區域趨勢與比較' },
      { src: ASSETS + 'projects/energy-analytics/06-period-comparison.jpg', en: 'Period comparison', zh: '不同期間用電差異' },
      { src: ASSETS + 'projects/energy-analytics/07-area-comparison.jpg', en: 'Share of consumption by building', zh: '建築間能耗占比' },
      { src: ASSETS + 'projects/energy-analytics/08-meter-hierarchy.jpg', en: 'Meter hierarchy settings', zh: '計量設備層級設定' },
      { src: ASSETS + 'projects/energy-analytics/09-renewable-generation.jpg', en: 'Renewable generation trends', zh: '再生能源發電趨勢與統計' },
      { src: ASSETS + 'projects/energy-analytics/11-carbon-analysis-report.jpg', en: 'Carbon analysis report: Scope 1–3, KPI tracking and monthly trends', zh: '碳排分析報表：範疇一至三、KPI 追蹤與月度趨勢' },
      { src: ASSETS + 'projects/energy-analytics/10-carbon-inventory-emissions.jpg', en: 'Inventory step 2: emissions by source and measurement method', zh: '盤查清冊：排放量計算確認' },
      { src: ASSETS + 'projects/energy-analytics/12-carbon-data-entry.jpg', en: 'Data entry: automatic sync and manual records', zh: '數據登記：自動同步與手填項目' },
    ],
    tags: ['Multi-EMS', 'Multi-site', 'Demand', 'Carbon', 'Scope 1–3', 'ISO 14064-1'] },
  { key: 'bersn', tone: '#759FA4', img: ASSETS + 'projects/bersn/00-feature.jpg', platform: null,
    en: { t: 'BERSn-Pro Building Energy Assessment', c: 'BERSn-Pro · Energy Assessment', d: 'Simplified 3D massing, IFC data checks and energy calculations in one web workflow for building design.',
      h: 'Bring energy assessment into building design decisions',
      p: ['BERSn-Pro combines simplified 3D massing, IFC data checks, envelope and equipment inputs, and energy calculations in a web workflow. EEI, efficiency grades, energy savings and energy- and carbon-related indicators help owners and design teams review the effects of their design assumptions.',
        'Scenario and estimated cost comparisons support discussions, while reports and review workflows help organize project information. Inputs require professional verification; estimates are not quotations and calculated results are not official certification.'] },
    zh: { t: 'BERSn-Pro 建築能效評估平台', c: 'BERSn-Pro · 建築能效評估', d: '將簡化 3D 建築量體、IFC 模型資料檢查與能效計算，整合於同一個網頁工作流程。',
      h: '讓建築能效評估，成為設計決策的依據',
      p: ['BERSn-Pro 將簡化 3D 建築量體、IFC 模型資料檢查、外殼與設備參數，以及能效計算整合於網頁工作流程。設計團隊可依建築用途與設計條件填寫資料，檢視 EEI、能效等級、節能率及耗能、碳排相關指標，協助業主理解設計選擇對評估結果的影響。',
        '方案比較結合預估成本及能效變化，提供改善方向的討論基礎；報告與案件審查流程協助團隊整理資料及追蹤狀態。模型與設備資料仍須依設計文件及專業判斷核對，成本估算不是正式報價，計算結果亦不等同官方認證。住宅案件適用性須依平台版本及個案確認。'] },
    shots: [
      { src: ASSETS + 'projects/bersn/01-FEATURE-3d-building-model.jpg', en: '3D massing and floor management', zh: '3D 量體與樓層管理' },
      { src: ASSETS + 'projects/bersn/02-envelope-window-orientation.jpg', en: 'Window orientation and the model', zh: '開窗方向與模型' },
      { src: ASSETS + 'projects/bersn/03-floor-plan-massing-slide28.jpg', en: 'Plan view and multi-shape modelling', zh: '俯視平面與多形狀建模' },
      { src: ASSETS + 'projects/bersn/04-multi-zone-model-slide33.jpg', en: 'Multi-zone model and parameters', zh: '多區模型及參數操作' },
      { src: ASSETS + 'projects/bersn/05-building-parameters-slide43.jpg', en: 'Basic parameters and model view', zh: '基本參數及模型視圖' },
    ],
    tags: ['3D Massing', 'IFC', 'EEI', 'Energy Grade'] },
  { key: 'pmis', tone: '#47868D', img: ASSETS + 'projects/pmis/00-feature.jpg', platform: 'pmis',
    en: { t: 'PMIS Project Management Information System', c: 'PMIS · Construction', d: 'Construction logs, electronic reports, signatures and workflows in one workspace, on desktop and mobile.',
      h: 'Bring construction records, documents and review workflows together',
      p: ['The Project Management Information System (PMIS) brings daily construction logs, log overviews, electronic reports and custom reports into one workspace. Project teams can compile field records and review reporting information in a consistent environment. Electronic signatures and workflows support signing and routing reports and related documents through the applicable process, reducing reliance on paper-based handoffs and coordination between parties.',
        'File management, electronic meeting attendance records, official correspondence and permission management help owners, construction supervisors and contractors access information according to their responsibilities. The mobile experience includes a notification center, issue reporting, meetings, file management and training, enabling site personnel to handle daily work on their phones and communicate information between the field and office more efficiently.',
        'Construction logs, reports and project documents can provide an information foundation for a building digital twin. Where project requirements establish links to models, spaces or components, these records can be accessed in the relevant context. The integration scope depends on the project.'] },
    zh: { t: 'PMIS 工程專案管理資訊系統', c: 'PMIS · 工程管理', d: '施工日誌、電子化報表、電子簽名與工作流程整合在同一平台，桌機與手機都能使用。',
      h: '讓施工紀錄、文件與審查流程在同一平台流轉',
      p: ['工程專案管理資訊系統（PMIS）將施工日誌、日誌總覽、電子化報表與自定義報表納入同一作業平台，協助專案團隊彙整現場紀錄，掌握各項資料的填報與查閱情形。透過電子簽名及工作流程（Workflow），報表與相關文件可依作業程序進行簽署及流轉，減少紙本傳遞與跨單位溝通的負擔。',
        '系統亦涵蓋檔案管理、電子化會議簽到紀錄、公文管理及權限管理，協助業主、監造與施工團隊依職責存取所需資訊，讓工程文件與作業紀錄更容易查找。手機版提供通知中心、異常通報、會議、檔案管理及教育訓練功能，讓施工人員在現場即可使用手機處理日常作業，縮短現場與辦公室之間的資訊傳遞時間。',
        '在建築數位分身應用中，施工日誌、報表與工程文件可作為工程階段的資訊基礎；若依專案需求建立與模型、空間或構件的關聯，後續即可在相應脈絡中查閱資料。實際關聯方式及整合範圍須依專案確認。'] },
    shots: [
      { src: ASSETS + 'projects/pmis/05-document-editing.png', en: 'Electronic document editing', zh: '工程資料與電子化文件' },
      { src: ASSETS + 'projects/pmis/01-FEATURE-project-map.png', en: 'Multi-project map view', zh: '跨專案地圖檢視' },
      { src: ASSETS + 'projects/pmis/02-project-overview.png', en: 'Project and log overview', zh: '專案與日誌總覽' },
      { src: ASSETS + 'projects/pmis/04-document-library.png', en: 'File management', zh: '檔案管理' },
      { src: ASSETS + 'projects/pmis/08-mobile-iphone-mockup.png', en: 'Mobile file access on site', zh: '手機版作業', tall: true },
    ],
    tags: ['PMIS', 'Workflow', 'e-Signature', 'Mobile'] },
  { key: 'property', tone: '#5B8F96', img: ASSETS + 'projects/property/00-feature.jpg', platform: 'fm',
    en: { t: 'Property Management System', c: 'FM · Property Management', d: 'Asset registers, maintenance, inspections and repairs, plus tenant services such as facility booking, parcels and visitors, for day-to-day building operations.',
      h: 'Connect asset registers, maintenance plans and field tasks',
      p: ['Built on equipment and asset registers, the system brings maintenance plans, task views, security patrols, safety inspections and shift calendars together to track day-to-day maintenance and repairs. Repair orders move from dispatch through repair and review to closure, recording the vendor, warranty, cost and replaced parts, and an abnormal inspection item can raise a repair request on the spot.',
        'The home dashboard gathers tenant services such as facility booking, parcels and visitor registration. Shared facilities can be searched by time slot, headcount and points and viewed on a booking schedule, and issues reported through a tenant representative or LINE@ can be turned straight into repair or cleaning work orders. Where records are mapped to a building digital twin, they can be reviewed in spatial context; integration scope depends on the project.'] },
    zh: { t: '物業管理系統', c: 'FM · 物業管理', d: '設備與資產台帳、維運計畫、巡檢與報修，加上公設預約、郵務包裹與訪客等廠戶服務，串起日常建築維運。',
      h: '以設備台帳、維護計畫與現場任務串接建築維運',
      p: ['以設備與資產台帳為基礎，整合維運計畫、待辦任務、保全巡邏、環安巡檢與排班，掌握日常維護與報修進度。報修單依待派工、修繕中、待審核至結案追蹤，並記錄廠商、保固、成本與更換零件；巡檢發現異常可當場申請報修。',
        '首頁集中公設預約、郵務包裹與訪客登記等廠戶服務；公共設施可依時段、人數與點數查詢並以排程表檢視，廠戶透過代表或 LINE@ 通報的問題可直接轉為報修或清潔工單。若對應至建築數位分身，可在空間脈絡中查閱維運資訊，整合範圍依專案確認。'] },
    shots: [
      { src: ASSETS + 'projects/property/01-FEATURE-maintenance-plan.png', en: 'Maintenance plan', zh: '維運計畫' },
      { src: ASSETS + 'projects/property/02-equipment-inventory.png', en: 'Equipment register', zh: '設備台帳' },
      { src: ASSETS + 'projects/property/03-asset-inventory.png', en: 'Asset register', zh: '資產台帳' },
      { src: ASSETS + 'projects/property/04-task-dashboard.png', en: 'Task dashboard', zh: '待辦任務' },
      { src: ASSETS + 'projects/property/05-security-patrol-map.png', en: 'Security patrol configuration on the floor plan', zh: '空間巡邏設定' },
      { src: ASSETS + 'projects/property/06-security-patrol-tasks.png', en: 'Patrol tasks', zh: '巡邏任務' },
      { src: ASSETS + 'projects/property/07-inspection-checklist.png', en: 'Inspection checklist', zh: '巡檢表' },
      { src: ASSETS + 'projects/property/08-shift-calendar.png', en: 'Shift calendar', zh: '排班管理' },
      { src: ASSETS + 'projects/property/09-fm-home-dashboard.jpg', en: 'Home dashboard: tenant services, bookings, repairs and tasks', zh: '首頁：廠戶服務、預約、報修與任務' },
      { src: ASSETS + 'projects/property/11-facility-booking-search.jpg', en: 'Facility booking search', zh: '公共設施預約查詢' },
      { src: ASSETS + 'projects/property/10-facility-booking-schedule.jpg', en: 'Facility booking schedule', zh: '公設排程' },
      { src: ASSETS + 'projects/property/13-tenant-issue-report.jpg', en: 'Tenant issues converted to repair or cleaning orders', zh: '廠戶問題回報與轉單' },
      { src: ASSETS + 'projects/property/12-repair-report.jpg', en: 'Repair order tracking and report', zh: '報修管理與回報' },
      { src: ASSETS + 'projects/property/14-equipment-inspection-report.jpg', en: 'Equipment inspection checklist with repair request', zh: '設備巡檢回報與申請報修' },
    ],
    tags: ['Assets', 'Maintenance', 'Inspection', 'Repair', 'Booking', 'Tenant Services'] },
  { key: 'gis', tone: '#47868D', img: ASSETS + 'projects/gis/00-feature.jpg', platform: 'gis',
    en: { t: 'GIS and Smart City Applications', c: 'GIS · Smart City', d: 'Cesium 3D geospatial views, GIS map layers and IoT sensor data put city information back in its place.',
      h: 'See city data in its spatial context',
      p: ['Combine Cesium-based 3D geospatial visualization, GIS map layers and IoT sensor data to review buildings, infrastructure and observations in their geographic context. Maps and information panels support day-to-day operations and coordination across teams.',
        'Potential applications include water, energy, green assets and public infrastructure; data sources, refresh rates and functionality depend on the project. The screens shown come from different project scenarios and do not all belong to a single product.'] },
    zh: { t: 'GIS 與智慧城市應用', c: 'GIS · 智慧城市', d: '結合 Cesium 三維地理空間、GIS 圖層與 IoT 感測資料，讓城市資料回到空間現場。',
      h: '讓城市資料回到空間現場，掌握分布與狀態',
      p: ['結合 Cesium 三維地理空間視覺化、GIS 地圖圖層與 IoT 感測資料，將建築、公共設施與量測資訊放回地理位置脈絡中。管理人員可透過圖台與資訊面板，檢視設施分布及可取得的狀態資料，協助日常管理與跨單位溝通。',
        '應用可涵蓋水環境、場域能源、綠地與公共設施管理；感測資料來源、更新頻率與功能範圍依個別專案確認。現有素材呈現不同專案情境，並非所有功能已整合在單一產品。'] },
    shots: [
      { src: ASSETS + 'projects/gis/01-FEATURE-3d-site-dashboard.jpg', en: '3D site energy dashboard', zh: '3D 場域能源儀表板' },
      { src: ASSETS + 'projects/gis/02-water-monitoring-map.jpg', en: 'Water level and rainfall map', zh: '水位與雨量地圖' },
      { src: ASSETS + 'projects/gis/03-green-assets-map.jpg', en: 'Green space and tree map', zh: '綠地與樹木圖台' },
      { src: ASSETS + 'projects/gis/04-port-dashboard-AI-edited.jpg', en: 'Smart port dashboard', zh: '智慧港區儀表板' },
    ],
    tags: ['Cesium', 'GIS', 'IoT', '3D'] },
  { key: 'bim', tone: '#5B8F96', img: ASSETS + 'projects/bim/00-feature.jpg?v=20261121b', platform: 'bim',
    en: { t: 'BIM Data and Web Visualization', c: 'BIM · Web Visualization', d: 'Optimized BIM models viewed in the browser, with drawing directories, component structure and IFC review.',
      h: 'Explore BIM models and project information on the web',
      p: ['Combine 3D model optimization and web visualization to help teams review building and site models in a browser. Drawing directories and component structure views provide a shared context for finding information and discussing design, construction and operations.',
        'An IFC review workspace includes adding models, filtering by level and component, warning review, batch data entry and export controls. IFC exchange coverage and data completeness depend on the source software, version and settings; compatibility and performance also depend on model complexity, network and device.'] },
    zh: { t: 'BIM 圖資與輕量化網頁應用', c: 'BIM · 網頁模型', d: '結合 3D 模型輕量化與網頁視覺化，透過瀏覽器檢視建築及場域模型。',
      h: '讓 BIM 模型與圖資，在網頁中更容易查閱與協作',
      p: ['BIM 圖資平台結合 3D 模型輕量化與網頁視覺化，協助團隊透過瀏覽器檢視建築及場域模型，搭配圖資目錄和構件結構查找資訊、掌握空間與模型內容，為設計、施工與維運溝通提供共同的視覺脈絡。',
        'IFC 合模檢查工作台畫面展示模型加入、樓層與構件篩選、警告檢視、批次資料填寫與匯出修改。IFC 交換的支援範圍及資料完整性依來源軟體、版本與設定確認；模型瀏覽效能也會受到模型複雜度、網路和設備影響。'] },
    shots: [
      { src: ASSETS + 'projects/bim/01-FEATURE-bim-model-structure.jpg', en: 'Building model and component structure', zh: '建築模型與構件結構' },
      { src: ASSETS + 'projects/bim/02-bim-building-model.jpg', en: 'Building model viewing', zh: '建築模型瀏覽' },
      { src: ASSETS + 'projects/bim/03-large-site-model.jpg', en: 'Large site model', zh: '大型場域模型' },
      { src: ASSETS + 'projects/bim/04-ifc-model-qa-workspace.jpg', en: 'IFC review and batch data workspace', zh: 'IFC 檢查與批次作業' },
    ],
    tags: ['BIM', 'IFC', 'Web 3D', 'Model Optimization'] },
  { key: 'spatial', tone: '#47868D', img: ASSETS + 'projects/spatial/00-feature.jpg', platform: 'spatial',
    en: { t: 'Drone Imagery and AI Spatial Reconstruction', c: 'Spatial · 3D Gaussian Splatting', d: 'Drone imagery, 3D Gaussian Splatting and AI processing turn site photos into 3D scenes.',
      h: 'Turn site imagery into usable 3D spatial context',
      p: ['Combine drone imagery, 3D Gaussian Splatting and AI-assisted processing to reconstruct site scenes for project review. The workflow covers image preparation, camera estimation, reconstruction and Splat and engineering USD deliverables.',
        'Examples span road works, venues, transit facilities and urban scenes. Results can be used in 3D city scenes in GIS and NVIDIA Omniverse and as a visual basis for BIM or smart-building data integration. Deliverables, processing time and integration depend on image conditions and project requirements.'] },
    zh: { t: '無人機影像與 AI 實景空間運算', c: '實景空間運算 · 3D 高斯潑濺', d: '結合無人機影像、3D 高斯潑濺與 AI 運算，從現場影像建立三維空間。',
      h: '從現場影像，建立可應用的三維空間',
      p: ['結合無人機影像、3D Gaussian Splatting（3D 高斯潑濺）與 AI 運算，將多視角影像整理為具有空間脈絡的三維場景。從影像資料整備、相機解算與場景重建，到擬真 Splat 及工程 USD 成果，協助團隊以直觀方式理解工程現場、建築與周邊環境。',
        '應用涵蓋施工路段、體育館、交通場站及城市等場景；依專案需求，成果可應用於 GIS、NVIDIA Omniverse 等 3D 城市場景，並作為 BIM 或智慧建築資料整合的視覺基礎。實際成果、處理時間及整合範圍依影像條件與專案需求確認。'] },
    shots: [
      { src: ASSETS + 'projects/spatial/01-drone-construction-imagery.jpg', en: 'Drone imagery of a construction site', zh: '影像輸入：施工現場空拍' },
      { src: ASSETS + 'projects/spatial/02-spatial-reconstruction-process.jpg', en: 'Camera estimation and scene reconstruction', zh: '相機解算與場景重建' },
      { src: ASSETS + 'projects/spatial/03-engineering-scene-workspace.jpg', en: 'Engineering scene as a Splat and USD deliverable', zh: '成果交付：Splat＋工程 USD' },
      { src: ASSETS + 'projects/spatial/05-stadium-scene.jpg', en: 'Stadium scene', zh: '體育館場景' },
      { src: ASSETS + 'projects/spatial/06-transport-area-3d-gis.jpg', en: 'Transit area in 3D GIS', zh: '交通場站 3D GIS 場景' },
      { src: ASSETS + 'projects/spatial/07-transit-interior-3d-gaussian.jpg', en: 'Transit interior as a 3D Gaussian scene', zh: '交通場站室內 3D 高斯場景' },
      { src: ASSETS + 'projects/spatial/10-image-input-sequence.jpg', en: 'Input image sequence', zh: '輸入影像序列' },
      { src: ASSETS + 'projects/spatial/11-road-scene.jpg', en: 'Road scene', zh: '道路場景' },
    ],
    tags: ['Drone', '3D Gaussian Splatting', 'AI', 'USD'] },
  { key: 'dcim', tone: '#5B8F96', img: ASSETS + 'projects/dcim/00-feature.jpg', platform: null,
    en: { t: 'DCIM Data Center Infrastructure Management', c: 'DCIM · Data Center', d: 'A 3D data center view with rack assets, environmental monitoring, alarms, work orders and inspections.',
      h: 'Connect data center spaces, assets and operations',
      p: ['Combine a 3D data center view with rack assets, environmental monitoring, alarms, work orders and inspections, so operations teams can trace from the room overview to a specific rack or device. Power and network topology, capacity planning and maintenance-impact views provide context for operations.',
        'The platform also demonstrates energy analysis, including PUE, consumption trends and demand estimates, and a GenAI operations assistant for work-order, environment and energy queries. Equipment integration, control capabilities, data refresh and functional scope depend on the project.'] },
    zh: { t: 'DCIM 機房管理', c: 'DCIM · 機房管理', d: '以 3D 數位孿生呈現機房與機櫃，結合資產、環境監測、告警、工單與巡檢。',
      h: '從機房空間到設備維護，掌握營運全貌',
      p: ['以 3D 數位孿生呈現機房、機櫃及設備位置，結合資產配置、環境監測、告警、工單與巡檢，協助維運團隊從空間總覽追蹤至特定設備。電力與網路拓樸、容量規劃及維護影響預覽，提供設備關聯與資源安排的管理脈絡。',
        '能源畫面展示 PUE、用電趨勢及需量試算；GenAI 營運助手展示工單、環境與能源查詢。實際設備串接、控制能力、資料更新及功能範圍依專案確認。'] },
    shots: [
      { src: ASSETS + 'projects/dcim/01-FEATURE-3d-datacenter.jpg', en: '3D data center overview', zh: '3D 機房總覽' },
      { src: ASSETS + 'projects/dcim/02-rack-asset-configuration.jpg', en: 'Rack and asset configuration', zh: '機櫃配置' },
      { src: ASSETS + 'projects/dcim/03-environment-trends.jpg', en: 'Environmental trends', zh: '環境趨勢' },
      { src: ASSETS + 'projects/dcim/04-alarm-spatial-location.jpg', en: 'Alarms located in 3D', zh: '告警與位置' },
      { src: ASSETS + 'projects/dcim/05-power-network-topology.jpg', en: 'Power and network topology', zh: '電力與網路拓樸' },
    ],
    tags: ['DCIM', '3D Digital Twin', 'Racks', 'Alarms', 'PUE'] },
  { key: 'bim-fm', tone: '#3D3D3D', img: null, platform: 'fm',
    en: { t: '3D BIM-enabled FM System', c: 'FM · Facility Management', d: 'Works with common SCADA systems and IoT communication.' },
    zh: { t: '3D BIM 設施管理系統', c: 'FM · 設施管理', d: '串接常見 SCADA 系統與 IoT 通訊。' },
    tags: ['BIM', 'SCADA', 'IoT'] },
  { key: 'ba', tone: '#5B8F96', img: null, platform: 'fm',
    en: { t: '3D Building Automation', c: 'FM · BA + FM', d: 'Federated BIM models made light enough for facility management, linked to SCADA.' },
    zh: { t: '3D 建築自動化', c: 'FM · BA + FM', d: '把整合後的 BIM 模型輕量化給設施管理使用，並串接 SCADA。' },
    tags: ['BIM', 'SCADA', 'PLC'] },
  { key: 'solar', tone: '#47868D', img: null, platform: 'ems',
    en: { t: 'Power Distribution Tool for a Solar Producer', c: 'EMS · Energy', d: 'Project description to be provided.' },
    zh: { t: '太陽能業者配電工具', c: 'EMS · 能源', d: '專案說明待提供。' },
    tags: ['EMS', 'Solar'] },
];
// display order: digital twin and 3D, then FM, energy, engineering, and tools last
const ORDER = ['command-center', 'dcim', 'gis', 'spatial', 'property', 'ems', 'energy-analytics', 'pmis', 'bim', 'bersn'];
const rank = (p) => { const i = ORDER.indexOf(p.key); return i < 0 ? ORDER.length : i; };
const PROJECTS = ALL_PROJECTS.filter((p) => p.img).sort((a, b) => rank(a) - rank(b));
const N = PROJECTS.length;
const pad = (n) => String(n).padStart(2, '0');

/* =====================================================================
   1. Banner words: loop through 10 typefaces, 0.2s each, without a rest
   ===================================================================== */
// f0 is Archivo 900, the chosen still version; f1–f9 only appear during the run (see projects.css)
const FACES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f0'];
const DEFAULT_FACE = 'f0';
const FACE_STEP = 0.2;   // seconds per typeface
const START = 1.2;       // the title holds still first, so it reads within the first second
const letters = [];
document.querySelectorAll('.pj-word').forEach((w) => {
  const text = w.textContent;
  w.textContent = '';
  w.dataset.f = DEFAULT_FACE;
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'l';
    s.textContent = ch;
    w.append(s);
    letters.push(s);
  });
});
const words = [...document.querySelectorAll('.pj-word')];
const setFace = (f) => words.forEach((w) => { w.dataset.f = f; });

// A small sequencer on the GSAP ticker: one typeface per step, looping without a rest.
// Never more than one change per frame, so a slow frame can delay a face but never skip it.
const seq = { on: false, i: -1, next: 0 };
gsap.ticker.add((time) => {
  if (!seq.on || time < seq.next) return;
  seq.i = (seq.i + 1) % FACES.length;
  setFace(FACES[seq.i]);
  seq.next = time + FACE_STEP;
});
function startCycle() {
  if (seq.on || !animated()) return;
  seq.on = true; seq.i = -1; seq.next = gsap.ticker.time + START;
}
function stopCycle() {
  seq.on = false;
  setFace(DEFAULT_FACE);
}
// pause while the banner is off screen
let heroOn = true;
let reelHold = false;   // true while the opening reel plays: the live banner waits on Archivo 900
new IntersectionObserver(([en]) => {
  heroOn = en.isIntersecting;
  if (heroOn && animated() && !reelHold) startCycle(); else if (!heroOn) stopCycle();
}).observe(document.getElementById('pjHero'));

/* =====================================================================
   2. Ribbon tower: the 13 vector ribbons from one work.ai gather from all around into the tower
   ===================================================================== */
const towerEl = document.getElementById('tower');
const ribbons = gsap.utils.toArray('#tower .rb');
gsap.set(towerEl, { transformPerspective: 900 });
gsap.set(ribbons, { transformOrigin: '50% 50%' });
// each ribbon's own direction away from the tower centre, used for the gather-in and the scroll drift
const vb = towerEl.viewBox.baseVal;
const centre = { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 };
ribbons.forEach((el, i) => {
  const b = el.getBBox();
  const dx = b.x + b.width / 2 - centre.x, dy = b.y + b.height / 2 - centre.y;
  const len = Math.hypot(dx, dy) || 1;
  const spin = (i % 2 ? 1 : -1);
  el._dir = { x: dx / len, y: dy / len, spin };
});

let towerIntro = false;
function towerIn() {
  if (!animated()) return;
  towerIntro = true;
  // ribbons start scattered around the tower, turned and small, then pull together into place
  gsap.timeline({ onComplete: () => { towerIntro = false; } })
    .from(ribbons, {
      x: (i, el) => el._dir.x * gsap.utils.random(110, 190) + gsap.utils.random(-30, 30),
      y: (i, el) => el._dir.y * gsap.utils.random(70, 130) + gsap.utils.random(-40, 40),
      rotation: (i, el) => el._dir.spin * gsap.utils.random(40, 110),
      scale: () => gsap.utils.random(0.4, 0.8),
      opacity: 0,
      duration: 1.3, ease: 'expo.out',
      stagger: { each: 0.06, from: 'random' },
    }, 0.2);
}

/* Words come in with the tower: visible well within 1s (MOTION.md §6.4) */
function heroIn() {
  if (!animated()) { gsap.set(letters, { opacity: 1 }); return; }
  gsap.from(letters, { opacity: 0, yPercent: 40, filter: 'blur(10px)', duration: 0.8, ease: 'expo.out', stagger: { amount: 0.5, from: 'random' }, delay: 0.15 });
  gsap.from('.site-header', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out', delay: 0.4 });
  towerIn();
}

const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  if (!animated()) return;
  tilt.tx = ((e.clientY / innerHeight) - 0.5) * 0.18;   // ±5°
  tilt.ty = ((e.clientX / innerWidth) - 0.5) * 0.2;
});
const heroScroll = { p: 0 };
if (!STATIC) {
  ScrollTrigger.create({ trigger: '#pjHero', start: 'top top', end: 'bottom top', onUpdate: (s) => { heroScroll.p = s.progress; } });
  gsap.to('.pj-title', { yPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#pjHero', start: '25% top', end: 'bottom top', scrub: true } });
}

/* =====================================================================
   3. The hall: a ring of curved screens
   ===================================================================== */
const hall = document.getElementById('hall');
const hCanvas = document.getElementById('hallGl');
const hRenderer = new THREE.WebGLRenderer({ canvas: hCanvas, antialias: true });
hRenderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
hRenderer.setClearColor(C.paper, 1);
const hScene = new THREE.Scene();
const hCam = new THREE.PerspectiveCamera(isSmall ? 84 : 50, 1, 0.1, 60);
hCam.position.set(0, 0.35, 0);
hCam.rotation.order = 'YXZ';
hCam.rotation.x = -0.07;   // look slightly down onto the grid
const R = 6;
// with only a few projects, each appears twice round the ring so the screens keep their size and spacing
const SLOTS = N < 8 ? N * 2 : N;
const STEP = (Math.PI * 2) / SLOTS;
const ARC = STEP * 0.8;
const PW = R * ARC;
const PH = PW * 0.62;
const ring = new THREE.Group();
hScene.add(ring);

// Panel textures: drawn on a 2D canvas so they work before real images exist
const TEX_W = 1280, TEX_H = Math.round(1280 * 0.62);
function wrap(ctx, text, maxW) {
  const words = lang() === 'zh' ? [...text] : text.split(' ');
  const lines = []; let line = '';
  words.forEach((w) => {
    const test = line ? (lang() === 'zh' ? line + w : `${line} ${w}`) : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  });
  lines.push(line);
  return lines;
}
function paintPanel(p, i, ctx, img) {
  const L = p[lang()];
  const dark = p.tone !== '#9EB9BD';
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = p.tone; ctx.fillRect(0, 0, TEX_W, TEX_H);
  if (img) {
    const s = Math.max(TEX_W / img.width, TEX_H / img.height);
    ctx.drawImage(img, (TEX_W - img.width * s) / 2, (TEX_H - img.height * s) / 2, img.width * s, img.height * s);
    const g = ctx.createLinearGradient(0, TEX_H * 0.45, 0, TEX_H);
    g.addColorStop(0, 'rgba(26,26,26,0)'); g.addColorStop(1, 'rgba(26,26,26,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, TEX_W, TEX_H);
  } else {
    // ribbon motif from the logo, low contrast
    ctx.save();
    ctx.translate(TEX_W * 0.74, TEX_H * 0.46);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(-260, -60, 520, 120);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-60, -300, 120, 600);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, TEX_W - 72, TEX_H - 72);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '400 22px Jost, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(lang() === 'zh' ? '[ 圖片待提供 ]' : '[ IMAGE TO BE PROVIDED ]', TEX_W - 72, 92);
    ctx.textAlign = 'left';
  }
  ctx.fillStyle = dark ? '#FFFFFF' : '#3D3D3D';
  ctx.font = '500 26px Jost, sans-serif';
  ctx.font = '500 24px Jost, "Noto Sans TC", sans-serif';
  ctx.fillText(L.c.toUpperCase(), 72, TEX_H - 72);
  ctx.font = `900 ${lang() === 'zh' ? 84 : 92}px Archivo, "Noto Sans TC", sans-serif`;
  const lines = wrap(ctx, L.t, TEX_W * 0.72);
  lines.forEach((ln, k) => ctx.fillText(ln, 68, TEX_H - 128 - (lines.length - 1 - k) * 96));
}

const VERT = /* glsl */`
  uniform float uR; uniform float uBend;
  varying vec2 vUv; varying float vEdge;
  void main() {
    vUv = uv;
    vec3 p = position;
    float k = 1.0 + uBend;                       // more speed, more curve
    float a = p.x / uR * k;
    vec3 q = vec3(sin(a) * uR / k, p.y, (1.0 - cos(a)) * uR / k);
    q.y *= 1.0 + uBend * 0.22 * (1.0 - cos(a * 2.0));   // edges stretch a little while it turns
    vEdge = abs(a);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
  }`;
const FRAG = /* glsl */`
  uniform sampler2D map; uniform float uFade; uniform vec3 uPaper;
  varying vec2 vUv; varying float vEdge;
  void main() {
    vec3 c = texture2D(map, vUv).rgb;
    c *= 1.0 - vEdge * 0.35;                     // edges turn away from the light
    gl_FragColor = vec4(mix(uPaper, c, uFade), 1.0);
  }`;

const panels = Array.from({ length: SLOTS }, (_, k) => {
  const i = k % N; const p = PROJECTS[i];
  const cv = document.createElement('canvas');
  cv.width = TEX_W; cv.height = TEX_H;
  const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  // ShaderMaterial writes colours as-is, so the canvas stays in sRGB end to end
  tex.anisotropy = 4;
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, uR: { value: R }, uBend: { value: 0 }, uFade: { value: 1 }, uPaper: { value: new THREE.Color(C.paper) } },
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH, isSmall ? 32 : 64, 8), mat);
  const a = k * STEP;
  mesh.position.set(Math.sin(a) * R, 0.55, -Math.cos(a) * R);
  mesh.rotation.y = -a;
  mesh.userData = { i, a, ctx, tex, img: null };
  ring.add(mesh);
  if (p.img) {
    const im = new Image();
    im.onload = () => { mesh.userData.img = im; paintPanel(p, i, ctx, im); tex.needsUpdate = true; };
    im.src = p.img;
  }
  return mesh;
});
function paintAll() {
  panels.forEach((m) => { const i = m.userData.i; paintPanel(PROJECTS[i], i, m.userData.ctx, m.userData.img); m.userData.tex.needsUpdate = true; });
}

function hallLayout() {
  const w = hCanvas.clientWidth, h = hCanvas.clientHeight;
  hRenderer.setSize(w, h, false);
  hCam.aspect = w / h; hCam.updateProjectionMatrix();
}
hall.style.height = `calc(${(N - 1) * 45}vh + 100vh)`;

/* Scroll turns the ring; the speed of the turn bends the screens */
// the ring loops forever: a slow turn of its own, plus whatever scrolling adds (one full scroll = one full turn)
const turn = { scroll: 0, auto: 0, cur: 0, bend: 0 };
const AUTO_SPEED = STEP / 10;   // about one project every ten seconds
let active = -1;
if (!STATIC) {
  ScrollTrigger.create({
    trigger: hall, start: 'top top', end: 'bottom bottom', pin: '.hall-stage', pinSpacing: false,
    onUpdate: (s) => { turn.scroll = s.progress * N * STEP; },
  });
}

/* Caption: the project in front, swapped with a blur-focus change */
const capTitle = document.getElementById('capTitle');
const capCat = document.getElementById('capCat');
function writeCap(i) {
  const L = PROJECTS[i][lang()];
  capTitle.textContent = L.t; capCat.textContent = L.c;
}
function setActive(i) {
  if (i === active) return;
  const first = active < 0;
  active = i;
  if (first || !animated()) { writeCap(i); return; }
  gsap.timeline()
    .to([capTitle, capCat], { opacity: 0, filter: 'blur(6px)', y: -8, duration: 0.25, ease: 'power3.in', overwrite: true })
    .call(() => writeCap(i))
    .fromTo([capTitle, capCat], { y: 10, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.05 });
}
setActive(0);

function goTo(i) {
  // snap the turn to project i (i may run past either end; the ring simply keeps going round)
  turn.auto += i * STEP - (turn.scroll + turn.auto);
}

document.getElementById('hallPrev').addEventListener('click', () => goTo(Math.round((turn.scroll + turn.auto) / STEP) - 1));
document.getElementById('hallNext').addEventListener('click', () => goTo(Math.round((turn.scroll + turn.auto) / STEP) + 1));
document.getElementById('capOpen').addEventListener('click', () => openProject(active));

/* Hover and click on the screens */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hoverI = -1;
function pick(e) {
  const r = hCanvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, hCam);
  const hit = ray.intersectObjects(panels)[0];
  return hit ? hit.object.userData.i : -1;
}
// Hover a screen: a preview follows the pointer (and the ring pauses). One click opens the project.
let turnSpeed = 0;
function setHover(i, mouse) {
  if (i === hoverI) return;
  hoverI = i;
  hCanvas.classList.toggle('is-hover', i >= 0);
  if (mouse && i >= 0 && !modal.open) showPeek(i); else hidePeek();
}
hCanvas.addEventListener('pointermove', (e) => setHover(pick(e), e.pointerType === 'mouse'));
hCanvas.addEventListener('pointerleave', () => setHover(-1, false));
hCanvas.addEventListener('click', (e) => { const i = pick(e); if (i >= 0 && !modal.open) openProject(i); });

/* =====================================================================
   4. Index list and project detail
   ===================================================================== */
const list = document.getElementById('indexList');
function buildIndex() {
  list.replaceChildren(...PROJECTS.map((p, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="ix-title"></span><span class="ix-cat"></span>`;
    b.querySelector('.ix-title').textContent = p[lang()].t;
    b.querySelector('.ix-cat').textContent = p[lang()].c;
    b.addEventListener('click', () => openProject(i));
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showPeek(i); });
    b.addEventListener('pointerleave', hidePeek);
    li.append(b);
    return li;
  }));
}
// list preview: the project's screen, small, following the pointer (same artwork as the ring, so real images show here too)
const peek = document.createElement('div');
peek.className = 'pj-peek';
peek.setAttribute('aria-hidden', 'true');
const peekCv = document.createElement('canvas');
peekCv.width = 520; peekCv.height = Math.round(520 * TEX_H / TEX_W);
const peekInfo = document.createElement('div');
peekInfo.className = 'pk-info';
peekInfo.innerHTML = '<p class="pk-cat"></p><p class="pk-title"></p><p class="pk-desc"></p><p class="pk-hint"></p>';
peek.append(peekCv, peekInfo);
document.body.append(peek);
const peekX = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3.out' });
const peekY = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3.out' });
function showPeek(i) {
  const pctx = peekCv.getContext('2d');
  pctx.clearRect(0, 0, peekCv.width, peekCv.height);
  pctx.drawImage(panels[i].userData.ctx.canvas, 0, 0, peekCv.width, peekCv.height);
  const L = PROJECTS[i][lang()];
  peekInfo.querySelector('.pk-cat').textContent = L.c;
  peekInfo.querySelector('.pk-title').textContent = L.t;
  peekInfo.querySelector('.pk-desc').textContent = L.d.length > 96 ? L.d.slice(0, 94).trimEnd() + '…' : L.d;
  peekInfo.querySelector('.pk-hint').textContent = lang() === 'zh' ? '點擊查看專案 →' : 'Click to view project →';
  gsap.to(peek, { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
}
function hidePeek() { gsap.to(peek, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power3.out', overwrite: 'auto' }); }
gsap.set(peek, { xPercent: -50, yPercent: -50, scale: 0.9, opacity: 0 });
addEventListener('pointermove', (e) => { peekX(e.clientX + (innerWidth - e.clientX > 340 ? 190 : -190)); peekY(e.clientY); });

buildIndex();

const modal = document.getElementById('pjModal');
const PLATFORM_NAME = { fm: 'FM', cim: 'CIM', pmis: 'PMIS', ems: 'EMS', twin: 'DIGITAL TWIN', gis: 'GIS', bim: 'BIM', spatial: 'SPATIAL' };
function openProject(i) {
  const p = PROJECTS[i]; const L = p[lang()];
  const hero = document.getElementById('mHero');
  hero.hidden = !p.img;
  if (p.img) { hero.querySelector('img').src = p.img; hero.querySelector('img').alt = L.t; }
  document.getElementById('mCat').textContent = L.c;
  document.getElementById('mTitle').textContent = L.t;
  document.getElementById('mDesc').textContent = L.d;
  // long copy: a headline and paragraphs, when the project has them
  const detail = document.getElementById('mDetail');
  detail.replaceChildren();
  detail.hidden = !L.h;
  if (L.h) {
    const h = document.createElement('h3'); h.className = 'm-head'; h.textContent = L.h;
    detail.append(h, ...L.p.map((t) => { const e = document.createElement('p'); e.textContent = t; return e; }));
  }
  // screenshots in the suggested order; placeholders until a project has them
  const shots = document.getElementById('mShots');
  if (p.shots) {
    shots.replaceChildren(...p.shots.map((s) => {
      const f = document.createElement('figure');
      f.className = s.tall ? 'm-shot tall' : 'm-shot';
      const im = document.createElement('img');
      im.src = s.src; im.alt = s[lang()]; im.loading = 'lazy'; im.decoding = 'async';
      const cap = document.createElement('figcaption'); cap.textContent = s[lang()];
      f.append(im, cap);
      return f;
    }));
  } else {
    shots.replaceChildren(...[0, 1].map(() => {
      const d = document.createElement('div'); d.className = 'ph wide';
      d.textContent = lang() === 'zh' ? '[ 專案圖片：待提供 ]' : '[ Project image — to be provided ]';
      return d;
    }));
  }
  const tags = document.getElementById('mTags');
  tags.replaceChildren(...p.tags.map((t) => { const s = document.createElement('span'); s.textContent = t; return s; }));
  const link = document.getElementById('mLink');
  link.hidden = !p.platform;   // a project with no matching section on the Services page shows no link
  link.href = `../product/#${p.platform || ''}`;
  link.textContent = lang() === 'zh' ? `看 ${PLATFORM_NAME[p.platform]} 平台 →` : `See the ${PLATFORM_NAME[p.platform]} platform →`;
  hidePeek();
  if (modal.open) modal.close();   // reopen as a true modal, never as an inline block
  modal.showModal();
  modal.scrollTop = 0;
  // Web Animations, not GSAP: GSAP measures transforms by briefly detaching the element, and a detached
  // <dialog> drops out of the top layer (still "open", but now an inline box far down the page)
  if (animated()) modal.animate(
    [{ transform: 'translateY(40px)', opacity: 0, clipPath: 'inset(8% 0 0 0)' }, { transform: 'none', opacity: 1, clipPath: 'inset(0% 0 0 0)' }],
    { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
}
document.getElementById('mClose').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

onLangChange(() => { paintAll(); writeCap(Math.max(active, 0)); buildIndex(); });

/* =====================================================================
   5. Render loop (only what is on screen)
   ===================================================================== */
const seen = { hero: true, hall: false };
const io = new IntersectionObserver((es) => es.forEach((en) => { seen[en.target === hall ? 'hall' : 'hero'] = en.isIntersecting; }));
io.observe(document.getElementById('pjHero'));
io.observe(hall);

const clock = new THREE.Clock();
gsap.ticker.add(() => {
  const t = clock.getElapsedTime();
  const calm = !animated();
  if (seen.hero) {
    const k = calm ? 1 : 0.08;
    tilt.x += ((calm ? 0 : tilt.tx) - tilt.x) * k; tilt.y += ((calm ? 0 : tilt.ty) - tilt.y) * k;
    // pointer tilt (max 6°) plus a slow sway
    gsap.set(towerEl, { rotationX: tilt.x * -33, rotationY: tilt.y * 30 + (calm ? 0 : Math.sin(t * 0.35) * 4) });
    // leaving the banner: the ribbons drift apart again, each along its own direction
    const sp = heroScroll.p;
    if (!towerIntro) ribbons.forEach((el) => {
      gsap.set(el, { x: el._dir.x * sp * 120, y: el._dir.y * sp * 90, rotation: el._dir.spin * sp * 50 });
    });
  }
  if (seen.hall && !STATIC) {
    const prev = turn.cur;
    const nowT = performance.now(); const dt = Math.min(0.05, (nowT - (turn.last || nowT)) / 1000); turn.last = nowT;
    if (!calm && hoverI < 0 && !modal.open) turn.auto += AUTO_SPEED * dt;   // pauses under the mouse and while a project is open
    const target = turn.scroll + turn.auto;
    turn.cur += (target - turn.cur) * (calm ? 1 : 0.08);
    const speed = Math.abs(turn.cur - prev);
    turnSpeed = speed;
    turn.bend += ((calm ? 0 : clamp(speed * 9, 0, 0.55)) - turn.bend) * 0.12;
    ring.rotation.y = turn.cur;
    panels.forEach((m) => {
      let d = m.userData.a - turn.cur;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      m.material.uniforms.uBend.value = turn.bend;
      m.material.uniforms.uFade.value = 1 - clamp((Math.abs(d) - 0.7) / 1.4, 0, 1) * 0.85;
      // the screen under the pointer leans out a little
      const lift = m.userData.i === hoverI && !calm ? 0.25 : 0;
      m.userData.lift = (m.userData.lift || 0) + (lift - (m.userData.lift || 0)) * 0.12;
      const rr = R - m.userData.lift;
      m.position.x = Math.sin(m.userData.a) * rr; m.position.z = -Math.cos(m.userData.a) * rr;
    });
    hCam.rotation.y = -tilt.y * 0.3;   // the room answers the pointer, gently
    setActive(((Math.round(turn.cur / STEP) % N) + N) % N);
    hRenderer.render(hScene, hCam);
  }
});

function layoutAll() { hallLayout(); }
addEventListener('resize', () => { layoutAll(); ScrollTrigger.refresh(); });
layoutAll();

onMotionChange((calm) => { if (calm) stopCycle(); else startCycle(); });

/* Index reveal */
if (!STATIC) {
  gsap.from('.index-list li', { opacity: 0, y: 24, duration: 0.9, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.index-list', start: 'top 80%', once: true } });
}
setupReveals();

// Opening reel: starts at once (it does not wait for the web fonts); its last frame is this banner.
// While it plays, the live banner waits underneath in its finished state; when it ends, the banner takes over.
const reel = document.getElementById('pjReel');
const useReel = !!reel && animated() && getComputedStyle(reel).display !== 'none';
let fontsLoaded = false;
if (useReel) {
  reelHold = true;
  gsap.set(letters, { opacity: 1 });
  let handedOver = false;
  const handOver = () => {
    if (handedOver) return; handedOver = true;
    reel.classList.add('is-done');
    setTimeout(() => reel.remove(), 800);
    reelHold = false;
    if (fontsLoaded && heroOn) startCycle();
  };
  reel.addEventListener('ended', handOver);
  reel.addEventListener('error', handOver, true);
  if (reel.ended) handOver();                       // it may have finished before this script arrived
  else {
    setTimeout(handOver, 12000);                    // never hold the page on a stalled video
    if (reel.paused) reel.play().catch(handOver);
  }
} else {
  reel?.remove();
}

// load all three banner faces up front so the first change never shows a fallback font
Promise.all(['900 40px Archivo', '500 40px "Bodoni Moda"', '400 40px "Ms Madi"', '700 40px "Space Mono"', '800 40px Unbounded',
  'italic 400 40px "Instrument Serif"', '800 40px Syne', '400 40px "Major Mono Display"', '400 40px "Bebas Neue"', '400 40px "Rubik Mono One"', '900 40px "Noto Sans TC"']
  .map((f) => document.fonts.load(f).catch(() => null))).then(() => fontsReady).then(() => {
  fontsLoaded = true;
  paintAll();
  if (!useReel) { heroIn(); startCycle(); return; }
  if (!reelHold && heroOn) startCycle();            // the reel already finished before the fonts arrived
});
