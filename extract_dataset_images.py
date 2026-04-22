import fitz
import pandas as pd
import math
import os

EXCEL_FILE = "JohnDeere_Parts_Ecommerce_Dataset_2021.xlsx"
PDF_FILE = "49AG.2021.408910.01_ENG_GB.pdf"
IMAGE_OUT_DIR = "frontend/public/images/"

def distance(r1, r2):
    cx1 = (r1[0] + r1[2]) / 2
    cy1 = (r1[1] + r1[3]) / 2
    cx2 = (r2[0] + r2[2]) / 2
    cy2 = (r2[1] + r2[3]) / 2
    return math.hypot(cx1 - cx2, cy1 - cy2)

def run():
    print("Loading Excel dataset...")
    df = pd.read_excel(EXCEL_FILE, sheet_name="Products", skiprows=2)
    print(f"Loaded {len(df)} products from Excel.")
    
    os.makedirs(IMAGE_OUT_DIR, exist_ok=True)
    doc = fitz.open(PDF_FILE)
    
    extracted_count = 0
    
    for idx, row in df.iterrows():
        part_num = str(row['Part Number']).strip()
        cat_page = row['Catalogue Page']
        
        if pd.isna(cat_page):
            continue
            
        try:
            # Try to convert to int if it's like "5" or "5.0"
            page_index = int(float(cat_page)) - 1 
        except ValueError:
            continue
            
        if page_index < 0 or page_index >= len(doc):
            print(f"Invalid page {page_index+1} for part {part_num}")
            continue
            
        page = doc[page_index]
        dict_data = page.get_text("dict")
        blocks = dict_data["blocks"]
        
        text_blocks = []
        image_blocks = []
        
        for b in blocks:
            if b["type"] == 0:
                text = ""
                for l in b["lines"]:
                    for s in l["spans"]:
                        text += s["text"] + " "
                text_blocks.append({"bbox": b["bbox"], "text": text.strip()})
            elif b["type"] == 1:
                image_blocks.append(b)
                
        if not image_blocks:
            print(f"No images on page {page_index+1} for {part_num}")
            continue
            
        # Find the text block containing the part number
        target_tb = None
        for tb in text_blocks:
            if part_num in tb["text"] or part_num.replace("-", "") in tb["text"].replace("-", ""):
                target_tb = tb
                break
                
        best_img = None
        if target_tb:
            # Find the closest image
            min_dist = float('inf')
            for img_b in image_blocks:
                d = distance(target_tb["bbox"], img_b["bbox"])
                if d < min_dist:
                    min_dist = d
                    best_img = img_b
        else:
            # If part number text isn't found exactly, just take the first image on the page
            # Assuming one product per page or sequentially. 
            # If there are multiple, it might be inaccurate without text, but it's the best guess.
            best_img = image_blocks[0]
            
        if best_img:
            img_bytes = best_img.get("image")
            if not img_bytes:
                # Try getting it from doc.extract_image if image bytes are missing in dict
                continue
                
            ext = best_img.get("ext", "jpeg")
            if ext == "jpx": ext = "jpeg" # some pdfs use jpx for jpeg2000
            
            img_filename = f"{part_num}.{ext}"
            out_path = os.path.join(IMAGE_OUT_DIR, img_filename)
            
            with open(out_path, "wb") as f:
                f.write(img_bytes)
                
            df.at[idx, 'Image URL'] = f"/images/{img_filename}"
            extracted_count += 1
            print(f"Extracted image for {part_num} from page {page_index+1}")

    print(f"\nExtracted {extracted_count} images successfully!")
    
    # Save the updated dataframe as a CSV for the frontend to consume
    df.to_csv("final_catalog.csv", index=False)
    print("Saved mapped dataset to final_catalog.csv")

if __name__ == "__main__":
    run()
