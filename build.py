#!/usr/bin/env python3
"""Generates the public website pages. Edit content here, then run: python3 build.py"""
import os, glob, html, urllib.parse
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# ====== BUSINESS DETAILS ======
WHATSAPP = "7800604082"      # WhatsApp business number (10 digits) — the only contact number shown for now
EMAIL = ""                   # e.g. "hello@webworksindia.in" (leave "" to hide)
ADDRESS = ["Verma Complex, 1st Floor", "Near A-Mart Chauraha, Bal Nikunj School", "Sitapur Road, Lucknow 226021"]
MAP_Q = urllib.parse.quote("Verma Complex, Sitapur Road, Lucknow 226021")
SITE = "https://webworksindia.in"
pretty = lambda n: f"+91 {n[:5]} {n[5:]}"
wa = lambda msg: f"https://wa.me/91{WHATSAPP}?text={urllib.parse.quote(msg)}"
esc = lambda s: html.escape(s, quote=True)

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

# hologram key for each service (see public/js/holo.js)
HOLO = {"websites": "websites", "ecommerce": "ecommerce", "web-apps": "web-apps", "erp-crm": "erp-crm", "seo": "seo", "automation": "automation", "design": "design", "care": "care"}

SERVICE_FAQ = {
 "websites": [("Can I update the website myself?", "Yes. Text, photos and blog posts can be edited from a simple admin panel, and you get a short training video. Bigger changes we can do for you."),
              ("Will the website work well on phones?", "We design for phones first, because most of your visitors arrive on one. Every page is tested on real Android phones before launch.")],
 "ecommerce": [("Which payment methods can my store accept?", "UPI, cards, net banking and wallets through Razorpay or Cashfree, plus cash on delivery with OTP confirmation if you want it."),
               ("Can I manage orders from my phone?", "Yes. The admin panel works on mobile, and new orders can also be sent to you on WhatsApp.")],
 "web-apps": [("Do I need a full specification before we start?", "No. We start with a discovery workshop and a clickable prototype, so the scope becomes clear before any code is written."),
              ("Who owns the code?", "You do. Full source code, documentation and all accounts are handed over once the project is paid for.")],
 "erp-crm": [("Can you move our data from Excel or Tally?", "Yes. We import your existing customers, products and balances from Excel, and can export to Tally for your accountant."),
             ("Will my staff be able to use it?", "We design around how your team already works and train them on site or on a call. Each person sees only what they need.")],
 "seo": [("Do you guarantee a #1 ranking?", "No honest agency can guarantee a position on Google. We commit to the work, show it to you every month, and report calls, enquiries and rankings so you can judge the results."),
         ("How long until I see results?", "Technical fixes help right away. Stable rankings usually take 3 to 6 months, depending on how competitive your searches are.")],
 "automation": [("Is this the official WhatsApp API?", "Yes. We use the official WhatsApp Business API, so your number stays safe and messages use approved templates."),
                ("Can a real person take over from the bot?", "Yes. Any conversation can be handed to a staff member when the bot can't help or the customer asks for a person.")],
 "design": [("Can you design without building?", "Yes. We can deliver Figma designs and a design system for your own developers, with a clean handover."),
            ("How many revisions are included?", "Each stage has review rounds built in, and you approve the designs before development starts.")],
 "care": [("Can you take over a site built by someone else?", "Yes. We review the site first, fix what's urgent, and then look after it on a monthly plan."),
          ("What happens if my site goes down?", "Uptime monitoring alerts us right away. You also have one WhatsApp number where a developer who knows your project picks it up.")],
}

STEPS = [("Discovery call", "We learn your business, customers and goals, and tell you honestly what will and won't help.", "Day 1"),
         ("Proposal and plan", "A written scope, fixed price or milestones, timeline and the exact list of what you'll receive.", "2–3 days"),
         ("Design", "You see real screens of your project before a line of code is written, and approve them.", "1–2 weeks"),
         ("Build and review", "We build in short cycles and share a working preview link every week for your feedback.", "2–10 weeks"),
         ("Launch and care", "Go-live, training for your team, and support afterwards so nothing is left half-done.", "Ongoing")]

FAQS = [("How much does a website cost?", "It depends on the number of pages, features and content. A business website is usually a fixed price agreed before we start, and a larger project is split into milestones. After a short call we send a written quote with the exact scope, so you know the full cost upfront."),
        ("How long will my project take?", "A business website takes about 2 to 4 weeks, an online store 4 to 8 weeks, and custom software 6 to 16 weeks depending on scope. The timeline is written into the proposal, and you'll see progress every week."),
        ("Will I own the website and the code?", "Yes. Once the project is paid for, the domain, hosting accounts, source code and content are yours. We hand over all logins and documentation."),
        ("Can you redesign my existing website without losing Google rankings?", "Yes. We map your old URLs to the new ones, keep the content that ranks, and set up redirects so your search traffic carries over."),
        ("Do you work with businesses outside Lucknow?", "Yes. Our office is on Sitapur Road in Lucknow, and we work with clients across India over calls, WhatsApp and shared preview links."),
        ("What happens after the website goes live?", "Every project includes a support period after launch. After that you can choose a care plan for hosting, backups, security updates and monthly changes, or manage it yourself."),
        ("How long does SEO take to show results?", "Technical fixes help right away, but stable rankings usually take 3 to 6 months depending on competition. We report calls, enquiries and rankings every month so you can track progress.")]

INDUSTRIES = [("Clinics and hospitals", "Appointment booking, doctor profiles, WhatsApp reminders and local SEO."), ("Coaching and schools", "Admissions, fee collection, student portals and parent updates."),
              ("Real estate and builders", "Project sites, lead capture from portals and a sales CRM for site visits."), ("Retail and showrooms", "Online catalogues, stores, billing and stock in one system."),
              ("Restaurants and cafés", "Online ordering, table QR menus and Google Maps visibility."), ("Manufacturers and traders", "Dealer ordering portals, GST billing, inventory and ERP."),
              ("Professionals", "Websites for CAs, lawyers and consultants that bring the right clients."), ("Startups", "MVPs and SaaS products designed and built to launch fast.")]

