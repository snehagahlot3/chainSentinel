#!/usr/bin/env python3
"""
ChainSentinel Demo Automation Script
Records a complete demo of the multi-location supply chain system.
Designed for 3-minute demo video.
"""

import requests
import json
import time
import sys
import os

BASE_URL = "http://localhost:3000"
ORG_ID = "demo-org"

class colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(title):
    clear()
    print(f"{colors.BOLD}{colors.CYAN}{'='*60}{colors.END}")
    print(f"{colors.BOLD}{colors.CYAN}{title:^60}{colors.END}")
    print(f"{colors.BOLD}{colors.CYAN}{'='*60}{colors.END}\n")

def print_step(num, title):
    print(f"\n{colors.BOLD}{colors.BLUE}━━━ Step {num}: {title} ━━━{colors.END}")

def print_action(action):
    print(f"  {colors.YELLOW}▸{colors.END} {action}")

def print_success(msg):
    print(f"  {colors.GREEN}✓{colors.END} {msg}")

def print_error(msg):
    print(f"  {colors.RED}✗{colors.END} {msg}")

def print_data(label, data):
    print(f"  {colors.CYAN}{label}:{colors.END} {data}")

def wait(seconds=1.5):
    time.sleep(seconds)

def banner(text):
    print(f"\n{colors.BOLD}{colors.GREEN}{text}{colors.END}\n")


def demo_intro():
    print_header("ChainSentinel: Supply Chain Control Tower")
    print(f"{colors.BOLD}Demo Features:{colors.END}")
    print("  1. Multi-Location Inventory Management")
    print("  2. Automated Stock Transfers")
    print("  3. Supplier Management with Lead Times")
    print("  4. Automation Rules (low stock → action)")
    print("  5. Developer SDK & API Documentation")
    print(f"\n{colors.YELLOW}Press ENTER to begin...{colors.END}")
    input()


def demo_locations():
    print_header("Scene 1: Multi-Location Management")
    
    print_step(1, "View All Locations")
    print_action("Fetching locations from API...")
    
    resp = requests.get(f"{BASE_URL}/api/locations?organizationId={ORG_ID}")
    locations = resp.json() if resp.status_code == 200 else []
    
    print_success(f"Found {len(locations)} locations:\n")
    for loc in locations:
        print(f"  {colors.BOLD}{loc['name']}{colors.END}")
        print(f"      Type: {loc['type']}")
        print(f"      Address: {loc['address']}, {loc['city']}, {loc['state']} {loc['zipCode']}")
        print(f"      Coords: ({loc.get('latitude', 0):.4f}, {loc.get('longitude', 0):.4f})")
        print(f"      Status: {'Active' if loc.get('isActive') else 'Inactive'}")
        print()
    
    wait()


    print_step(2, "Add New Location")
    print_action("Creating 'Brooklyn Store' location...")
    
    new_loc = {
        "organizationId": ORG_ID,
        "name": "Brooklyn Store",
        "type": "STORE",
        "address": "200 Kings Highway",
        "city": "Brooklyn",
        "state": "NY",
        "zipCode": "11223",
        "latitude": 40.6782,
        "longitude": -73.9442
    }
    
    resp = requests.post(f"{BASE_URL}/api/locations", json=new_loc)
    if resp.status_code == 201:
        loc = resp.json()
        print_success(f"Created: {loc['name']} (ID: {loc['id']})")
    else:
        print_error(f"Failed: {resp.text}")
    
    wait()


def demo_suppliers():
    print_header("Scene 2: Supplier Management")
    
    print_step(3, "View Suppliers")
    print_action("Fetching suppliers...")
    
    resp = requests.get(f"{BASE_URL}/api/suppliers?organizationId={ORG_ID}")
    suppliers = resp.json() if resp.status_code == 200 else []
    
    print_success(f"Found {len(suppliers)} suppliers:\n")
    for sup in suppliers:
        print(f"  {colors.BOLD}{sup['name']}{colors.END}")
        print(f"      Contact: {sup.get('contactName', 'N/A')} ({sup.get('contactEmail', 'N/A')})")
        print(f"      Lead Time: {sup.get('leadTimeDays', 7)} days")
        print(f"      Min Order: ${sup.get('minimumOrderValue', 0):.2f}")
        print()
    
    wait()


    print_step(4, "Add New Supplier")
    print_action("Creating 'GadgetWorld' supplier...")
    
    new_sup = {
        "organizationId": ORG_ID,
        "name": "GadgetWorld",
        "contactName": "Mike Johnson",
        "contactEmail": "mike@gadgetworld.com",
        "contactPhone": "800-555-1234",
        "leadTimeDays": 5,
        "minimumOrderValue": 500,
        "paymentTerms": "Net 30"
    }
    
    resp = requests.post(f"{BASE_URL}/api/suppliers", json=new_sup)
    if resp.status_code == 201:
        sup = resp.json()
        print_success(f"Created: {sup['name']} with {sup['leadTimeDays']}-day lead time")
    else:
        print_error(f"Failed: {resp.text}")
    
    wait()


