#!/usr/bin/env python3
"""Generates the public website pages. Edit content here, then run: python3 build.py"""
import os, urllib.parse
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# ====== BUSINESS DETAILS ======
CALL = "7800604082"          # calling number (10 digits)
WHATSAPP = "7800604082"      # WhatsApp business number
EMAIL = ""                   # e.g. "hello@webworksindia.in" (leave "" to hide)
ADDRESS = ["Verma Complex, 1st Floor", "Near A-Mart Chauraha, Bal Nikunj School", "Sitapur Road, Lucknow 226021"]
MAP_Q = urllib.parse.quote("Verma Complex, Sitapur Road, Lucknow 226021")
SITE = "https://webworksindia.in"
pretty = lambda n: f"+91 {n[:5]} {n[5:]}"
wa = lambda msg: f"https://wa.me/91{WHATSAPP}?text={urllib.parse.quote(msg)}"

S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
I = lambda d, vb="0 0 32 32": f'<svg viewBox="{vb}" {S} aria-hidden="true">{d}</svg>'
IC = {
 "web": I('<rect x="3" y="5" width="26" height="20" rx="2.5"/><path d="M3 10h26M7 7.5h.01M10 7.5h.01M8 15h9M8 19h6M21 14h4v6h-4z"/>'),
 "cart": I('<path d="M3 5h4l3 14h14l3-10H9"/><circle cx="12" cy="25" r="2"/><circle cx="22" cy="25" r="2"/>'),
 "app": I('<rect x="4" y="4" width="10" height="10" rx="2"/><rect x="18" y="4" width="10" height="10" rx="2"/><rect x="4" y="18" width="10" height="10" rx="2"/><path d="M23 18v10M18 23h10"/>'),
 "erp": I('<path d="M4 27h24"/><rect x="6" y="15" width="5" height="12"/><rect x="13.5" y="9" width="5" height="18"/><rect x="21" y="5" width="5" height="22"/>'),
 "seo": I('<circle cx="14" cy="14" r="8"/><path d="m20 20 7 7M10 15l3-3 2 2 4-4"/>'),
 "bot": I('<path d="M6 25.5 7.5 21A10.5 10.5 0 1 1 11 24.5z"/><path d="M12 13h.01M16 13h.01M20 13h.01"/>'),
 "design": I('<path d="M5 27 7 20 21 6l5 5-14 14z"/><path d="M18 9l5 5M7 20l5 5"/>'),
 "shield": I('<path d="M16 3 27 7v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="m11 16 3.5 3.5L21 13"/>'),
 "phone": I('<path d="M7 4h5l2.5 6.5L11 12.5a15 15 0 0 0 8.5 8.5l2-3.5L28 20v5a3 3 0 0 1-3 3C14 28 4 18 4 7a3 3 0 0 1 3-3z"/>'),
 "pin": I('<path d="M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15z"/><circle cx="16" cy="14" r="3.2"/>'),
 "mail": I('<rect x="4" y="7" width="24" height="18" rx="2.5"/><path d="m4 9 12 8 12-8"/>'),
 "arrow": I('<path d="M7 16h18M18 9l7 7-7 7"/>'),
 "local": I('<path d="M16 29s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15z"/><circle cx="16" cy="14" r="3.2"/>'),
 "code": I('<path d="m11 9-7 7 7 7M21 9l7 7-7 7M18 6l-4 20"/>'),
 "handshake": I('<path d="M4 14l6-6 6 3 6-3 6 6-9 9a2 2 0 0 1-3 0L4 14z"/><path d="M13 17l3 3"/>'),
 "clock": I('<circle cx="16" cy="16" r="12"/><path d="M16 9v7l5 3"/>'),
 "pipe": I('<rect x="3" y="6" width="7" height="20" rx="1.5"/><rect x="12.5" y="6" width="7" height="14" rx="1.5"/><rect x="22" y="6" width="7" height="9" rx="1.5"/>'),
 "bell": I('<path d="M8 22V14a8 8 0 0 1 16 0v8l2 3H6z"/><path d="M13 28h6"/>'),
 "rupee": I('<path d="M9 6h14M9 12h14M9 6h4a6 6 0 0 1 0 12H9l11 10"/>'),
 "team": I('<circle cx="11" cy="11" r="4"/><circle cx="23" cy="12" r="3"/><path d="M3 27a8 8 0 0 1 16 0M19 22a6 6 0 0 1 10 5"/>'),
 "wa": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.1 1.3 15.1.1 12 .1 5.5.1.1 5.5.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2z"/></svg>',
}