PROMISES = [("handshake", "One team, end to end", "Design, code, hosting and SEO under one roof. One WhatsApp number for everything."),
            ("rupee", "Written scope and price", "You know the full cost and the exact deliverables before work starts."),
            ("clock", "A preview every week", "A working link every week, so you watch your project take shape."),
            ("shield", "You own everything", "Code, domain, hosting and accounts are handed over to you.")]

ARROW = '<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
WA_ICO = IC["wa"].replace('<svg ', '<svg class="wa-ico" ', 1)
N = len(SERVICES)
num = lambda i: f"{i + 1:02d}"

# ====== LAYOUT ======
MARK_DEFS = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
 <defs>
  <linearGradient id="g-bronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A3E1C"/><stop offset=".55" stop-color="#3A1E10"/><stop offset="1" stop-color="#22120A"/></linearGradient>
  <linearGradient id="g-orange" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#C9601A"/><stop offset=".5" stop-color="#F38028"/><stop offset="1" stop-color="#FFC27A"/></linearGradient>
  <linearGradient id="g-ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C77A45"/><stop offset="1" stop-color="#6E3A1C"/></linearGradient>
  <symbol id="mark" viewBox="0 0 120 110">
   <g class="m-globe" fill="none" stroke="url(#g-ring)" stroke-width="3.2" stroke-linecap="round">
    <circle cx="60" cy="58" r="46" pathLength="1"/>
    <ellipse cx="60" cy="58" rx="20" ry="46" pathLength="1"/>
    <ellipse cx="60" cy="58" rx="36" ry="46" pathLength="1"/>
    <path d="M60 12v92M14 58h92M21 35h78M21 81h78" pathLength="1"/>
   </g>
   <g class="m-w" stroke-linejoin="round" stroke-linecap="round" fill="none">
    <path class="m-w-out" d="M15 33 37 90 58 53" stroke="#F38028" stroke-width="20" pathLength="1"/>
    <path class="m-w-out" d="M58 53 77 89 101 30" stroke="#F38028" stroke-width="20" pathLength="1"/>
    <path class="m-w-in" d="M15 33 37 90 58 53" stroke="url(#g-bronze)" stroke-width="13" pathLength="1"/>
    <path class="m-w-in" d="M58 53 77 89 101 30" stroke="url(#g-orange)" stroke-width="13" pathLength="1"/>
   </g>
   <path class="m-arrow" d="M110 6 113.5 35.5 88 24Z" fill="url(#g-orange)" stroke="#FFB061" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
 </defs>
</svg>'''

NAV = [("/services/", "Services", "services"), ("/work", "Work", "work"), ("/about", "About", "about"), ("/audit", "Free audit", "audit"), ("/contact", "Contact", "contact")]

def head(title, desc, path, intro=False):
    pre = ("try{if(sessionStorage.getItem('wwi-pt')){c.add('pt-enter','no-intro');sessionStorage.removeItem('wwi-pt')}"
           "else if(sessionStorage.getItem('wwi-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('no-intro')}catch(e){}") if intro else \
          "c.add('no-intro');try{if(sessionStorage.getItem('wwi-pt')){c.add('pt-enter');sessionStorage.removeItem('wwi-pt')}}catch(e){}"
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#0B0D12">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:image" content="{SITE}/img/og.jpg"><meta property="og:url" content="{SITE}{path}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css">
<script>(function(){{var c=document.documentElement.classList;c.add('js');{pre}}})();</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfessionalService","name":"Web Works India","url":"{SITE}","telephone":"+91{WHATSAPP}","image":"{SITE}/img/og.jpg","address":{{"@type":"PostalAddress","streetAddress":"{ADDRESS[0]}, {ADDRESS[1]}, Sitapur Road","addressLocality":"Lucknow","postalCode":"226021","addressRegion":"Uttar Pradesh","addressCountry":"IN"}},"areaServed":"Lucknow","description":"{esc(desc)}"}}</script>
</head>
<body>
{MARK_DEFS}
<div id="progress" aria-hidden="true"></div>
'''

def brand(id_=""):
    i = f' id="{id_}"' if id_ else ""
    return f'<a class="brand"{i} href="/" aria-label="Web Works India, home"><svg class="brand-mark"><use href="#mark"/></svg><span class="brand-word"><b>Web Works</b><small>India</small></span></a>'

def header(active=""):
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}>{t}</a>' for h, t, k in NAV)
    mlinks = "".join(f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}><span>{i + 1:02d}</span>{t}</a>' for i, (h, t, k) in enumerate(NAV))
    return f'''<header class="head" id="head">
 <div class="wrap head-in">
  {brand("brand")}
  <nav class="nav" aria-label="Main">{links}</nav>
  <div class="head-cta">
   <a class="btn btn--ghost btn--sm hide-sm" href="{wa("Hello Web Works India")}" target="_blank" rel="noopener">{WA_ICO}WhatsApp</a>
   <a class="btn btn--sm" href="/contact" data-magnetic>Start a project</a>
   <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
 </div>
</header>
<div class="menu" id="menu" hidden>
 <nav class="menu-links" aria-label="Mobile">{mlinks}</nav>
 <div class="menu-foot">
  <a class="btn btn--wa" href="{wa("Hello Web Works India")}" target="_blank" rel="noopener">{WA_ICO}WhatsApp {pretty(WHATSAPP)}</a>
  <p>{ADDRESS[0]}, {ADDRESS[2]}</p>
 </div>
</div>
'''

