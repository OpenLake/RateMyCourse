import os
import re
import json
import requests
import pdfplumber

# Ensure the output directory exists
os.makedirs("generated", exist_ok=True)

# Download the PDF
url = "https://www.iitbhilai.ac.in/index.php?pid=new_schedule_programs"
pdf_path = "file.pdf"

response = requests.get(url, verify=False)
with open(pdf_path, "wb") as f:
    f.write(response.content)

# Extract text from PDF
with pdfplumber.open(pdf_path) as pdf:
    all_text = ""
    for page in pdf.pages:
        all_text += page.extract_text()

# Function to parse each department's course block
def split_by_credits(text):
    pattern = r'([A-Za-z]{2,3}\d{3})(?:(?![A-Za-z]{2,3}\d{3}).)*?Credits'
    matches = re.finditer(pattern, text, re.DOTALL)

    result = []
    for match in matches:
        course_code = match.group(1)
        start_idx = match.start(1)
        end_idx = match.end()

        def split_course_line(line):
            match = re.search(r'(?=\d+(?:\.\d+)?\s+Credits)', line)
            if match:
                return [line[:match.start()].strip(), line[match.start():].strip()]
            return [line]

        result.append(split_course_line(text[start_idx:end_idx]))

    department = text[:text.index(result[0][0])].replace("\n", " ").strip()
    new = []
    for i in result:
        temp = {
            "id": i[0].partition(' ')[0].lower(),
            "code": i[0].partition(' ')[0],
            "title": i[0].partition(' ')[2],
            "credits": i[1].rstrip(" Credits"),
            "department": department,
        }
        new.append(temp)

    return new

# Parse all departments
departments = all_text.split("Courses offered in the Discipline of ")
results = [split_by_credits(dept_text) for dept_text in departments[1:]]

# Save final JSON
with open("../public/generated/result.json", "w") as out:
    json.dump(results, out, indent=2)

print("Parsing complete. Output saved to generated/result.json")