# ====== SERVICES ======
SERVICES = [
 dict(id="websites", ico="web", name="Business websites", short="Fast, mobile-first sites that bring enquiries",
  who="Clinics, coaching institutes, builders, showrooms, manufacturers and service businesses that need customers to find them and call.",
  intro="A business website has one job: turn a visitor into a phone call, a WhatsApp message or a form enquiry. We plan every page around that. Pages load in under two seconds on a 4G phone, every enquiry lands in your inbox and on WhatsApp, and you can edit the text and photos yourself.",
  includes=["Page planning and copy written around what your customers search for", "Custom design in your brand colours, no templates", "Mobile-first layout tested on real Android phones", "Enquiry forms, click-to-call and WhatsApp chat buttons", "Google Business Profile, Search Console and Analytics setup", "Basic on-page SEO: titles, descriptions, schema and sitemap", "SSL, domain and hosting set up and handed over to you", "Training video so your team can update content"],
  grid=[("Landing pages", "One focused page for an ad campaign or a single product"), ("Company websites", "5 to 25 pages with services, about, gallery and contact"), ("Redesigns", "Old, slow site rebuilt without losing your Google rankings"), ("Multilingual", "Hindi and English versions of the same site")],
  timeline="2 to 4 weeks", engagement="Fixed price", tech=["Next.js", "React", "Laravel", "WordPress (on request)", "Tailwind CSS"]),
 dict(id="ecommerce", ico="cart", name="E-commerce stores", short="Online stores with UPI, COD and shipping built in",
  who="Retailers, D2C brands, wholesalers and restaurants that want to take orders and payments online.",
  intro="We build online stores that work the way Indian customers buy: UPI and cards through Razorpay or Cashfree, cash on delivery with OTP confirmation, GST invoices, and order updates on WhatsApp. Stock, orders and payouts are managed from one admin panel your staff can learn in an afternoon.",
  includes=["Product catalogue with variants, sizes and stock tracking", "Payment gateway integration: UPI, cards, net banking, wallets", "Cash on delivery with OTP verification to cut fake orders", "Shipping integration with Shiprocket or Delhivery", "Automatic GST invoices and order emails", "Order, shipping and delivery updates on WhatsApp", "Coupons, offers and abandoned cart reminders", "Sales reports and stock alerts in the admin panel"],
  grid=[("Single-brand stores", "Your own store instead of only selling on marketplaces"), ("B2B ordering", "Price lists and bulk ordering for dealers and retailers"), ("Food ordering", "Online menu, table QR and delivery orders for restaurants"), ("Shopify builds", "Custom Shopify themes and apps when that suits you better")],
  timeline="4 to 8 weeks", engagement="Fixed price + optional support", tech=["Next.js", "Node.js", "PostgreSQL", "Razorpay", "Shiprocket", "Shopify"]),
 dict(id="web-apps", ico="app", name="Custom web apps and SaaS", short="Portals, dashboards and products built to your process",
  who="Businesses with a process that spreadsheets can't handle anymore, and founders building a software product.",
  intro="When off-the-shelf software forces you to change how you work, we build software that fits instead. Student portals, booking systems, vendor dashboards, multi-tenant SaaS products with subscriptions: designed with you, built in short cycles, and shown to you every week so nothing is a surprise at launch.",
  includes=["Discovery workshop to map users, roles and workflows", "Clickable prototype before development begins", "Role-based logins for admins, staff and customers", "Payments, subscriptions and invoicing", "Integrations with WhatsApp, SMS, email, Tally and Google Sheets", "Automated tests and a staging server for safe updates", "Cloud deployment with backups and monitoring", "Full source code and documentation handed to you"],
  grid=[("Customer portals", "Logins where your customers track orders, bookings or results"), ("Booking systems", "Appointments, slots, reminders and online payment"), ("SaaS products", "Multi-tenant apps with plans, billing and admin"), ("Internal tools", "Dashboards and approval flows for your team")],
  timeline="6 to 16 weeks, released in stages", engagement="Milestone-based", tech=["React", "Next.js", "Node.js", "Laravel", "Python", "PostgreSQL", "Redis", "Docker", "AWS"]),
 dict(id="erp-crm", ico="erp", name="ERP and CRM software", short="Leads, billing, stock and staff in one system",
  who="Growing businesses running sales, inventory, billing or HR on registers, Excel sheets and WhatsApp groups.",
  intro="We build ERP and CRM systems around how your business already works. Leads from your website, Justdial and Instagram land in one pipeline. Billing is GST-ready. Stock updates itself when you sell. Staff see only what they need. We run our own studio on a CRM we built ourselves, so we know what actually gets used every day.",
  includes=["Lead capture from website, Justdial, IndiaMART, Facebook and WhatsApp", "Sales pipeline with follow-up reminders and staff assignment", "GST billing, quotations and payment tracking", "Inventory with multiple godowns, batches and low-stock alerts", "Staff attendance, tasks and role-based access", "Owner dashboard with daily sales, collections and dues", "Data import from Excel and Tally export", "Works on phone and desktop, with daily backups"],
  grid=[("Sales CRM", "Never lose an enquiry or forget a follow-up again"), ("Billing and inventory", "GST invoices, stock and dues in one place"), ("Institute ERP", "Admissions, fees, attendance and parent updates"), ("Field team apps", "Visit logs, orders and locations for sales staff")],
  timeline="6 to 12 weeks", engagement="Milestone-based + annual support", tech=["Laravel", "Node.js", "React", "PostgreSQL", "WhatsApp Cloud API"]),
 dict(id="seo", ico="seo", name="SEO and local search", short="Rank in Google and Maps for searches that sell",
  who="Businesses that want customers searching on Google and Google Maps in Lucknow and nearby cities to find them first.",
  intro="We focus on searches that bring paying customers, like 'dentist in Gomti Nagar' or 'GST billing software Lucknow', not on vanity rankings. Work starts with a technical audit, then fixes, content and local listings. You get a plain-language monthly report showing calls, enquiries and rankings, so you can see what the money is doing.",
  includes=["Technical audit: speed, indexing, broken links, Core Web Vitals", "Keyword research around buyer intent in your city", "On-page optimisation of titles, headings, content and schema", "Google Business Profile optimisation, posts and review strategy", "Local citations and directory listings with consistent details", "Service and area pages written for search", "Backlinks from relevant, real Indian websites", "Monthly report on calls, enquiries, rankings and traffic"],
  grid=[("Local SEO", "Top positions in Google Maps for your area"), ("Website SEO", "Rankings for your main services across the city"), ("E-commerce SEO", "Product and category pages that rank and sell"), ("Audit only", "A detailed report your own team can act on")],
  timeline="First results in 3 to 6 months", engagement="Monthly retainer", tech=["Search Console", "GA4", "Ahrefs", "Screaming Frog", "Schema.org"]),
 dict(id="automation", ico="bot", name="WhatsApp and business automation", short="Bots and workflows that do the repetitive work",
  who="Teams that spend hours copying data, sending the same messages and chasing payments by hand.",
  intro="Using the official WhatsApp Business API, we build chatbots that answer common questions, take bookings, send reminders and collect payments. Behind them, automations connect your website, CRM, sheets and email so data moves on its own. Your staff spend their time on customers instead of copy-paste.",
  includes=["WhatsApp Business API setup and template approval", "Chatbots for FAQs, bookings, lead qualification and support", "Broadcast campaigns to opted-in customers", "Payment reminders and links sent automatically", "Website and ad leads sent to CRM and WhatsApp instantly", "Google Sheets, email and SMS automations", "Hand-off from bot to a human agent when needed", "Reports on messages, replies and conversions"],
  grid=[("Lead bots", "Qualify enquiries 24×7 and pass hot leads to sales"), ("Booking bots", "Slots, confirmations and reminders on WhatsApp"), ("Payment follow-ups", "Automatic dues reminders with payment links"), ("Workflow automation", "Forms → CRM → sheets → email, without manual entry")],
  timeline="1 to 4 weeks", engagement="Setup + monthly plan", tech=["WhatsApp Cloud API", "Node.js", "Webhooks", "Google Sheets API", "n8n"]),
 dict(id="design", ico="design", name="UI/UX design", short="Interfaces people understand on the first try",
  who="Founders and companies building a new product, or fixing one that users find confusing.",
  intro="Good design is the reason people finish a signup, complete a purchase or use a dashboard every day. We research how your users think, map their journeys, and design every screen in Figma with a reusable component system, so development is faster and the product stays consistent as it grows.",
  includes=["User interviews and competitor review", "User journeys and information architecture", "Wireframes for every key flow", "High-fidelity screens for mobile and desktop", "Clickable Figma prototype for testing", "Design system: colours, type, components, states", "Brand-ready icons and illustrations", "Developer handover with specs and assets"],
  grid=[("Product design", "Web and mobile apps from first sketch to final screens"), ("UX audit", "Find and fix where users drop off"), ("Design systems", "One component library for all your products"), ("Dashboards", "Data-heavy screens that stay readable")],
  timeline="2 to 6 weeks", engagement="Fixed price", tech=["Figma", "FigJam", "Design tokens"]),
 dict(id="care", ico="shield", name="Hosting, maintenance and security", short="Your site kept fast, safe and online",
  who="Any business whose website or software needs to stay online, updated and secure without hiring an in-house developer.",
  intro="Launch is the start, not the end. Our care plans cover hosting, daily backups, security updates, uptime monitoring and small changes every month. If something breaks, you message one WhatsApp number and a developer who knows your project picks it up.",
  includes=["Managed cloud hosting with SSL", "Daily backups with tested restores", "Security patches and malware scanning", "Uptime monitoring with instant alerts", "Monthly speed and health check", "Small content and design changes every month", "Domain and email renewals handled on time", "Priority support on WhatsApp"],
  grid=[("Care plans", "Monthly maintenance for websites and stores"), ("Takeovers", "We take over sites built by other agencies"), ("Hacked site recovery", "Clean-up, hardening and restoring from backup"), ("Cloud setup", "AWS and VPS setup, scaling and cost review")],
  timeline="Ongoing", engagement="Monthly or yearly plan", tech=["AWS", "Cloudflare", "Docker", "Linux", "UptimeRobot"]),
]