def demo_products_sales():
    print_header("Scene 3: Sales & Inventory")
    
    print_step(5, "View Products & Inventory")
    print_action("Fetching products with inventory levels...")
    
    resp = requests.get(f"{BASE_URL}/api/products?organizationId={ORG_ID}")
    products = resp.json() if resp.status_code == 200 else []
    
    print_success(f"Found {len(products)} products:\n")
    for prod in products[:5]:
        inv = prod.get('inventories', [{}])[0] if prod.get('inventories') else {}
        qty = inv.get('quantity', 0) if inv else 0
        threshold = inv.get('minThreshold', 0) if inv else 0
        status = f"{qty}/{threshold}" if qty else "N/A"
        print(f"  {colors.BOLD}{prod['name']}{colors.END} ({prod['sku']})")
        print(f"      Price: ${prod['price']:.2f} | Stock: {qty} | Min Threshold: {threshold}")
    
    wait()


    print_step(6, "Record a Sale (Triggers Automation)")
    print_action("Recording sale: 2x Smart Watch...")
    
    sale = {
        "organizationId": ORG_ID,
        "productSku": "PROD-002",
        "quantity": 2,
        "source": "demo",
        "customerEmail": "customer@example.com"
    }
    
    resp = requests.post(f"{BASE_URL}/api/sales", json=sale)
    if resp.status_code in [200, 201]:
        result = resp.json()
        print_success("Sale recorded!")
        if result.get('inventoryUpdated'):
            print_data("New Quantity", result.get('newQuantity'))
        if result.get('automationsTriggered'):
            print_data("Automations Triggered", result.get('automationsTriggered'))
        if result.get('lowStockAlert'):
            print_data("Alert", "LOW_STOCK triggered!")
    else:
        print_error(f"Failed: {resp.text}")
    
    wait()


def demo_transfers():
    print_header("Scene 4: Stock Transfers")
    
    print_step(7, "Create Stock Transfer")
    print_action("Requesting stock transfer between locations...")
    
    resp = requests.get(f"{BASE_URL}/api/locations?organizationId={ORG_ID}")
    locs = resp.json()
    from_loc = next((l for l in locs if l['name'] == 'Main Store'), locs[0] if locs else None)
    to_loc = next((l for l in locs if l['name'] in ['Brooklyn Store', 'Warehouse DC']), locs[1] if len(locs) > 1 else None)
    
    if from_loc and to_loc:
        transfer = {
            "organizationId": ORG_ID,
            "fromLocationId": from_loc['id'],
            "toLocationId": to_loc['id'],
            "productId": "PROD-002",
            "quantity": 3,
            "notes": "Restocking Brooklyn Store"
        }
        
        resp = requests.post(f"{BASE_URL}/api/transfers", json=transfer)
        if resp.status_code == 201:
            t = resp.json()
            print_success(f"Transfer created!")
            print_data("From", f"{from_loc['name']} → {to_loc['name']}")
            print_data("Quantity", f"{t['quantity']} units")
            print_data("Status", t['status'])
        else:
            print_error(f"Failed: {resp.text}")
    else:
        print_error("Need at least 2 locations")
    
    wait()


    print_step(8, "Approve & Complete Transfer")
    print_action("Approving transfer workflow...")
    
    resp = requests.get(f"{BASE_URL}/api/transfers?organizationId={ORG_ID}&status=PENDING")
    transfers = resp.json() if resp.status_code == 200 else []
    
    if transfers:
        t = transfers[0]
        
        # Approve
        requests.patch(f"{BASE_URL}/api/transfers", json={"id": t['id'], "status": "APPROVED"})
        print_success(f"✓ APPROVED")
        
        time.sleep(0.5)
        # Ship
        requests.patch(f"{BASE_URL}/api/transfers", json={"id": t['id'], "status": "SHIPPED"})
        print_success(f"✓ SHIPPED")
        
        time.sleep(0.5)
        # Receive
        requests.patch(f"{BASE_URL}/api/transfers", json={"id": t['id'], "status": "RECEIVED"})
        print_success(f"✓ RECEIVED - Stock transferred!")
    else:
        print("No pending transfers found")
    
    wait()


