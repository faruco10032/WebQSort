# Web Q-Sort アプリケーション 要件定義ドラフト

対象: Claude Code（フロントエンド Web アプリ開発支援）
作成日: 2026-04-15
起案: 亀岡嵩幸（九州大学）
関連プロジェクト: `CiNet_Voicefeedback_identity`（声質変化と自己変容の研究）

---

## 1. 背景と目的

RAP（Riverside Accuracy Project, UC Riverside）が提供する Q-sorter プログラムは、.NET Framework 1.1（2003年リリース、サポート終了）に依存し、Windows XP 前提の古いデスクトップアプリである。現行の Windows 10/11 環境では動作保証が無く、研究機関のセキュリティポリシー上の懸念もある。

本研究（被験者 10~20 名 × 2 条件 × RSQ/RBQ 2 尺度 = 40 ~ 80）を安定して実施するため、**ブラウザベースで動作する Q-Sort 用 Web アプリ**を自前実装する。既存ツール（Easy-HtmlQ, QMethod Software 等）を参考にしつつ、本実験の条件管理・データ出力要件に合わせて最適化する。

既存オープンソース実装（参考）:

- Easy-HtmlQ（MIT, Shawn Banasick）: https://github.com/shawnbanasick/easy-htmlq
- HtmlQ（aproxima）: https://github.com/aproxima/htmlq

## 2. スコープ

### 含む

- デスクトップ/タブレットブラウザ（Chrome, Edge, Firefox, Safari最新版）で動作する単一ページ Web アプリ
- 番号（TRB）設問文　フォーマット（.txt）のデッキファイルのインポート
- 被験者・セッション情報の入力
- RAP プログラム同様の 2 段階ソート手順（3 パイル予備 → 9 パイル最終）
- 結果の 互換形式（.txt）および拡張 CSV/JSON での出力
- ローカル完結型（サーバー不要、静的ホスティング可）

### できれば含む

- 因子分析等の統計処理（KADE/PQMethod と連携）
- 多言語UI（日本語+英語のみ）

### 含まない（今回は対象外）

- サーバーサイドでの参加者管理（将来拡張）
- 因子分析等の統計処理（KADE/PQMethod と連携）
- モバイル（スマホ）最適化（タブレット以上を想定）

## 3. 機能要件

### 3.1 デッキ管理

#### 3.1.1 テキストファイルのインポート

既存の `RSQ3-15_ja` （"C:\Users\kameoka\Dropbox\Reserch\project\CiNet_Voicefeedback_identity\Q-SORT_UI\QuestionnaireText\RSQ3-15_ja.txt"）をそのままアップロード可能とする。

#### 3.1.2 デッキのプリセット同梱

ビルド時に `public/decks/` に RSQ3-15 / RBQ3-11 / CAQ を同梱し、起動時にドロップダウンから選択可能とする。

### 3.2 被験者・セッション情報入力

セッション開始画面で以下を入力させる。全項目を `session_metadata` として出力ファイルに含める。


| 項目                     | 必須 | 形式         | 備考                                                                         |
| -------------------------- | ------ | -------------- | ------------------------------------------------------------------------------ |
| Target ID                | 必須 | 文字列       | 例`S01`。ユーザー自由入力だが、バリデーション（英数字とアンダースコアのみ）  |
| Rater ID                 | 必須 | 文字列       | 例`R01` または `self`                                                        |
| 被験者名（参考）         | 任意 | 文字列       | 出力ファイルには**含めない**。画面表示とローカル保存のみ（プライバシー配慮） |
| 実験条件（avatar）       | 必須 | トグル       | あり / なし                                                                  |
| 実験条件（voice change） | 必須 | トグル       | あり / なし                                                                  |
| 試行回数/セッション番号  | 必須 | 整数         | 例 1〜4                                                                      |
| 使用デッキ               | 必須 | 選択         | インポート済みまたはプリセットから                                           |
| 評定モード               | 必須 | 選択         | 自己評価 / 第三者評価                                                        |
| 備考                     | 任意 | 複数行文字列 |                                                                              |

セッション開始時にタイムスタンプ（ISO8601、UTC + ローカル）を自動記録。

### 3.3 ソート操作 UI

#### 3.3.1 手順選択

- **2段階方式**: 予備 3 パイル → 最終 9 パイル

#### 3.3.2 予備分配（2段階方式時）