def footer(scripts=""):
    sv = "".join(f'<li><a href="/services/{s["id"]}">{s["name"]}</a></li>' for s in SERVICES)
    mail = f'<li><a href="mailto:{EMAIL}">{EMAIL}</a></li>' if EMAIL else ""
    return f'''<footer class="foot">
 <div class="wrap">
  <div class="foot-grid">
   <div>{brand()}<p>Websites, software, SEO and automation for businesses in Lucknow and across India. Designed and built in-house.</p>
    <a class="btn btn--wa btn--sm" style="margin-top:22px" href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener">{WA_ICO}Chat on WhatsApp</a></div>
   <div><h4>Services</h4><ul>{sv}</ul></div>
   <div><h4>Studio</h4><ul><li><a href="/work">Work</a></li><li><a href="/about">About</a></li><li><a href="/about#process">How we work</a></li><li><a href="/audit">Free website audit</a></li><li><a href="/contact">Contact</a></li><li><a href="/crm/">Team login</a></li></ul></div>
   <div><h4>Visit</h4><ul><li class="muted">{"<br>".join(ADDRESS)}</li><li><a href="https://www.google.com/maps/search/?api=1&query={MAP_Q}" target="_blank" rel="noopener">Open in Google Maps</a></li><li><a href="{wa("Hello Web Works India")}" target="_blank" rel="noopener">WhatsApp {pretty(WHATSAPP)}</a></li>{mail}</ul></div>
  </div>
  <div class="foot-word" aria-hidden="true">Web Works</div>
  <div class="foot-base"><span>© <span data-year>2026</span> Web Works India, Lucknow</span><span>26.85°N 80.95°E · Built in-house</span></div>
 </div>
</footer>
<a class="wa-float" href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">{IC["wa"]}</a>
<div class="cursor" id="cursor" aria-hidden="true"><i></i><span></span></div>
<div class="pt" id="pt" aria-hidden="true"><div class="pt-in"><svg><use href="#mark"/></svg><span class="pt-label"></span></div></div>
<script src="/vendor/lenis.min.js"></script>
<script src="/js/main.js"></script>
{scripts}
</body>
</html>
'''

HOLO_JS = '<script type="module" src="/js/holo.js"></script>'

def page(path_file, title, desc, url, active, body, scripts="", intro_html=""):
    os.makedirs(os.path.dirname(path_file) or ".", exist_ok=True)
    out = head(title, desc, url, intro=bool(intro_html)) + intro_html + header(active) + f'<main id="main">{body}</main>' + footer(scripts)
    open(path_file, "w", encoding="utf-8").write(out)
    return url

# ====== SHARED BLOCKS ======
def holo(key, cls="holo", host=False):
    s = next((x for x in SERVICES if x["id"] == key), SERVICES[0])
    return f'<div class="{cls}" data-holo="{HOLO.get(key, key)}">{IC[s["ico"]]}</div>'

def sec_head(label, title, lede="", center=False):
    lp = f'<p class="lede" data-rv>{lede}</p>' if lede else ""
    return f'<div class="sec-head{" sec-head--c" if center else ""}"><div><span class="label" data-scramble>{label}</span><h2 class="h2 split">{title}</h2></div>{lp}</div>'

def faq_block(items):
    return '<div class="faq" data-stagger>' + "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in items) + "</div>"

def steps_block():
    return '<ol class="steps">' + "".join(f'<li><span class="dot">{i + 1:02d}</span><div><h3>{a}</h3><p>{b}</p></div><span class="time">{c}</span></li>' for i, (a, b, c) in enumerate(STEPS)) + '</ol>'

def enquiry_form(kind="project", preset=""):
    opts = "".join(f"<option{' selected' if s['name'] == preset else ''}>{s['name']}</option>" for s in SERVICES) + "<option>Not sure yet</option>"
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
   <div class="field"><label for="p-phone">WhatsApp number</label><input id="p-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="10-digit mobile"></div>
   <div class="field"><label for="p-co">Business name <small>(optional)</small></label><input id="p-co" name="company" autocomplete="organization"></div>
   <div class="field"><label for="p-email">Email <small>(optional)</small></label><input id="p-email" name="email" type="email" autocomplete="email"></div>
   <div class="field"><label for="p-svc">What do you need?</label><select id="p-svc" name="service">{opts}</select></div>
   <div class="field"><label for="p-bud">Budget</label><select id="p-bud" name="budget"><option>Not decided</option><option>Under ₹50,000</option><option>₹50,000 to ₹1.5 lakh</option><option>₹1.5 to ₹5 lakh</option><option>Above ₹5 lakh</option></select></div>
   <div class="field full"><label for="p-msg">Tell us about the project</label><textarea id="p-msg" name="message" placeholder="What you do, what you want to build, and when you'd like to launch"></textarea></div>'''
        btn, note = "Send enquiry", "We reply within one working day, usually much sooner."
    return f'''<form class="form" data-enquiry="{kind}" novalidate>
   <div class="hp" aria-hidden="true"><label>Company site <input name="company_site" tabindex="-1" autocomplete="off"></label></div>{fields}
   <div class="full form-foot"><p class="fine">{note}</p><button class="btn" type="submit" data-magnetic>{btn} {ARROW}</button></div>
  </form>
  <div class="done" hidden><div class="tick"><svg viewBox="0 0 32 32"><path d="m7 16 6 6 12-13"/></svg></div><h3>Thanks, it's with our team.</h3><p>We'll WhatsApp you on the number you shared. Need us sooner? Message {pretty(WHATSAPP)}.</p><button class="btn btn--ghost" type="button" data-again>Send another</button></div>'''

def mega(title, lede, primary=("Start a project", "/contact")):
    return f'''<section class="mega"><div class="wrap">
 <span class="label" data-scramble>Let's talk</span>
 <h2 class="split" style="margin-top:24px">{title}</h2>
 <p class="lede" data-rv>{lede}</p>
 <div class="actions" data-rv><a class="btn btn--lg" href="{primary[1]}" data-magnetic>{primary[0]} {ARROW}</a><a class="btn btn--wa btn--lg" href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener" data-magnetic>{WA_ICO}WhatsApp us</a></div>