def head(title, desc, path="/", extra=""):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#10131A">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="{SITE}/img/og.jpg"><meta property="og:url" content="{SITE}{path}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfessionalService","name":"Web Works India","url":"{SITE}","telephone":"+91{CALL}","address":{{"@type":"PostalAddress","streetAddress":"{ADDRESS[0]}, {ADDRESS[1]}, Sitapur Road","addressLocality":"Lucknow","postalCode":"226021","addressRegion":"Uttar Pradesh","addressCountry":"IN"}},"areaServed":"Lucknow","description":"{desc}"}}</script>
{extra}
</head>
<body>
'''

def header(active=""):
    nav = [("/services", "Services", "services"), ("/#work", "How we work", "work"), ("/#crm", "CRM", "crm"), ("/#audit", "Free audit", "audit"), ("/#faq", "FAQ", "faq"), ("/#contact", "Contact", "contact")]
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}>{t}</a>' for h, t, k in nav)
    return f'''<header class="head">
 <div class="wrap">
  <a class="brand" href="/" aria-label="Web Works India home"><span class="brand-mark" aria-hidden="true">W</span><span><b>Web Works India</b><small>Tech studio, Lucknow</small></span></a>
  <nav class="nav" aria-label="Main">{links}</nav>
  <div class="head-cta"><a class="btn btn--line btn--sm" href="tel:+91{CALL}">{IC["phone"]}{pretty(CALL)}</a><a class="btn btn--sm" href="/#start">Start a project</a>
  <button class="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button></div>
 </div>
