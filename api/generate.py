from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import random
import re
import os
from pathlib import Path

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            count = request_data.get('count', 50)
            if count > 100:
                count = 100
            
            # Generate cutup phrases
            phrases = generate_cutup_phrases(count)
            
            response = {
                "phrases": phrases,
                "count": len(phrases)
            }
            
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "error": f"Generation error: {str(e)}"
            }
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def get_database_path():
    """Get the path to the database file"""
    # In Vercel, the database should be in the same directory as the function
    current_dir = Path(__file__).parent
    db_path = current_dir / 'lyrics.db'
    return str(db_path)

def generate_cutup_phrases(count: int) -> list:
    """Generate cutup phrases with source information"""
    db_path = get_database_path()
    
    if not os.path.exists(db_path):
        raise Exception(f"Database not found at {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get phrases with source information
        cursor.execute("""
            SELECT p.phrase, l.filename, l.id 
            FROM phrases p 
            JOIN lyrics l ON p.lyrics_id = l.id
        """)
        phrase_data = cursor.fetchall()
        
        if len(phrase_data) < 10:
            raise Exception("Not enough phrases in database")
        
        # Generate cutup phrases with sources
        cutup_phrases = []
        
        for _ in range(count):
            # Randomly select 2-4 phrases
            num_parts = random.randint(2, 4)
            selected_data = random.sample(phrase_data, min(num_parts, len(phrase_data)))
            
            # Extract phrases and source information
            selected_phrases = [data[0] for data in selected_data]
            sources = []
            
            for data in selected_data:
                phrase, filename, lyrics_id = data
                sources.append({
                    "word": phrase,
                    "filename": filename
                })
            
            # Combine phrases grammatically
            combined_text = combine_phrases_grammatically(selected_phrases)
            
            cutup_phrases.append({
                "text": combined_text,
                "sources": sources
            })
        
        return cutup_phrases
        
    finally:
        conn.close()

def combine_phrases_grammatically(phrases: list) -> str:
    """Combine phrases with grammatical considerations"""
    result_parts = []
    
    for i, phrase in enumerate(phrases):
        # For non-final phrases, consider appropriate connections
        if i < len(phrases) - 1:
            # Add connectors if phrase doesn't end with particle
            if not re.search(r'[はがをにでと]$', phrase):
                if random.random() < 0.3:  # 30% chance to add connector
                    connectors = ['の', 'に', 'で', 'と']
                    phrase += random.choice(connectors)
        
        result_parts.append(phrase)
    
    return ''.join(result_parts)
