import requests
from bs4 import BeautifulSoup
import json
import re
import os
from urllib.parse import urljoin
import warnings
import html

def self_clean_text(text):
    """
    Clean text by replacing special characters and multiple spaces with single spaces
    
    Args:
        text: Text to clean
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Unescape HTML entities
    text = html.unescape(text)
    
    # Replace special characters with space
    text = re.sub(r'[\r\n\t]+', ' ', text)
    
    # Replace non-breaking spaces and other whitespace characters
    text = re.sub(r'\xa0', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def scrape_professors(urls):
    """
    Scrape professor details from multiple URLs and return a list of professor objects.
    
    Args:
        urls: List of URLs to scrape
        
    Returns:
        List of professor objects with details
    """
    all_professors = []
    
    for url in urls:
        try:
            # Get the HTML content with SSL verification disabled
            # Note: This is not recommended for production use but can help diagnose SSL issues
            response = requests.get(url, verify=False)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract the department name from breadcrumb
            department = None
            breadcrumb = soup.select_one('ul.breadcrumb')
            if breadcrumb:
                department_links = breadcrumb.find_all('a', href=re.compile(r'dept_'))
                if department_links:
                    # Get the last department link text
                    department = department_links[-1].text.strip()
            
            # If department not found in breadcrumb, try to infer from URL or page title
            if not department:
                title_elem = soup.find('title')
                if title_elem and 'department' in title_elem.text.lower():
                    department_match = re.search(r'department of ([^|]+)', title_elem.text, re.IGNORECASE)
                    if department_match:
                        department = department_match.group(1).strip()
                else:
                    # Extract from URL if contains department info
                    dept_match = re.search(r'dept_(\w+)', url)
                    if dept_match:
                        dept_code = dept_match.group(1)
                        # Map department codes to full names
                        dept_map = {
                            'cse': 'Department of Computer Science and Engineering',
                            'ee': 'Department of Electrical Engineering',
                            'me': 'Department of Mechanical Engineering',
                            'ece': 'Department of Electronics and Communication Engineering',
                            'msme': 'Department of Materials Science and Metallurgical Engineering',
                            'phy': 'Department of Physics',
                            'bsbme': 'Department of Biosciences and Biomedical Engineering',
                            'chem': 'Department of Chemistry',
                            'MT': 'Department of Mechatronics',
                            'la': 'Department of Liberal Arts',
                            'math': 'Department of Mathematics',
                        }
                        department = dept_map.get(dept_code.lower(), f"Department of {dept_code}")
                    
                    # Handle discipline pages
                    disc_match = re.search(r'disc_(\w+)', url)
                    if disc_match:
                        disc_code = disc_match.group(1)
                        disc_map = {
                            'cse': 'Department of Computer Science and Engineering',
                            'ee': 'Department of Electrical Engineering',
                            'me': 'Department of Mechanical Engineering',
                            'ece': 'Department of Electronics and Communication Engineering',
                            'msme': 'Department of Materials Science and Metallurgical Engineering',
                            'phy': 'Department of Physics',
                            'bsbme': 'Department of Biosciences and Biomedical Engineering',
                            'chem': 'Department of Chemistry',
                            'MT': 'Department of Mechatronics',
                            'la': 'Department of Liberal Arts',
                            'math': 'Department of Mathematics',
                        }
                        department = disc_map.get(disc_code, f"Discipline of {disc_code}")
            
            # Find all professor rows
            rows = soup.select('div.row > div.col-md-12.col-sm-12.col-xs-12')
            base_url = url.split('index.php')[0] if 'index.php' in url else url
            
            professors_count = 0
            for row in rows:
                professor = {}
                
                # Find the professor details container
                details_container = row.select_one('div.col-md-8.col-sm-10.col-xs-10')
                if not details_container:
                    continue
                
                # Extract name
                name_elem = details_container.select_one('h7')
                if name_elem:
                    professor['name'] = self_clean_text(name_elem.text)
                else:
                    continue  # Skip if no name found
                
                # Extract education and post
                education_post = details_container.select('h8')
                if education_post:
                    # Process each h8 element to check if it contains a <br> tag
                    for h8 in education_post:
                        h8_html = str(h8)
                        # Check if this h8 contains both education and post separated by <br>
                        if '<br/>' in h8_html or '<br>' in h8_html:
                            # Split by <br> tags
                            parts = h8.decode_contents().split('<br>')
                            if parts and len(parts) >= 2:
                                # First part is education, second is post
                                professor['education'] = self_clean_text(parts[0])
                                professor['post'] = self_clean_text(parts[1])
                            break
                    else:
                        # If no h8 with <br> was found, fall back to the original logic
                        professor['education'] = self_clean_text(education_post[0].text) if len(education_post) > 0 else ""
                        professor['post'] = self_clean_text(education_post[1].text) if len(education_post) > 1 else ""
                
                # Extract email
                email_elem = details_container.select_one('a.click')
                if email_elem:
                    email_text = self_clean_text(email_elem.text)
                    # Replace [at] with @
                    professor['email'] = email_text.replace('[at]', '@')
                
                # Extract research interests
                interests_container = details_container.select_one('div.col-md-6 p')
                if interests_container:
                    # Get the HTML content to handle <br> tags properly
                    interests_html = interests_container.decode_contents()
                    # Replace <br> tags with commas
                    interests_html = re.sub(r'<br\s*/?>', ', ', interests_html)
                    # Now get the text content
                    interests_text = BeautifulSoup(interests_html, 'html.parser').get_text()
                    interests_text = self_clean_text(interests_text)
                    # Remove "Read More" part
                    interests_text = re.sub(r'Read\s+More', '', interests_text)
                    # Split by commas or other separators
                    interests = re.split(r'[,]+', interests_text)
                    # Clean up the interests
                    professor['research_interests'] = [self_clean_text(interest) for interest in interests if self_clean_text(interest)]
                else:
                    professor['research_interests'] = []
                
                # Extract personal website from "Read More" link
                website_link = details_container.select_one('a:-soup-contains("Read More")')
                if website_link:
                    relative_url = website_link.get('href')
                    professor['website'] = urljoin(base_url, relative_url)
                else:
                    professor['website'] = ""
                
                # Extract avatar URL
                avatar_container = row.select_one('div.box > div.icon > div.image')
                if avatar_container:
                    style = avatar_container.get('style', '')
                    url_match = re.search(r'url\((.*?)\)', style)
                    if url_match:
                        avatar_url = url_match.group(1).strip('\'"./')
                        professor['avatar_url'] = urljoin(base_url, avatar_url)
                    else:
                        professor['avatar_url'] = ""
                else:
                    professor['avatar_url'] = ""
                
                # Set department
                professor['department'] = self_clean_text(department) if department else ""
                
                all_professors.append(professor)
                professors_count += 1
                
            print(f"Successfully scraped {professors_count} professors from {url}")
            
        except Exception as e:
            print(f"Error scraping {url}: {str(e)}")
    
    return all_professors

def save_to_json(professors, output_file="../public/generated/professors.json"):
    """
    Save the professors list to a JSON file
    
    Args:
        professors: List of professor objects
        output_file: Output JSON filename
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(professors, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(professors)} professors to {output_file}")

def main():
    # Suppress the InsecureRequestWarning
    warnings.filterwarnings('ignore', message='Unverified HTTPS request')
    
    # List of URLs to scrape
    urls = [
        "https://www.iitbhilai.ac.in/index.php?pid=dept_cse_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_ee_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_me_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_ece_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_msme_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_phy_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_bsbme_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_chem_people",
        "https://www.iitbhilai.ac.in/index.php?pid=disc_MT_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_liberal_people",
        "https://www.iitbhilai.ac.in/index.php?pid=dept_math_people",
        # Add more URLs as needed
    ]
    
    # Scrape professors from all URLs
    professors = scrape_professors(urls)
    
    # Save to JSON
    save_to_json(professors)
    
    print(f"Total professors scraped: {len(professors)}")

if __name__ == "__main__":
    main()