</header>
'''

def footer(js=""):
    sv = "".join(f'<li><a href="/services#{s["id"]}">{s["name"]}</a></li>' for s in SERVICES[:6])
    mail = f'<li><a href="mailto:{EMAIL}">{EMAIL}</a></li>' if EMAIL else ""
    return f'''<footer class="foot">
 <div class="wrap">
  <div class="foot-grid">
   <div><a class="brand" href="/" style="margin-bottom:18px"><span class="brand-mark" aria-hidden="true">W</span><span><b>Web Works India</b><small>Tech studio, Lucknow</small></span></a>
    <p style="max-width:36ch">Websites, software, SEO and automation for businesses in Lucknow and across India.</p></div>
   <div><h4>Services</h4><ul>{sv}</ul></div>
   <div><h4>Studio</h4><ul><li><a href="/#work">How we work</a></li><li><a href="/#crm">Our CRM</a></li><li><a href="/#audit">Free website audit</a></li><li><a href="/#faq">FAQ</a></li><li><a href="/crm/">Team login</a></li></ul></div>
   <div><h4>Visit or call</h4><ul><li>{"<br>".join(ADDRESS)}</li><li><a href="tel:+91{CALL}">{pretty(CALL)}</a></li><li><a href="{wa("Hello Web Works India")}" target="_blank" rel="noopener">WhatsApp {pretty(WHATSAPP)}</a></li>{mail}</ul></div>
  </div>
  <div class="foot-base"><span>© <span data-year>2026</span> Web Works India, Lucknow</span><span>Designed and built in-house</span></div>
 </div>
