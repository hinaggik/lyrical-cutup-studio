import sqlite3
import os
import re
from pathlib import Path

def extract_phrases(text: str) -> list:
    """Extract phrases from lyrics text using the same logic as the original"""
    # 改行を空白に変換
    text = re.sub(r'\n+', ' ', text)
    # 句読点を除去
    text = re.sub(r'[。！？、，]', '', text)
    
    words = []
    
    # 日本語の単語境界で分割
    # ひらがな、カタカナ、漢字、英数字の境界を検出
    pattern = r'([ひ-ゟ]+|[ァ-ヿ]+|[一-龯]+|[a-zA-Z0-9]+)'
    matches = re.findall(pattern, text)
    
    for match in matches:
        word = match.strip()
        if len(word) > 0:
            # 助詞の分離
            if len(word) > 1 and word[-1] in 'はがをにでとからまでより':
                if len(word) > 2:
                    words.append(word[:-1])  # 助詞を除いた部分
                words.append(word[-1])      # 助詞
            else:
                words.append(word)
    
    # 空文字列と1文字未満を除外（ただし意味のある1文字は保持）
    filtered_words = []
    for word in words:
        if len(word) > 0 and (len(word) > 1 or word in 'はがをにでとからまでより愛心夢光闇'):
            filtered_words.append(word)
    
    return filtered_words

def build_database():
    """Build the pre-populated database from lyrics files"""
    # データベース作成
    conn = sqlite3.connect('lyrics.db')
    cursor = conn.cursor()
    
    # テーブル作成
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lyrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phrase TEXT NOT NULL,
            part_of_speech TEXT,
            lyrics_id INTEGER,
            FOREIGN KEY (lyrics_id) REFERENCES lyrics (id)
        )
    ''')
    
    # 既存データをクリア
    cursor.execute('DELETE FROM phrases')
    cursor.execute('DELETE FROM lyrics')
    
    # lyrics フォルダから全ファイルを処理
    lyrics_dir = Path('../../lyrics-cutup-generator/lyrics')
    
    if not lyrics_dir.exists():
        print(f"Error: {lyrics_dir} not found")
        return
    
    processed_count = 0
    total_phrases = 0
    
    for txt_file in sorted(lyrics_dir.glob('*.txt')):
        try:
            # ファイル読み込み
            with open(txt_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # データベースに歌詞を保存
            cursor.execute(
                "INSERT INTO lyrics (filename, content) VALUES (?, ?)",
                (txt_file.name, content)
            )
            lyrics_id = cursor.lastrowid
            
            # フレーズ抽出
            phrases = extract_phrases(content)
            
            # フレーズをデータベースに保存
            for phrase in phrases:
                cursor.execute(
                    "INSERT INTO phrases (phrase, lyrics_id) VALUES (?, ?)",
                    (phrase, lyrics_id)
                )
            
            processed_count += 1
            total_phrases += len(phrases)
            print(f"Processed: {txt_file.name} ({len(phrases)} phrases)")
            
        except Exception as e:
            print(f"Error processing {txt_file.name}: {e}")
    
    # コミット
    conn.commit()
    conn.close()
    
    print(f"\nDatabase built successfully!")
    print(f"Files processed: {processed_count}")
    print(f"Total phrases: {total_phrases}")
    print(f"Database saved as: lyrics.db")

if __name__ == "__main__":
    build_database()
