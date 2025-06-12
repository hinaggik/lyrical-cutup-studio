# 🎵 Lyrical Cutup Studio

30曲の歌詞から創造的なフレーズを生成するWebアプリケーション（Vercel対応版）

## ✨ 特徴

- **事前データ組み込み**: 30曲分の歌詞データを事前にデータベース化
- **サーバーレス対応**: Vercel Functions で動作
- **シンプルUI**: アップロード不要、生成ボタンのみ
- **由来表示**: 各フレーズがどの楽曲から生成されたかを表示
- **レスポンシブ**: モバイル・デスクトップ対応

## 🚀 Vercelデプロイ手順

### 1. GitHubリポジトリ作成

```bash
cd lyrical-cutup-studio
git init
git add .
git commit -m "Initial commit: Lyrical Cutup Studio for Vercel"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercelでデプロイ

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. 作成したリポジトリを選択
5. 「Deploy」をクリック

**設定は自動で認識されます：**
- Framework: Other
- Root Directory: `/` (デフォルト)
- Build Command: なし（静的ファイル + サーバーレス関数）
- Output Directory: `public`

### 3. 環境変数（不要）

このプロジェクトは環境変数の設定は不要です。

## 📁 プロジェクト構造

```
lyrical-cutup-studio/
├── api/
│   └── generate.py          # サーバーレス関数（フレーズ生成）
├── public/
│   ├── index.html          # メインページ
│   ├── style.css           # スタイルシート
│   └── script.js           # JavaScript
├── data/
│   ├── lyrics.db           # 30曲分の事前作成DB（2,180フレーズ）
│   └── build_db.py         # DB作成スクリプト
├── vercel.json             # Vercel設定
├── requirements.txt        # Python依存関係（標準ライブラリのみ）
└── README.md
```

## 🎯 使用方法

1. **フレーズ生成数を選択**（1-100）
2. **「フレーズを生成」ボタンをクリック**
3. **生成されたフレーズを確認**
   - 各フレーズをクリックでコピー
   - 「由来を表示」で元楽曲を確認
4. **「全てコピー」または「ダウンロード」で保存**

## 🔧 技術仕様

### フロントエンド
- **HTML5/CSS3/JavaScript**: 静的ファイル
- **Font Awesome**: アイコン
- **レスポンシブデザイン**: モバイル対応

### バックエンド
- **Vercel Functions**: Python 3.9
- **SQLite**: 事前作成データベース（読み込み専用）
- **標準ライブラリのみ**: 外部依存なし

### データベース
- **30楽曲**: 事前処理済み
- **2,180フレーズ**: 抽出済み
- **由来情報**: 各フレーズの元楽曲を記録

## 🛠️ ローカル開発

### データベース再構築

```bash
cd data
python build_db.py
```

### ローカルサーバー起動

```bash
# Python簡易サーバー
cd public
python -m http.server 8000

# または Node.js
npx serve public
```

### API関数テスト

Vercel CLI を使用：

```bash
npm i -g vercel
vercel dev
```

## 📊 データ統計

- **楽曲数**: 30曲
- **総フレーズ数**: 2,180個
- **平均フレーズ数/楽曲**: 約73個
- **データベースサイズ**: 約200KB

## 🌐 デプロイ後の確認

デプロイ完了後、以下を確認：

1. **メインページ**: 統計情報が正しく表示される
2. **フレーズ生成**: 正常に動作する
3. **由来表示**: ツールチップが機能する
4. **コピー機能**: クリップボードにコピーされる
5. **ダウンロード**: ファイルがダウンロードされる

## 🚨 トラブルシューティング

### よくある問題

1. **データベースが見つからない**
   - `data/lyrics.db` が存在することを確認
   - `build_db.py` を実行してデータベースを再作成

2. **API関数エラー**
   - Vercelの関数ログを確認
   - Python 3.9 対応を確認

3. **フロントエンドエラー**
   - ブラウザの開発者ツールでエラーを確認
   - CORS設定を確認

### デバッグ方法

```bash
# ローカルでAPI関数をテスト
vercel dev

# データベース内容を確認
sqlite3 data/lyrics.db
.tables
SELECT COUNT(*) FROM lyrics;
SELECT COUNT(*) FROM phrases;
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成
3. 変更をコミット
4. プルリクエストを作成

---

**🎨 創造的な表現のためのツール**