</footer>
<a class="wa-float" href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{IC["wa"]}</a>
<script src="/js/site.js"></script>
{js}
</body>
</html>
'''

def enquiry_form(kind="project", paper=False):
    opts = "".join(f"<option>{s['name']}</option>" for s in SERVICES) + "<option>Not sure yet</option>"
    if kind == "audit":
        fields = '''
   <div class="field"><label for="a-name">Your name</label><input id="a-name" name="name" required autocomplete="name"></div>
   <div class="field"><label for="a-phone">WhatsApp number</label><input id="a-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="10-digit mobile"></div>
   <div class="field full"><label for="a-site">Website address</label><input id="a-site" name="website" required placeholder="e.g. www.yourbusiness.in" inputmode="url"></div>
   <div class="field full"><label for="a-msg">What worries you about the site? <small>(optional)</small></label><textarea id="a-msg" name="message" placeholder="e.g. Not getting enquiries, slow on mobile, not on Google"></textarea></div>'''
        btn, note = "Request my free audit", "A developer reviews your site by hand. You'll get the report on WhatsApp within 2 working days."
    else:
        fields = f'''
   <div class="field"><label for="p-name">Your name</label><input id="p-name" name="name" required autocomplete="name"></div>
   <div class="field"><label for="p-phone">Mobile number</label><input id="p-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="10-digit mobile"></div>
   <div class="field"><label for="p-co">Business name <small>(optional)</small></label><input id="p-co" name="company" autocomplete="organization"></div>
   <div class="field"><label for="p-email">Email <small>(optional)</small></label><input id="p-email" name="email" type="email" autocomplete="email"></div>
   <div class="field"><label for="p-svc">What do you need?</label><select id="p-svc" name="service">{opts}</select></div>
   <div class="field"><label for="p-bud">Budget</label><select id="p-bud" name="budget"><option>Not decided</option><option>Under ₹50,000</option><option>₹50,000 to ₹1.5 lakh</option><option>₹1.5 to ₹5 lakh</option><option>Above ₹5 lakh</option></select></div>
   <div class="field full"><label for="p-msg">Tell us about the project</label><textarea id="p-msg" name="message" placeholder="What you do, what you want to build, and when you'd like to launch"></textarea></div>'''
        btn, note = "Send enquiry", "We reply within one working day, usually much sooner."
    return f'''<form class="form" data-enquiry="{kind}" novalidate>
   <div class="hp" aria-hidden="true"><label>Company site <input name="company_site" tabindex="-1" autocomplete="off"></label></div>{fields}
   <div class="full" style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between"><p class="fine">{note}</p><button class="btn" type="submit">{btn}</button></div>
  </form>
  <div class="done" hidden><div class="tick">{I('<path d="m7 16 6 6 12-13"/>')}</div><h3>Thanks, it's with our team.</h3><p class="{'fine' if paper else 'lede'}" style="margin:0 auto 18px">We'll call or WhatsApp you on the number you shared. Need us sooner? Call {pretty(CALL)}.</p><button class="btn btn--line" type="button" data-again>Send another</button></div>'''

def index():
    svc_items = "".join(f'''<li data-id="{s["id"]}" data-who="{s["who"]}" data-time="{s["timeline"]}" data-eng="{s["engagement"]}">
   <button aria-expanded="false"><span>{IC[s["ico"]]}</span><span><b>{s["name"]}</b><small>{s["short"]}</small></span><span class="arrow">{IC["arrow"]}</span></button>
   <div class="svc-detail"><p>{s["intro"]}</p><ul>{"".join(f"<li>{x}</li>" for x in s["includes"][:5])}</ul><a class="link" href="/services#{s["id"]}">Read the full details</a></div>
  </li>''' for s in SERVICES)
    first = SERVICES[0]
    steps = [("Discovery call", "We learn your business, customers and goals, and tell you honestly what will and won't help.", "Day 1"),
             ("Proposal and plan", "A written scope, fixed price or milestones, timeline and the exact list of what you'll receive.", "2–3 days"),
             ("Design", "You see real screens of your project before a line of code is written, and approve them.", "1–2 weeks"),
             ("Build and review", "We build in short cycles and share a working preview link every week for your feedback.", "2–10 weeks"),
             ("Launch and care", "Go-live, training for your team, and support afterwards so nothing is left half-done.", "Ongoing")]
    stp = "".join(f'<li data-rv><h3>{a}</h3><p>{b}</p><span class="time">{c}</span></li>' for a, b, c in steps)
    inds = [("Clinics and hospitals", "Appointment booking, doctor profiles, WhatsApp reminders and local SEO."), ("Coaching and schools", "Admissions, fee collection, student portals and parent updates."),
            ("Real estate and builders", "Project sites, lead capture from portals and a sales CRM for site visits."), ("Retail and showrooms", "Online catalogues, stores, billing and stock in one system."),
            ("Restaurants and cafés", "Online ordering, table QR menus and Google Maps visibility."), ("Manufacturers and traders", "Dealer ordering portals, GST billing, inventory and ERP."),
            ("Professionals", "Websites for CAs, lawyers and consultants that bring the right clients."), ("Startups", "MVPs and SaaS products designed and built to launch fast.")]
    ind = "".join(f'<div data-rv><h3>{a}</h3><p>{b}</p></div>' for a, b in inds)
    stack = [("Frontend", [("React", ""), ("Next.js", ""), ("Tailwind CSS", ""), ("Three.js", "for 3D")]),
             ("Backend", [("Node.js", ""), ("Laravel", "PHP"), ("Python", ""), ("REST and webhooks", "")]),
             ("Data", [("PostgreSQL", ""), ("MySQL", ""), ("MongoDB", ""), ("Redis", "for speed")]),
             ("Cloud and tools", [("AWS", ""), ("Docker", ""), ("Cloudflare", ""), ("WhatsApp Cloud API", "")])]
    stk = "".join(f'<div><h3>{h}</h3><ul>{"".join(f"<li>{a} <span>{b}</span></li>" for a, b in items)}</ul></div>' for h, items in stack)
    faqs = [("How much does a website cost?", "It depends on the number of pages, features and content. A business website is usually a fixed price agreed before we start, and a larger project is split into milestones. After a short call we send a written quote with the exact scope, so you know the full cost upfront."),
            ("How long will my project take?", "A business website takes about 2 to 4 weeks, an online store 4 to 8 weeks, and custom software 6 to 16 weeks depending on scope. The timeline is written into the proposal, and you'll see progress every week."),
            ("Will I own the website and the code?", "Yes. Once the project is paid for, the domain, hosting accounts, source code and content are yours. We hand over all logins and documentation."),
            ("Can you redesign my existing website without losing Google rankings?", "Yes. We map your old URLs to the new ones, keep the content that ranks, and set up redirects so your search traffic carries over."),
            ("Do you work with businesses outside Lucknow?", "Yes. Our office is on Sitapur Road in Lucknow, and we work with clients across India over calls, WhatsApp and shared preview links."),
            ("What happens after the website goes live?", "Every project includes a support period after launch. After that you can choose a care plan for hosting, backups, security updates and monthly changes, or manage it yourself."),
            ("How long does SEO take to show results?", "Technical fixes help right away, but stable rankings usually take 3 to 6 months depending on competition. We report calls, enquiries and rankings every month so you can track progress.")]
    faq = "".join(f"<details><summary>{a}</summary><p>{b}</p></details>" for a, b in faqs)
    body = f'''