</div></section>'''

def crm_mock():
    return '''<div class="mock" data-tilt aria-hidden="true">
  <div class="mock-top"><i></i><i></i><i></i><span>crm.webworksindia.in</span></div>
  <div class="mock-body">
   <div class="mock-side"><span>Dashboard</span><span class="on">Leads</span><span>Follow-ups</span><span>Clients</span><span>Projects</span><span>Payments</span></div>
   <div class="mock-main">
    <div class="mock-kpis"><div><b>38</b><span>Leads this month</span></div><div><b>₹6.4L</b><span>Open pipeline</span></div><div><b>7</b><span>Follow-ups today</span></div></div>
    <div class="mock-board">
     <div class="mock-col"><span>New · 9</span><div class="mock-card hot"><b>Sana Dental</b><small>Clinic website</small></div><div class="mock-card"><b>Mehra Classes</b><small>Student portal</small></div><div class="mock-card"><b>Aarav Foods</b><small>Online ordering</small></div></div>
     <div class="mock-col"><span>Contacted · 6</span><div class="mock-card"><b>Gupta Steels</b><small>Dealer ERP</small></div><div class="mock-card"><b>Nidhi Jain</b><small>WhatsApp bot</small></div></div>
     <div class="mock-col"><span>Proposal · 4</span><div class="mock-card hot"><b>Rohit Agarwal</b><small>E-commerce</small></div><div class="mock-card"><b>Shree Realty</b><small>Sales CRM</small></div></div>
     <div class="mock-col"><span>Won · 3</span><div class="mock-card"><b>Lumina Clinic</b><small>Website + SEO</small></div></div>
    </div>
   </div>
  </div>
 </div>
 <p class="mock-note">Our in-house CRM · sample data shown</p>'''

# ====== PAGES ======
def index():
    cards = "".join(f'''<a class="svc-card spot hud" href="/services/{s["id"]}" data-holo-host data-cursor="Explore">
   {holo(s["id"])}
   <div class="body"><div class="top"><span class="idx">{num(i)} / {N:02d}</span><span class="time">{s["timeline"]}</span></div>
    <h3>{s["name"]}</h3><p>{s["short"]}.</p>
    <ul>{"".join(f"<li>{x}</li>" for x in s["includes"][:3])}</ul>
    <span class="link">Explore {ARROW}</span></div>
  </a>''' for i, s in enumerate(SERVICES))
    ind = "".join(f'<div class="tile spot"><span class="idx">{num(i)}</span><h3>{a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(INDUSTRIES))
    stack = [("Frontend", [("React", ""), ("Next.js", ""), ("Tailwind CSS", ""), ("Three.js", "3D")]),
             ("Backend", [("Node.js", ""), ("Laravel", "PHP"), ("Python", ""), ("REST & webhooks", "")]),
             ("Data", [("PostgreSQL", ""), ("MySQL", ""), ("MongoDB", ""), ("Redis", "cache")]),
             ("Cloud & tools", [("AWS", ""), ("Docker", ""), ("Cloudflare", ""), ("WhatsApp Cloud API", "")])]
    stk = "".join(f'<div class="tile spot"><h3>{h}</h3><ul>{"".join(f"<li>{a} <span>{b}</span></li>" for a, b in items)}</ul></div>' for h, items in stack)
    intro = '''<div class="intro" id="intro" aria-hidden="true">
 <div class="intro-grid"></div><div class="intro-glow"></div><div class="intro-scan"></div>
 <div class="intro-corners"><i></i><i></i><i></i><i></i></div>
 <div class="intro-log" id="intro-log"></div>
 <p class="intro-tag"><span>Engineering your digital future</span></p>
 <div class="intro-foot"><span class="intro-loc">Lucknow, IN · 26.85°N 80.95°E</span><span class="intro-count"><b id="intro-num">000</b><i>%</i></span></div>
 <div class="intro-bar"><i id="intro-bar"></i></div>
 <button class="intro-skip" id="intro-skip" type="button">Skip intro</button>
</div>
'''
    body = f'''
<section class="hero" id="top">
 <div class="hero-globe" id="globe-wrap"><canvas id="globe" aria-hidden="true"></canvas><div class="globe-label" id="globe-label"><i></i>Lucknow HQ</div></div>
 <div class="hero-hud" aria-hidden="true"><span class="tl">26.85°N 80.95°E<br>Node · Lucknow-226021<br>Status · <b>Online</b></span></div>
 <div class="wrap hero-in">
  <div class="hero-copy">
   <p class="kicker rise"><i></i>Taking new projects this month</p>
   <h1 class="h-hero">
    <span class="ln"><span>Websites &amp; software</span></span>
    <span class="ln"><span>that bring your</span></span>
    <span class="ln"><span><em class="grad">business</em> real growth.</span></span>
   </h1>
   <p class="lede rise">A Lucknow tech studio that designs and builds websites, online stores, custom software and CRMs, and gets you found on Google. One team, from first idea to launch day and after.</p>
   <div class="actions rise">
    <a class="btn btn--lg" href="/contact" data-magnetic>Start a project {ARROW}</a>
    <a class="btn btn--ghost btn--lg" href="/audit" data-magnetic>Get a free website audit</a>
   </div>
  </div>
  <ul class="hero-facts rise">
   <li><b>Written scope &amp; price</b><span>Full cost before work starts</span></li>
   <li><b>Weekly previews</b><span>See it take shape as it's built</span></li>
   <li><b>You own everything</b><span>Code, domain and accounts</span></li>
  </ul>
 </div>
 <a class="scroll-cue rise" href="#services" aria-label="Scroll to services"><i></i></a>
</section>

<section class="marquee" aria-label="What we build">
 <div class="mq-track">
  <div class="mq-row">{"".join(f"<span>{s['name']}</span>" for s in SERVICES)}</div>
  <div class="mq-row" aria-hidden="true">{"".join(f"<span>{s['name']}</span>" for s in SERVICES)}</div>
 </div>
