import pandas as pd
import mysql.connector
import json

CSV_FILE = "final_catalog.csv"

# Mapping dataset categories to MySQL ENUM
def map_category(cat_str):
    if not isinstance(cat_str, str):
        return 'STRUCTURAL'
    cat_lower = cat_str.lower()
    if 'engine' in cat_lower or 'fuel' in cat_lower or 'exhaust' in cat_lower or 'cooling' in cat_lower:
        return 'ENGINE'
    elif 'hydraulic' in cat_lower:
        return 'HYDRAULIC'
    elif 'electrical' in cat_lower or 'lighting' in cat_lower or 'sensor' in cat_lower:
        return 'ELECTRICAL'
    elif 'transmission' in cat_lower or 'drivetrain' in cat_lower or 'pto' in cat_lower:
        return 'TRANSMISSION'
    else:
        return 'STRUCTURAL'

def run():
    print("Reading final_catalog.csv...")
    df = pd.read_csv(CSV_FILE)
    
    sql_lines = [
        "USE defaultdb;",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "TRUNCATE TABLE parts;",
        "TRUNCATE TABLE inventory;",
        "SET FOREIGN_KEY_CHECKS = 1;",
        ""
    ]
    
    insert_query_base = """INSERT INTO parts (id, part_number, part_name, description, category, price, mrp, stock, image_url, compatible_models, is_active, is_featured) VALUES """
    inventory_query_base = """INSERT INTO inventory (part_id, available_stock) VALUES """
    
    count = 0
    seen_part_numbers = set()
    
    for _, row in df.iterrows():
        part_num = str(row['Part Number']).strip()
        
        # Skip invalid, empty or placeholder part numbers
        if not part_num or part_num in ['–', 'nan', 'NULL', 'None', '???'] or len(part_num) < 2:
            continue
            
        if part_num in seen_part_numbers:
            print(f"Skipping duplicate part number: {part_num}")
            continue
            
        seen_part_numbers.add(part_num)
        
        # Escape single quotes for SQL
        part_num_sql = part_num.replace("'", "''")
        part_name = str(row['Product Name']).strip().replace("'", "''")
        
        desc = str(row['Description']).strip()
        if not pd.isna(row['Key Features']):
            desc += "\nKey Features: " + str(row['Key Features'])
        desc = desc.replace("'", "''")
        
        category = map_category(row['Category'])
        
        try:
            price = float(row['Price EUR'])
            if price <= 0:
                price = 500.00 # Default placeholder for missing prices
        except:
            price = 500.00 # Default placeholder for missing prices
        mrp = round(price * 1.2, 2)
        
        stock = 100 if "In Stock" in str(row['Stock Status']) else 0
        
        img_url = str(row['Image URL']).replace("'", "''") if not pd.isna(row['Image URL']) else "NULL"
        img_val = f"'{img_url}'" if img_url != "NULL" else "NULL"
        
        models_str = str(row['Compatible Series / Models'])
        models_list = [m.strip() for m in models_str.split(';')] if not pd.isna(row['Compatible Series / Models']) else []
        models_json = json.dumps(models_list).replace("'", "''")
        
        is_featured = "TRUE" if count < 12 else "FALSE"
        
        part_id = count + 1
        values = f"({part_id}, '{part_num_sql}', '{part_name}', '{desc}', '{category}', {price}, {mrp}, {stock}, {img_val}, '{models_json}', TRUE, {is_featured});"
        sql_lines.append(insert_query_base + values)
        
        # Add inventory record
        inv_values = f"({part_id}, {stock});"
        sql_lines.append(inventory_query_base + inv_values)
        
        count += 1
            
    with open("seed_catalog.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))
    
    print(f"Successfully generated seed_catalog.sql with {count} parts!")

if __name__ == "__main__":
    run()