<section class="hero" id="top">
 <canvas id="hero3d" aria-hidden="true"></canvas>
 <div class="wrap"><div class="hero-copy">
  <span class="hero-kicker reveal-1"><i></i>Taking new projects for this month</span>
  <h1 class="h-xl reveal-1">Websites and software for businesses that want to grow.</h1>
  <p class="lede reveal-2">Web Works India is a Lucknow tech studio. We design and build websites, online stores, custom software and CRMs, and help you get found on Google. One team, from the first idea to the day it goes live, and after.</p>
  <div class="actions reveal-3"><a class="btn" href="#start">Start a project</a><a class="btn btn--line" href="#audit">Get a free website audit</a></div>
 </div></div>
 <div class="hero-foot reveal-3"><span>Every website has five layers. We build all of them.</span><span>Sitapur Road, Lucknow</span></div>
</section>

<div class="strip"><ul>
 <li>{IC["handshake"]}<div><b>One team, end to end</b><span>Design, code, hosting and SEO under one roof</span></div></li>
 <li>{IC["rupee"]}<div><b>Written scope and price</b><span>You know the full cost before work starts</span></div></li>
 <li>{IC["clock"]}<div><b>A preview every week</b><span>Watch your project take shape as it's built</span></div></li>
 <li>{IC["shield"]}<div><b>You own everything</b><span>Code, domain and accounts handed to you</span></div></li>
</ul></div>

<section class="sec paper" id="services"><div class="wrap">
 <div class="sec-head"><div><span class="tag">What we build</span><h2 class="h-l">Eight services, built to work together.</h2></div>
  <p class="lede">Most clients start with one, a website or a CRM, and add the rest as they grow. Because one team builds all of it, your website, software and WhatsApp talk to each other from day one.</p></div>
 <div class="svc-wrap">
  <ul class="svc-list">{svc_items}</ul>
  <aside class="svc-panel" aria-live="polite">
   <span class="tag" data-p="time">{first["timeline"]}</span>
   <h3 data-p="name">{first["name"]}</h3><p data-p="intro">{first["intro"]}</p>
   <ul data-p="list">{"".join(f"<li>{x}</li>" for x in first["includes"][:5])}</ul>
   <div class="meta"><div><span>Best for</span><b data-p="who" style="max-width:46ch">{first["who"]}</b></div></div>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" data-p="link" href="/services#{first["id"]}">Full details</a><a class="btn btn--line" href="#start">Discuss this</a></div>
  </aside>
 </div>
</div></section>

<section class="sec" id="work"><div class="wrap">
 <div class="sec-head"><div><span class="tag">How we work</span><h2 class="h-l">No guesswork. You see progress every week.</h2></div>
  <p class="lede">The most common complaint about agencies is silence: a deposit is paid, then nothing for weeks. Our process is built so that never happens.</p></div>
 <ol class="steps">{stp}</ol>