</section>

<section class="hs sec" id="services" data-hscroll style="padding-bottom:0">
 <div class="hs-sticky">
  <div class="wrap hs-head">
   <div><span class="label" data-scramble>[01] What we build</span><h2 class="h2 split" style="margin-top:22px">Eight services. One team.</h2></div>
   <div class="hs-meta"><span class="hs-count"><b>01</b>/ {N:02d}</span><span class="hs-bar"><i></i></span><span class="mono muted" style="font-size:.78rem">Scroll to explore →</span></div>
  </div>
  <div class="hs-track">{cards}
   <div class="svc-card svc-card--end spot hud"><span class="label">Not sure?</span><h3 style="margin-top:20px">Tell us the problem. We'll suggest the fix.</h3><p class="muted">Most clients start with one service and add the rest as they grow.</p><a class="btn" href="/contact" data-magnetic>Talk to us {ARROW}</a></div>
  </div>
 </div>
</section>

<section class="sec"><div class="wrap">
 <div class="stats" data-stagger>
  <div><b data-count="8">8</b><span>services under one roof</span></div>
  <div><b>2–4<small>wks</small></b><span>for a typical business website</span></div>
  <div><b data-count="1">1</b><span>working day to reply to every enquiry</span></div>
  <div><b data-count="100" data-suffix="%">100%</b><span>of code, domain and accounts handed to you</span></div>
 </div>
</div></section>

<section class="sec sec--alt" id="process"><div class="bg-grid"></div><div class="wrap">
 {sec_head("[02] How we work", "No guesswork. You see progress every week.", "The most common complaint about agencies is silence: a deposit is paid, then nothing for weeks. Our process is built so that never happens.")}
 {steps_block()}
</div></section>

<section class="sec" id="crm"><div class="wrap crm">
 <div>
  <span class="label" data-scramble>[03] Our own software</span>
  <h2 class="h2 split" style="margin-top:22px">We run our studio on a CRM we built. We can build yours too.</h2>
  <p class="lede" data-rv style="margin-top:22px">Every enquiry from this website lands in our CRM within seconds, gets assigned to a person, and comes with a follow-up date. It's the same kind of system we build for clinics, builders, institutes and traders.</p>
  <ul class="feat" data-stagger>
   <li>{IC["pipe"]}<div><b>Sales pipeline</b><span>Move leads from new to won, with value and owner on every card.</span></div></li>
   <li>{IC["bell"]}<div><b>Follow-up reminders</b><span>Today's calls on top, so no enquiry goes cold.</span></div></li>
   <li>{IC["rupee"]}<div><b>Projects and payments</b><span>Advances, dues and renewals for every client in one place.</span></div></li>
   <li>{IC["team"]}<div><b>Team logins</b><span>Each person sees their leads, the owner sees everything.</span></div></li>
  </ul>
  <a class="btn" href="/services/erp-crm" data-magnetic>CRM and ERP development {ARROW}</a>
 </div>
 <div data-rv>{crm_mock()}</div>
</div></section>

<section class="sec sec--alt" id="industries"><div class="wrap">
 {sec_head("[04] Who we work with", "Built for the businesses of Lucknow.", "Different businesses need different things from technology. These are the problems we solve most often.")}
 <div class="grid-4" data-stagger>{ind}</div>
</div></section>

<section class="sec" id="stack"><div class="wrap">
 {sec_head("[05] Technology", "Modern, proven tools. No lock-in.", "We choose technology for speed, security and how easy it will be to maintain in five years. Everything we use is widely known, so you're never stuck with one developer.")}
 <div class="stack" data-stagger>{stk}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
 <div class="band" data-rv>
  <div>
   <span class="label" data-scramble>[06] Free website audit</span>
   <h2 class="h2 split" style="margin-top:22px;font-size:clamp(2rem,3.8vw,3.4rem)">Find out why your website isn't bringing enquiries.</h2>
   <ul class="check"><li>Speed on mobile and Core Web Vitals</li><li>Google indexing and SEO basics</li><li>Security, contact flow and two local competitors</li></ul>
   <div class="actions"><a class="btn" href="/audit" data-magnetic>Get my free audit {ARROW}</a></div>
  </div>
  {holo("seo")}
 </div>
</div></section>

<section class="sec sec--alt" id="faq"><div class="wrap">
 {sec_head("[07] Questions", "Before you ask.", center=True)}
 {faq_block(FAQS)}
</div></section>

{mega('Let\'s build something <span class="grad">remarkable.</span>', "Tell us what you want to build. The first conversation is free and there's no pressure to sign anything.")}
'''
    return page("public/index.html", "Web Works India — Website development, software and SEO in Lucknow",
                "Lucknow tech studio building business websites, e-commerce stores, custom software, CRM and ERP, SEO and WhatsApp automation. Free website audit.",
                "/", "", body, '<script type="module" src="/js/globe.js"></script>' + HOLO_JS, intro)

def services_index():
    rows = "".join(f'''<a class="svc-row spot hud" href="/services/{s["id"]}" data-holo-host data-cursor="Open" data-rv>
  {holo(s["id"])}
  <div class="body"><div style="display:flex;justify-content:space-between;gap:10px"><span class="idx">{num(i)} / {N:02d}</span><span class="time mono" style="font-size:.74rem;color:var(--ice)">{s["timeline"]}</span></div>
   <h2>{s["name"]}</h2><p>{s["who"]}</p>
   <span class="link">See what's included {ARROW}</span></div>
 </a>''' for i, s in enumerate(SERVICES))
    body = f'''
<section class="p-hero"><div class="bg-grid"></div><div class="wrap">
 <div class="crumbs"><a href="/">Home</a><i>/</i><span>Services</span></div>
 <span class="label" data-scramble>Services · {N:02d}</span>
 <h1 class="h1 split" style="margin-top:22px;max-width:14ch">Everything your business needs online.</h1>
 <p class="lede" data-rv>Eight services, each explained in detail: who it's for, what you get, how long it takes and how we charge. Not sure which one you need? <a class="link" href="/contact">Ask us</a> and we'll tell you honestly.</p>