- 画面中央に現在の項目文を大きく表示（項目番号は末尾に小さく）
- 3 パイル（左: Uncharacteristic、中: Neutral、右: Characteristic）をドロップ領域として表示
- ドラッグ&ドロップで配置 → 次項目に自動遷移
- キーボード操作もサポート（←, ↓, → で各パイルに配置、Backspace で戻る）
- プログレスバー（何項目中何項目か）
- 一時停止・中断・再開機能（LocalStorage に自動保存、30 秒ごと）

#### 3.3.3 最終分配

- 画面上部に 9 パイル（定員表記 `3 / 3` 形式でリアルタイム表示）
- 定員超過時はパイルヘッダーを赤色表示、音声またはビジュアルフィードバック
- 定員未満のパイルは黄色表示
- 各項目は短縮表示（最初の 23 文字以降は `...`）、クリックで全文ポップアップ
- パイル内・パイル間の自由な再配置
- 項目検索機能（項目番号または部分一致）
- 全項目が正しい定員で配置されるとハイライト表示

#### 3.3.4 ビジュアル設計

- シンプル・モノトーンベース（研究用途、装飾最小）
- 画面解像度 1280×720 以上推奨、レスポンシブで 1024×768 まで対応
- ダークモード切替（任意）
- 項目文のフォントサイズは可変（アクセシビリティ）
- 仕様フォントはnoto sans jp

### 3.4 データ出力

#### 3.4.1 出力形式

以下 3 形式を並行出力可能とする。

**(A)  .txt**（既存分析コードとの互換性確保）

https://github.com/faruco10032/qsort-analysis-viewer

こちらのViewerに対応してる型

**(B) 拡張 CSV**

```csv
target_id,rater_id,deck_name,session_id,condition_avatar,condition_voice,trial,started_at,finished_at,duration_sec,item_id,item_text,pile
S01,R01,RSQ3-15,1,true,false,1,2026-05-10T10:00:00Z,2026-05-10T10:12:34Z,754,1,"Situation is potentially enjoyable.",5
...
```

**(C) JSON**（後続のプログラム処理向け）

```json
{
  "session_metadata": {
    "target_id": "S01", "rater_id": "R01",
    "deck_name": "RSQ3-15",
    "condition": {"avatar": true, "voice": false},
    "trial": 1,
    "started_at": "2026-05-10T10:00:00Z",
    "finished_at": "2026-05-10T10:12:34Z",
    "duration_sec": 754,
    "rating_mode": "self",
    "procedure": "two_stage"
  },
  "piles": [
    {"index": 1, "label": "Extremely Uncharacteristic", "capacity": 3, "items": [5, 12, 47]},
    ...
  ],
  "sort_vector": [5, 1, 5, 2, ...]
}
```

#### 3.4.2 ダウンロード

- `File > Save` でユーザーの選択で (A)(B)(C) いずれか、または全てをダウンロード
- ファイル名は自動提案（例: `S01_R01_RSQ3-15_T1_20260510.txt`）
- 複数セッション分をまとめて ZIP ダウンロードする機能（セッション履歴画面から）

#### 3.4.3 セッション操作ログ

研究再現性のため、以下を CSV で付属出力（オプション）。

- 各項目の予備パイル配置時刻、最終パイル配置時刻
- 配置変更の履歴（何番目のアイテムを何回動かしたか）
- 全項目の総ソート時間

### 3.5 セッション管理

- **LocalStorage** に進行中のセッションを自動保存（タブを閉じても再開可能）
- 完了セッションの一覧表示（タブ内セッション履歴）
- 履歴からの CSV/JSON 一括エクスポート
- 履歴の手動削除機能（プライバシー）

### 3.6 バリデーション

- 保存時: 全項目配置済み、全パイルが定員通り、Target/Rater ID 入力済み、の 3 条件を満たすまで保存不可
- 未完了時の警告ダイアログ
- 項目数とパイル定員合計の不一致を読み込み時点で検出し、エラー表示

## 4. 非機能要件

### 4.1 技術スタック（推奨）

- フロントエンド: React 18+ with TypeScript
- 状態管理: Zustand または Jotai（軽量）
- ビルド: Vite
- スタイル: Tailwind CSS（研究用途のため最小構成）
- ドラッグ&ドロップ: `@dnd-kit/core`（アクセシブル、タッチ対応）
- テスト: Vitest + React Testing Library
- E2E: Playwright（任意）

### 4.2 デプロイ