</div></section>

<section class="sec alt" id="crm"><div class="wrap crm-show">
 <div>
  <span class="tag">Our own software</span>
  <h2 class="h-l">We run our studio on a CRM we built. We can build yours too.</h2>
  <p class="lede" style="margin-top:20px">Every enquiry from this website lands in our CRM within seconds, gets assigned to a person, and comes with a follow-up date. It's the same kind of system we build for clinics, builders, institutes and traders.</p>
  <ul class="feat">
   <li>{IC["pipe"]}<div><b>Sales pipeline</b><span>Drag leads from new to won, with value and owner on every card.</span></div></li>
   <li>{IC["bell"]}<div><b>Follow-up reminders</b><span>Today's calls on top, so no enquiry goes cold.</span></div></li>
   <li>{IC["rupee"]}<div><b>Projects and payments</b><span>Advances, dues and renewals for every client in one place.</span></div></li>
   <li>{IC["team"]}<div><b>Team logins</b><span>Each person sees their leads, and the owner sees everything.</span></div></li>
  </ul>
  <a class="btn" href="/services#erp-crm">See CRM and ERP development</a>
 </div>
 <div class="mock-stage" aria-hidden="true"><div class="mock">
  <div class="mock-top"><i></i><i></i><i></i></div>
  <div class="mock-body">
   <div class="mock-side"><span>Dashboard</span><span class="on">Leads</span><span>Follow-ups</span><span>Clients</span><span>Projects</span><span>Payments</span></div>
   <div class="mock-main">
    <div class="mock-kpis"><div><b>38</b><span>Leads this month</span></div><div><b>₹6.4L</b><span>Open pipeline</span></div><div><b>7</b><span>Follow-ups today</span></div></div>
    <div class="mock-board">
     <div class="mock-col"><span>New · 9</span><div class="mock-card hot"><b>Sana Dental</b><small>Clinic website</small></div><div class="mock-card"><b>Mehra Classes</b><small>Student portal</small></div><div class="mock-card"><b>Aarav Foods</b><small>Online ordering</small></div></div>
     <div class="mock-col"><span>Contacted · 6</span><div class="mock-card"><b>Gupta Steels</b><small>Dealer ERP · ₹3.5L</small></div><div class="mock-card"><b>Nidhi Jain</b><small>WhatsApp bot</small></div></div>
     <div class="mock-col"><span>Proposal · 4</span><div class="mock-card hot"><b>Rohit Agarwal</b><small>E-commerce · ₹1.2L</small></div><div class="mock-card"><b>Shree Realty</b><small>Sales CRM</small></div></div>
     <div class="mock-col"><span>Won · 3</span><div class="mock-card"><b>Lumina Clinic</b><small>Website + SEO</small></div></div>
    </div>
   </div>
  </div>
 </div></div>
</div></section>

<section class="sec paper" id="industries"><div class="wrap">
 <div class="sec-head"><div><span class="tag">Who we work with</span><h2 class="h-l">Built for the businesses of Lucknow.</h2></div><p class="lede">Different businesses need different things from technology. These are the problems we solve most often.</p></div>
 <div class="ind">{ind}</div>
</div></section>

<section class="sec" id="stack"><div class="wrap">
 <div class="sec-head"><div><span class="tag">Technology</span><h2 class="h-l">Modern, proven tools. No lock-in.</h2></div><p class="lede">We choose technology for speed, security and how easy it will be to maintain in five years. Everything we use is widely known, so you're never stuck with one developer.</p></div>
 <div class="stack">{stk}</div>
</div></section>

<section class="sec paper" id="audit"><div class="wrap audit">
 <div>
  <span class="tag">Free website audit</span>
  <h2 class="h-l">Find out why your website isn't bringing enquiries.</h2>
  <p class="lede" style="margin-top:20px">Send us your website address. A developer from our team reviews it by hand and sends you a clear report with what to fix first. No automated score, no obligation.</p>
  <ul class="check"><li>Speed on mobile and Core Web Vitals</li><li>Google indexing and SEO basics</li><li>Security: SSL, outdated plugins, exposed files</li><li>Contact flow: how easily a visitor can reach you</li><li>How you compare with two local competitors</li></ul>
 </div>
 <div class="card">{enquiry_form("audit", paper=True)}</div>
</div></section>

<section class="sec" id="faq"><div class="wrap">
 <div class="sec-head"><div><span class="tag">Questions</span><h2 class="h-l">Before you ask.</h2></div></div>
 <div class="faq">{faq}</div>
</div></section>