</div></section>
<section class="sec" style="padding-top:20px"><div class="wrap"><div class="svc-grid">{rows}</div></div></section>
{mega('Not sure where to <span class="grad">start?</span>', "Start with a free audit of your current website, or message us what you have in mind.", ("Get a free audit", "/audit"))}
'''
    page("public/services/index.html", "Services — Web Works India, Lucknow",
         "Business websites, e-commerce, custom web apps, CRM and ERP, SEO, WhatsApp automation, UI/UX design and website maintenance in Lucknow.",
         "/services/", "services", body, HOLO_JS)

def service_page(i, s):
    grid = "".join(f'<div class="tile spot"><span class="idx">{num(k)}</span><h3>{a}</h3><p>{b}</p></div>' for k, (a, b) in enumerate(s["grid"]))
    inc = "".join(f"<li>{x}</li>" for x in s["includes"])
    chips = "".join(f"<span>{t}</span>" for t in s["tech"])
    others = [SERVICES[(i + k) % N] for k in range(1, 5)]
    oth = "".join(f'<a class="other spot" href="/services/{o["id"]}" data-holo-host>{holo(o["id"])}<div><b>{o["name"]}</b><span>{o["short"]}</span></div></a>' for o in others)
    body = f'''
<section class="p-hero p-hero--split"><div class="bg-grid"></div><div class="wrap">
 <div>
  <div class="crumbs"><a href="/">Home</a><i>/</i><a href="/services/">Services</a><i>/</i><span>{num(i)}</span></div>
  <span class="label" data-scramble>Service {num(i)} / {N:02d}</span>
  <h1 class="h1 split" style="margin-top:22px">{s["name"]}</h1>
  <p class="lede" data-rv>{s["intro"]}</p>
  <div class="actions" data-rv style="margin-top:34px"><a class="btn btn--lg" href="#enquire" data-magnetic>Get a quote {ARROW}</a><a class="btn btn--wa btn--lg" href="{wa(f"Hello Web Works India, I'm interested in {s['name']}.")}" target="_blank" rel="noopener" data-magnetic>{WA_ICO}Discuss on WhatsApp</a></div>
 </div>
 <div data-holo-host>{holo(s["id"], "holo-big")}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
 <div class="facts" data-stagger><div><span>Best for</span><b>{s["who"]}</b></div><div><span>Typical timeline</span><b>{s["timeline"]}</b></div><div><span>How we charge</span><b>{s["engagement"]}</b></div></div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("[01] What we build", "Pick what fits your business.")}
 <div class="grid-4" data-stagger>{grid}</div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_head("[02] What's included", "Everything in the box.", "No hidden extras. This is the standard scope, and the proposal lists exactly what you'll receive.")}
 <ol class="incl" data-stagger>{inc}</ol>
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("[03] Tools we use", "Proven technology, chosen for you.")}
 <div class="chips" data-stagger>{chips}</div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_head("[04] Questions", "Common questions.", center=True)}
 {faq_block(SERVICE_FAQ.get(s["id"], []) + [FAQS[2], FAQS[4]])}
</div></section>

<section class="sec sec--alt" id="enquire"><div class="wrap contact">
 <div>
  <span class="label" data-scramble>[05] Get a quote</span>
  <h2 class="h2 split" style="margin-top:22px">Tell us about your project.</h2>
  <p class="lede" data-rv style="margin-top:20px">Share a few details and we'll reply within one working day with questions or a written quote.</p>
  <div class="c-list" data-stagger>
   <a class="spot wa" href="{wa(f"Hello Web Works India, I'm interested in {s['name']}.")}" target="_blank" rel="noopener">{IC["wa"]}<span><small>WhatsApp</small><b>{pretty(WHATSAPP)}</b></span></a>
   <a class="spot" href="https://www.google.com/maps/search/?api=1&query={MAP_Q}" target="_blank" rel="noopener">{IC["pin"]}<span><small>Office</small><b>{ADDRESS[0]}, {ADDRESS[2]}</b></span></a>
  </div>
 </div>
 <div class="card spot" data-rv>{enquiry_form("project", s["name"])}</div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_head("[06] Keep exploring", "Other services.")}
 <div class="others" data-stagger>{oth}</div>
</div></section>
'''
    page(f"public/services/{s['id']}.html", f"{s['name']} in Lucknow — Web Works India", f"{s['short']}. {s['who']}",
         f"/services/{s['id']}", "services", body, HOLO_JS)

CONCEPTS = [("Lumina Dental", "Clinic website + booking", "Same-day appointments, WhatsApp reminders and local SEO for a dental clinic.", "Book a visit in 30 seconds.", "#F38028"),
            ("Mehra Classes", "Coaching institute portal", "Admissions, fee payments, attendance and a parent app for a coaching institute.", "Your results, one tap away.", "#6E9BFF"),
            ("Aarav Foods", "Online ordering", "Menu, table QR ordering, UPI payments and delivery tracking for a restaurant.", "Hot food. Two taps.", "#3FBF77"),
            ("Gupta Steels", "Dealer ERP", "Dealer price lists, bulk orders, GST billing and stock across godowns.", "Order steel like it's 2026.", "#9FE7FF"),
            ("Shree Realty", "Sales CRM", "Leads from portals, site-visit scheduling and a pipeline for the sales team.", "Every enquiry, followed up.", "#FFA45C"),
            ("Nidhi Boutique", "E-commerce store", "A boutique store with UPI, COD with OTP, Shiprocket and Instagram catalogue.", "New drop. Shop the look.", "#FF7AB6")]

def work():
    cc = "".join(f'''<div class="concept spot" data-rv>
  <div class="shot"><div class="browser"><div class="browser-bar"><i></i><i></i><i></i><span>{n.lower().replace(" ", "")}.in</span></div>
   <div class="browser-body"><div class="bb-nav"><b>{n}</b><span><i></i><i></i><i></i></span></div><div class="bb-h">{h}</div><div class="bb-p"></div><div class="bb-p s"></div>
    <div class="bb-row"><span class="bb-btn" style="--c:{c}"></span><span class="bb-btn o"></span></div><div class="bb-cards"><i></i><i></i><i></i></div></div></div></div>
  <div class="body"><span class="badge">Concept</span><h3>{n} · {t}</h3><p>{d}</p></div>
 </div>''' for n, t, d, h, c in CONCEPTS)
    body = f'''
