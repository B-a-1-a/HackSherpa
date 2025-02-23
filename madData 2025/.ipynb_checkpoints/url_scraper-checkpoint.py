import requests
from bs4 import BeautifulSoup
import pandas as pd

# Base URL for pagination
BASE_URL = "https://devpost.com/software/popular?page={}"
MAX_PAGES = 5

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_project_links():
    """Iterates through up to MAX_PAGES and collects all unique project links."""
    project_links = set()  # Using a set to prevent duplicates
    
    for page in range(1, MAX_PAGES + 1): 
        url = BASE_URL.format(page)
        print(f"Scraping: {url}")
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            print("Error fetching page or no more pages available.")
            break

        soup = BeautifulSoup(response.text, 'html.parser')
        projects = soup.select("a.block-wrapper-link.fade.link-to-software")

        if not projects:
            print("No more projects found, stopping.")
            break

        # Extract project links and ensure uniqueness
        for project in projects:
            project_links.add(project["href"])

    return list(project_links)  # Convert set back to list for further processing

def save_links_to_csv(links, filename="project_links.csv"):
    """Saves project links to a CSV file."""
    df = pd.DataFrame(links, columns=["Project URL"])
    df.to_csv(filename, index=False)
    print(f"Saved {len(links)} project links to {filename}")

# Extract all unique project links
all_project_links = get_project_links()
print(f"Total Unique Projects Found: {len(all_project_links)}")

# Save to CSV
save_links_to_csv(all_project_links)