- 完全静的サイト（GitHub Pages, Netlify, ローカル `npx serve` 全て可）
- **オフライン動作**: PWA 化してインターネット無しでも実験実施可能（NICT内ネットワーク制約想定）
- ビルド成果物サイズ < 5MB

### 4.3 パフォーマンス

- 100 項目程度のデッキで 60 FPS を維持
- 初回ロード時間 < 2 秒（キャッシュあり）
- LocalStorage 使用量 < 5MB

### 4.4 ブラウザ対応

- Chrome / Edge / Firefox / Safari の最新 2 バージョン
- IE / 旧 Edge は対応しない

### 4.5 アクセシビリティ

- WCAG 2.1 AA 準拠を目標
- キーボードのみで全操作可能
- スクリーンリーダー対応（ARIA 属性適切に付与）

### 4.6 言語

- UI は日本語デフォルト、英語切替可
- デッキ内容は原文のまま表示（項目文は英語のものを英語のまま、日本語版デッキは日本語のまま）

## 5. ディレクトリ構成（提案）

```
WebQSort/
├── public/
│   ├── decks/
│   │   ├── RSQ3-15.txt
│   │   ├── RBQ3-11.txt
│   │   └── CAQ_Deck.txt
│   └── manifest.json (PWA)
├── src/
│   ├── components/
│   │   ├── SessionSetup.tsx
│   │   ├── DeckLoader.tsx
│   │   ├── PreliminarySort.tsx
│   │   ├── FinalSort.tsx
│   │   ├── Pile.tsx
│   │   ├── Item.tsx
│   │   └── ExportDialog.tsx
│   ├── hooks/
│   │   ├── useSortStore.ts
│   │   └── useLocalPersistence.ts
│   ├── lib/
│   │   ├── rapParser.ts
│   │   ├── rapExporter.ts
│   │   ├── csvExporter.ts
│   │   └── validation.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── tests/
│   ├── rapParser.test.ts
│   └── ...
├── docs/
│   ├── user_manual_ja.md
│   └── deck_format.md
├── package.json
├── vite.config.ts
└── README.md
```

## 6. 開発タスク（Claude Code への指示順）

1. Vite + React + TypeScript プロジェクト初期化、Tailwind、@dnd-kit 導入
2. `rapParser.ts` 実装とユニットテスト（RSQ3-15, RBQ3-11, CAQ_Deck を正しくパースできること、壊れた入力を検出できること）
3. `rapExporter.ts` 実装（元ファイルと往復可能なこと）
4. 型定義とストア設計（Zustand）
5. SessionSetup 画面実装（メタデータ入力）
6. DeckLoader 画面実装（ファイル選択、プリセット選択）
7. PreliminarySort 画面実装（3パイル、ドラッグ&ドロップ）
8. FinalSort 画面実装（9パイル、定員制約、再配置）
9. ExportDialog（.txt / .csv / .json 出力）
10. LocalStorage 永続化とセッション履歴
11. PWA 化（Service Worker、manifest）
12. 最小限のE2Eテスト（1セッション完遂）
13. ユーザーマニュアル（日本語）作成

## 7. 成果物

- `WebQSort/` 配下の完全な Vite プロジェクト
- GitHub Pages または Netlify にデプロイ可能な静的ビルド成果物
- ユーザーマニュアル（日本語 Markdown）
- テストスイート

## 8. 品質基準

- RAP `Q_Sort.msi` で生成したサンプル `SO1_R1_test.txt` と本ツールで生成したファイルが**ソート結果として一致可能**なこと（読み込み → 同じ配置 → 書き出しで bit 単位または意味論的に一致）
- 既存データ資産との互換性を損なわないこと
- ユニットテストカバレッジ 70% 以上（ロジック層）

## 9. 参考仕様

- Qsorter_instr.pdf（RAP 付属、プロジェクト内にあり）
- RSQ 3.15 / RBQ 3.11 のパイル定員仕様
  - RSQ3-15: `3, 6, 11, 15, 19, 15, 11, 6, 3` (計 89)
  - RBQ3-11: `3, 5, 7, 11, 16, 11, 7, 5, 3` (計 68)
  - CAQ: `5, 8, 12, 16, 18, 16, 12, 8, 5` (計 100)

## 10. 未決事項

- 複数評定者による同一被験者評価時の評定者間信頼性計算を本ツール内で行うか、KADE等の外部ツールに委ねるか
- VRChat ワールドからの結果送信連携（将来）の有無
- 実験終了後の集計ダッシュボードの要否

---

以上。