<section class="p-hero"><div class="bg-grid"></div><div class="wrap">
 <div class="crumbs"><a href="/">Home</a><i>/</i><span>Work</span></div>
 <span class="label" data-scramble>Work</span>
 <h1 class="h1 split" style="margin-top:22px;max-width:15ch">Software that runs real businesses.</h1>
 <p class="lede" data-rv>Here's software we use every day ourselves, and concept builds that show how we approach each industry. Want to see live client websites in your field? <a class="link" href="{wa("Hello Web Works India, please share some client websites you've built.")}" target="_blank" rel="noopener">Ask us on WhatsApp</a>.</p>
</div></section>

<section class="sec" style="padding-top:10px"><div class="wrap">
 <div class="case spot hud" data-rv>
  <div>
   <span class="badge" style="background:rgba(63,191,119,.14);color:#6FE0A0">In production</span>
   <h2 class="h2" style="margin-top:20px;font-size:clamp(2rem,3.6vw,3.2rem)">Web Works CRM</h2>
   <p class="lede" style="margin-top:18px">Our own lead and project system. Every enquiry from this website lands in it within seconds, gets an owner and a follow-up date, and moves through a pipeline to payment.</p>
   <div class="tags"><span>Node.js</span><span>PostgreSQL</span><span>Role-based logins</span><span>Email alerts</span><span>Pipeline</span></div>
   <a class="btn" href="/services/erp-crm" data-magnetic>Build one for your business {ARROW}</a>
  </div>
  <div>{crm_mock()}</div>
 </div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("Concept builds", "How we'd build for your industry.", "Design concepts made in-house to show our approach. Names are fictional; the features are what we deliver.")}
 <div class="grid-3">{cc}</div>
</div></section>

{mega('Your project <span class="grad">could be next.</span>', "Tell us what you want to build and we'll show you relevant work from your industry.")}
'''
    page("public/work.html", "Work — Web Works India", "Software we run ourselves and concept builds for clinics, institutes, restaurants, traders, real estate and retail.", "/work", "work", body)

def about():
    vals = "".join(f'<div class="tile spot hud">{IC[ic].replace("<svg ", "<svg class=\"ico\" ", 1)}<h3>{a}</h3><p>{b}</p></div>' for ic, a, b in PROMISES)
    body = f'''
<section class="p-hero"><div class="bg-grid"></div><div class="wrap">
 <div class="crumbs"><a href="/">Home</a><i>/</i><span>About</span></div>
 <span class="label" data-scramble>About the studio</span>
 <h1 class="h1 split" style="margin-top:22px;max-width:16ch">A tech studio from Lucknow, building for the whole internet.</h1>
 <p class="lede" data-rv>Web Works India designs and builds websites, online stores, custom software and CRMs, and helps businesses get found on Google. One team does all of it, so your website, software and WhatsApp work together from day one.</p>
</div></section>

<section class="sec" style="padding-top:20px"><div class="wrap">
 <p class="manifesto split">We don't sell templates or vanity rankings. We build <em>systems that bring enquiries</em>, show you the work <em>every week</em>, and hand you <em>everything we build.</em></p>
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("[01] What you can count on", "Four promises, in writing.")}
 <div class="values" data-stagger>{vals}</div>
</div></section>

<section class="sec" id="process"><div class="bg-grid"></div><div class="wrap">
 {sec_head("[02] How we work", "From first call to launch day.", "Five stages, each with something you can see and approve.")}
 {steps_block()}
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("[03] Visit us", "Our office on Sitapur Road.")}
 <div class="office">
  <div class="tile spot hud">
   <span class="idx">Address</span>
   <p style="color:var(--text);font-size:1.15rem;line-height:1.5;margin:0">{"<br>".join(ADDRESS)}</p>
   <a class="btn btn--wa" href="{wa("Hello Web Works India, I'd like to visit your office.")}" target="_blank" rel="noopener">{WA_ICO}WhatsApp before you visit</a>
   <a class="link" href="https://www.google.com/maps/search/?api=1&query={MAP_Q}" target="_blank" rel="noopener">Directions in Google Maps {ARROW}</a>
  </div>
  <div class="map"><iframe title="Web Works India office on Google Maps" src="https://www.google.com/maps?q={MAP_Q}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
 </div>
</div></section>

{mega('Let\'s build <span class="grad">together.</span>', "The first conversation is free. Tell us where your business is today and where you want it to be.")}
'''
    page("public/about.html", "About — Web Works India, Lucknow", "Web Works India is a Lucknow tech studio: one team for websites, software, SEO and automation, with a written scope and weekly previews.", "/about", "about", body)

def audit():
    howit = [("Send your link", "Fill in the form with your website address and WhatsApp number."), ("A developer reviews it by hand", "Speed, SEO, security, contact flow and two local competitors. No automated score."), ("Get the report on WhatsApp", "A clear list of what to fix first, within 2 working days. No obligation.")]
    hw = "".join(f'<div class="tile spot hud"><span class="idx">{num(i)}</span><h3>{a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(howit))
    afaq = [("Is the audit really free?", "Yes. There's no charge and no obligation. If you want us to fix things afterwards, we'll send a separate quote."),
            ("Is this an automated score?", "No. A developer from our team opens your site, tests it on a phone and writes the report by hand."),
            ("I don't have a website yet. Can you still help?", "Yes. Message us on WhatsApp and we'll review your Google Business Profile and competitors instead.")]
    body = f'''
