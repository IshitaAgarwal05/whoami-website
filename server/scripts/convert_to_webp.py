import os
from PIL import Image

def convert_to_webp(directory):
    print(f"Scanning directory: {directory}")
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                input_path = os.path.join(root, file)
                output_path = os.path.splitext(input_path)[0] + ".webp"
                
                if not os.path.exists(output_path):
                    try:
                        print(f"Converting: {input_path} -> {output_path}")
                        with Image.open(input_path) as img:
                            img.save(output_path, "WEBP", quality=85)
                        os.remove(input_path)
                        print(f"Deleted original: {file}")
                    except Exception as e:
                        print(f"Failed to convert {input_path}: {e}")
                else:
                    print(f"Skipping (WebP already exists): {output_path}")
                    try:
                        os.remove(input_path)
                        print(f"Deleted original: {file}")
                    except Exception as e:
                        pass

if __name__ == "__main__":
    base_path = os.path.join(os.getcwd(), "public")
    convert_to_webp(os.path.join(base_path, "products"))
    convert_to_webp(os.path.join(base_path, "combo"))
    convert_to_webp(os.path.join(base_path, "custom_orders"))
    convert_to_webp(os.path.join(base_path, "gallery"))
    convert_to_webp(os.path.join(base_path, "reviews"))
    print("Conversion complete.")