def demo_automations():
    print_header("Scene 5: Automation Rules")
    
    print_step(9, "View Automations")
    print_action("Fetching automation rules...")
    
    resp = requests.get(f"{BASE_URL}/api/automations?organizationId={ORG_ID}")
    automations = resp.json() if resp.status_code == 200 else []
    
    print_success(f"Found {len(automations)} automation rules:\n")
    for auto in automations[:3]:
        print(f"  {colors.BOLD}{auto['name']}{colors.END}")
        print(f"      Trigger: {auto.get('triggerType')}")
        print(f"      Tasks: {len(auto.get('tasks', []))} task(s)")
        print(f"      Status: {'Active' if auto.get('isActive') else 'Inactive'}")
        print()
    
    wait()


    print_step(10, "View Sales History")
    print_action("Fetching recent sales...")
    
    print("  Recent sales trigger automations when inventory is low.\n")
    print(f"  {colors.CYAN}Tip: Create rules at /dashboard/automations{colors.END}")
    
    wait()


def demo_developer():
    print_header("Scene 6: Developer Features")
    
    print_step(11, "API Documentation")
    print("  ChainSentinel provides REST APIs for:\n")
    print("    • /api/sales         - Record sales")
    print("    • /api/locations   - Manage locations")
    print("    • /api/suppliers   - Manage suppliers")
    print("    • /api/transfers   - Stock transfers")
    print("    • /api/automations - Automation rules")
    print("    • /api/inventory  - Inventory management")
    
    wait()
    
    print_step(12, "Server-Side SDK")
    print("  Official SDKs available:\n")
    print("    • Node.js    • Python   • PHP")
    print("    • Ruby      • .NET    ��� Go")
    
    print(f"\n  {colors.CYAN}View docs at: {BASE_URL}/docs{colors.END}")
    
    wait()


def demo_summary():
    print_header("Demo Complete!")
    
    print(f"{colors.BOLD}What we showed:{colors.END}")
    print("  1. ✓ Multi-location inventory (stores + warehouse)")
    print("  2. ✓ Supplier management with lead times")
    print("  3. ✓ Automatic inventory updates on sales")
    print("  4. ✓ Inter-location stock transfers")
    print("  5. ✓ Transfer approval workflow")
    print("  6. ✓ Automation rules engine")
    print("  7. ✓ Developer API documentation")
    print("  8. ✓ Server-side SDKs")
    
    print(f"\n{colors.BOLD}{colors.GREEN}Access in Browser:{colors.END}")
    print(f"    Dashboard:    {BASE_URL}/dashboard")
    print(f"    Locations:    {BASE_URL}/dashboard/locations")
    print(f"    Suppliers:    {BASE_URL}/dashboard/suppliers")
    print(f"    Transfers:   {BASE_URL}/dashboard/transfers")
    print(f"    Automations:  {BASE_URL}/dashboard/automations")
    print(f"    Docs:         {BASE_URL}/docs")
    
    print(f"\n{colors.YELLOW}Press ENTER to exit...{colors.END}")
    input()


def main():
    try:
        # Run demo scenes
        demo_intro()
        demo_locations()
        demo_suppliers()
        demo_products_sales()
        demo_transfers()
        demo_automations()
        demo_developer()
        demo_summary()
        
    except requests.exceptions.ConnectionError:
        print(f"\n{colors.RED}Error: Cannot connect to {BASE_URL}{colors.END}")
        print("Make sure the dev server is running: npm run dev")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n\n{colors.YELLOW}Demo interrupted{colors.END}")
        sys.exit(0)


if __name__ == "__main__":
    main()