<section class="p-hero p-hero--split"><div class="bg-grid"></div><div class="wrap">
 <div>
  <div class="crumbs"><a href="/">Home</a><i>/</i><span>Free audit</span></div>
  <span class="label" data-scramble>Free website audit</span>
  <h1 class="h1 split" style="margin-top:22px">Find out why your website isn't bringing enquiries.</h1>
  <p class="lede" data-rv>Send us your website address. A developer from our team reviews it by hand and sends you a clear report with what to fix first. No automated score, no obligation.</p>
  <div class="actions" data-rv style="margin-top:34px"><a class="btn btn--lg" href="#audit-form" data-magnetic>Request my audit {ARROW}</a></div>
 </div>
 <div>{holo("seo", "holo-big")}</div>
</div></section>

<section class="sec" id="audit-form" style="padding-top:20px"><div class="wrap contact">
 <div>
  <span class="label" data-scramble>[01] What we check</span>
  <h2 class="h2 split" style="margin-top:22px">Five things that decide if visitors call you.</h2>
  <ul class="check" data-stagger style="margin-top:30px"><li>Speed on mobile and Core Web Vitals</li><li>Google indexing and SEO basics</li><li>Security: SSL, outdated plugins, exposed files</li><li>Contact flow: how easily a visitor can reach you</li><li>How you compare with two local competitors</li></ul>
 </div>
 <div class="card spot hud" data-rv>{enquiry_form("audit")}</div>
</div></section>

<section class="sec sec--alt"><div class="wrap">
 {sec_head("[02] How it works", "Three steps. Two working days.")}
 <div class="grid-3" data-stagger>{hw}</div>
</div></section>

<section class="sec"><div class="wrap">
 {sec_head("[03] Questions", "About the audit.", center=True)}
 {faq_block(afaq)}
</div></section>
'''
    page("public/audit.html", "Free website audit — Web Works India, Lucknow", "A developer reviews your website by hand: speed, SEO, security, contact flow and competitors. Report on WhatsApp within 2 working days.", "/audit", "audit", body, HOLO_JS)

def contact():
    mail = f'<a class="spot" href="mailto:{EMAIL}">{IC["mail"]}<span><small>Email</small><b>{EMAIL}</b></span></a>' if EMAIL else ""
    body = f'''
<section class="p-hero"><div class="bg-grid"></div><div class="wrap">
 <div class="crumbs"><a href="/">Home</a><i>/</i><span>Contact</span></div>
 <span class="label" data-scramble>Start a project</span>
 <h1 class="h1 split" style="margin-top:22px;max-width:14ch">Tell us what you want to build.</h1>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap contact">
 <div>
  <p class="lede" data-rv>Fill in the form, message us on WhatsApp, or walk into our office on Sitapur Road. The first conversation is free and there's no pressure to sign anything.</p>
  <div class="c-list" data-stagger>
   <a class="spot wa" href="{wa("Hello Web Works India, I'd like to discuss a project.")}" target="_blank" rel="noopener">{IC["wa"]}<span><small>WhatsApp</small><b>{pretty(WHATSAPP)}</b></span></a>
   <a class="spot" href="https://www.google.com/maps/search/?api=1&query={MAP_Q}" target="_blank" rel="noopener">{IC["pin"]}<span><small>Office</small><b>{ADDRESS[0]}, {ADDRESS[2]}</b></span></a>
   {mail}
   <div class="spot">{IC["clock"]}<span><small>Reply time</small><b>Within one working day</b></span></div>
  </div>
 </div>
 <div class="card spot hud" data-rv>{enquiry_form("project")}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap"><div class="map" data-rv><iframe title="Web Works India office on Google Maps" src="https://www.google.com/maps?q={MAP_Q}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></section>
'''
    page("public/contact.html", "Contact — Web Works India, Lucknow", "Start a project with Web Works India. WhatsApp us, visit our office on Sitapur Road, Lucknow, or send an enquiry.", "/contact", "contact", body)

def notfound():
    body = f'''<section class="p-hero" style="min-height:90vh;display:flex;align-items:center"><div class="bg-grid"></div><div class="wrap">
 <span class="label" data-scramble>Error 404 · signal lost</span>
 <h1 class="h1" style="margin:22px 0 0;font-size:clamp(5rem,20vw,16rem)"><span class="grad">404</span></h1>
 <p class="lede" style="margin:10px 0 30px">This page doesn't exist. The link may be old or mistyped.</p>
 <div class="actions"><a class="btn" href="/">Back to home {ARROW}</a><a class="btn btn--ghost" href="/services/">See services</a></div>
</div></section>'''
    page("public/404.html", "Page not found — Web Works India", "Page not found.", "/404", "", body)

def extras(urls):
    # the demo link that was shared earlier now points at the real homepage
    open("public/v2.html", "w", encoding="utf-8").write('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="/"><meta http-equiv="refresh" content="0;url=/"><title>Web Works India</title><a href="/">Web Works India</a>')
    sm = "".join(f"<url><loc>{SITE}{u}</loc></url>" for u in urls)
    open("public/sitemap.xml", "w", encoding="utf-8").write(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>\n')
    open("public/robots.txt", "w", encoding="utf-8").write(f"User-agent: *\nDisallow: /crm/\nDisallow: /api/\nSitemap: {SITE}/sitemap.xml\n")

urls = ["/"]
index()
services_index(); urls.append("/services/")
for i, s in enumerate(SERVICES):
    service_page(i, s); urls.append(f"/services/{s['id']}")
work(); about(); audit(); contact(); notfound()
urls += ["/work", "/about", "/audit", "/contact"]
extras(urls)
print("built", len(urls), "pages")