<section class="sec alt" id="start"><div class="wrap contact">
 <div>
  <span class="tag">Start a project</span>
  <h2 class="h-l">Tell us what you want to build.</h2>
  <p class="lede" style="margin:20px 0 30px">Fill in the form, call us, or walk into our office on Sitapur Road. The first conversation is free and there's no pressure to sign anything.</p>
  <div class="c-list" id="contact">
   <a href="tel:+91{CALL}">{IC["phone"]}<span><small>Call</small><b>{pretty(CALL)}</b></span></a>
   <a href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener">{IC["wa"]}<span><small>WhatsApp</small><b>{pretty(WHATSAPP)}</b></span></a>
   <a href="https://www.google.com/maps/search/?api=1&query={MAP_Q}" target="_blank" rel="noopener">{IC["pin"]}<span><small>Office</small><b>{ADDRESS[0]}, {ADDRESS[2]}</b></span></a>
  </div>
 </div>
 <div class="card">{enquiry_form("project")}</div>
</div></section>

<section class="sec" style="padding-top:0;background:var(--bg-2)"><div class="wrap"><div class="map"><iframe title="Web Works India office on Google Maps" src="https://www.google.com/maps?q={MAP_Q}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></section>
'''
    js = '<script type="module" src="/js/hero3d.js"></script>'
    open("public/index.html", "w", encoding="utf-8").write(head("Web Works India — Website development, software and SEO in Lucknow", "Lucknow tech studio building business websites, e-commerce stores, custom software, CRM and ERP, SEO and WhatsApp automation. Free website audit.") + header() + f'<main id="main">{body}</main>' + footer(js))

def services():
    jump = "".join(f'<a href="#{s["id"]}">{s["name"]}</a>' for s in SERVICES)
    blocks = ""
    for s in SERVICES:
        grid = "".join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in s["grid"])
        inc = "".join(f"<li>{x}</li>" for x in s["includes"])
        chips = "".join(f"<span>{t}</span>" for t in s["tech"])
        blocks += f'''<article class="s-block" id="{s["id"]}">
  <div class="s-side">{IC[s["ico"]]}<h2>{s["name"]}</h2><p class="who">{s["who"]}</p>
   <div class="facts"><div><span>Typical timeline</span><b>{s["timeline"]}</b></div><div><span>How we charge</span><b>{s["engagement"]}</b></div></div>
   <div style="display:flex;flex-wrap:wrap;gap:10px"><a class="btn" href="{wa(f"Hello Web Works India, I'm interested in {s['name']}.")}" target="_blank" rel="noopener">{IC["wa"]}Discuss on WhatsApp</a><a class="btn btn--line" href="/#start">Send enquiry</a></div></div>
  <div class="s-body">
   <p class="lede" style="color:#C5CAD5;margin-bottom:34px">{s["intro"]}</p>
   <h3>What we build</h3><div class="s-grid">{grid}</div>
   <h3>What's included</h3><ul class="s-list">{inc}</ul>
   <h3>Tools we use</h3><div class="chips">{chips}</div>
  </div>
 </article>'''
    body = f'''
<section class="p-head"><div class="wrap">
 <div class="crumbs"><a href="/">Home</a> / Services</div>
 <h1 class="h-xl" style="max-width:16ch">Everything your business needs online.</h1>
 <p class="lede" style="margin-top:22px">Eight services, each explained in detail: who it's for, what you get, how long it takes and how we charge. Not sure which one you need? <a class="link" href="/#start">Ask us</a> and we'll tell you honestly.</p>
 <nav class="jump" aria-label="Jump to a service">{jump}</nav>
</div></section>
<section><div class="wrap">{blocks}</div></section>
<section class="cta"><div class="wrap"><h2>Not sure where to start? Start with a free audit.</h2><div style="display:flex;flex-wrap:wrap;gap:12px"><a class="btn" href="/#audit">Get a free audit</a><a class="btn btn--line" href="tel:+91{CALL}">Call {pretty(CALL)}</a></div></div></section>
'''
    open("public/services.html", "w", encoding="utf-8").write(head("Services — Web Works India, Lucknow", "Business websites, e-commerce, custom web apps, CRM and ERP, SEO, WhatsApp automation, UI/UX design and website maintenance in Lucknow.", "/services") + header("services") + f'<main id="main">{body}</main>' + footer())

def notfound():
    body = '<section class="p-head" style="min-height:80vh;display:flex;align-items:center"><div class="wrap"><h1 class="h-xl">This page doesn\'t exist.</h1><p class="lede" style="margin:20px 0 28px">The link may be old or mistyped.</p><a class="btn" href="/">Back to home</a></div></section>'
    open("public/404.html", "w", encoding="utf-8").write(head("Page not found — Web Works India", "Page not found.", "/404") + header() + f'<main id="main">{body}</main>' + footer())

index(); services(); notfound(); print("built")
