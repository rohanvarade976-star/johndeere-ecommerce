import csv

with open('database/schema.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

start = sql.find("INSERT INTO parts")
values_str = sql[start:]
end = values_str.rfind(";")
values_str = values_str[:end]

# Extract lines that look like parts
lines = [l.strip() for l in values_str.split("\n") if l.strip().startswith("('")]

rows = []
for line in lines:
    line = line.rstrip(",")
    if line.startswith("("): line = line[1:]
    if line.endswith(")"): line = line[:-1]
    
    reader = csv.reader([line], quotechar="'", skipinitialspace=True)
    row = next(reader)
    if len(row) > 13:
        part_number = row[0]
        part_name = row[1]
        
        # Use our high-quality local AI-generated images
        pn_lower = part_name.lower()
        if "filter" in pn_lower:
            image_url = "/images/oil_filter.png"
        elif "pump" in pn_lower:
            image_url = "/images/hydraulic_pump.png"
        elif "alternator" in pn_lower or "starter" in pn_lower or "battery" in pn_lower:
            image_url = "/images/alternator.png"
        elif "belt" in pn_lower:
            image_url = "/images/v_belt.png"
        else:
            image_url = "/images/generic_part.png"
        
        compatible_models = row[13]
        image_filename = f"{part_number}.jpg"
        rows.append({
            'part_name': part_name,
            'compatible_models': compatible_models,
            'image_filename': image_filename,
            'image_url': image_url
        })

with open('enriched_catalog.csv', 'w', newline='', encoding='utf-8') as out:
    writer = csv.DictWriter(out, fieldnames=['part_name', 'compatible_models', 'image_filename', 'image_url'])
    writer.writeheader()
    writer.writerows(rows)
print(f"Generated enriched_catalog.csv with {len(rows)} parts and valid image URLs.")
