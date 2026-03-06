# yamory API Specification（v1 MCPサーバーで使用）

## 共通仕様

### ベースURL
```
https://yamoryapi.yamory.io
```

### 認証
```
Authorization: token {API_ACCESS_TOKEN}
Accept: application/json
```

### レート制限
- 上限: 5,000回/時間
- レスポンスヘッダ: `x-ratelimit-limit`, `x-ratelimit-remaining`

### 共通ステータスコード

| Code | 内容 |
|------|------|
| 200 | 正常（0件でも200） |
| 400 | 不正なリクエスト |
| 401 | 認証エラー（トークン不正） |
| 403 | IPアドレス制限 |
| 404 | リソースなし |
| 500 | サーバーエラー |

### 共通レスポンスヘッダ（ページング）
```
pageSize: integer       // 1ページあたりの件数
totalElements: integer  // 総件数
totalPages: integer     // 総ページ数
pageNumber: integer     // 現在のページ番号（0始まり）
```

### 共通クエリパラメータ注意事項
- 条件指定は全て省略可能（省略時は全件対象）
- 値を空にするとエラー（`triageLevel=immediate` ○ / `triageLevel=` ×）

---

## 1. アプリライブラリの脆弱性情報一覧

`GET /v1/app-vulns`

### クエリパラメータ

| パラメータ | 型 | 内容 |
|-----------|-----|------|
| keyword | string | プロジェクトグループ、プロジェクト名、グループID、アーティファクトID、バージョン、脆弱性ID、概要に部分一致 |
| triageLevel | string | `immediate`, `delayed`, `minor`, `none`（カンマ区切り複数可） |
| status | string | `open`, `in_progress`, `wont_fix_closed`, `not_vuln_closed`, `closed`（カンマ区切り複数可） |
| includeKev | boolean | CISA KEV該当のみ |
| includePoc | boolean | PoC存在のみ |
| cvssScore | string | 指定値以上（0〜10.0） |
| vulnType | string | `XSS`, `TRAVERSAL`, `SSRF`, `SQLI`, `RFI`, `RCE`, `LFI`, `LEAK`, `DOS`, `CSRF`, `CE`, `BYPASS`, `AUTHBYPASS`, `EXPOSURE`, `PRIVILEGE`, `XXE`, `SYMLINK`, `MITM`, `MALICIOUS` |
| openTimestamp | datetime | 指定日時以降に検出。`YYYY-MM-DD` or `YYYY-MM-DDThh:mm:ssZ`（UTC） |
| page | integer | ページ番号（0始まり） |
| size | integer | 1ページの件数（最大10,000） |

### レスポンス

```json
[{
  "id": "string",                  // 脆弱性ID（yamory内で一意）
  "triageLevel": "string",        // IMMEDIATE, DELAYED, MINOR, NONE
  "status": "string",             // OPEN, IN_PROGRESS, WONT_FIX_CLOSED, NOT_VULN_CLOSED, CLOSED
  "vulnTypes": "string",          // 脆弱性タイプ
  "teamName": "string",           // チーム名 ★スコープフィルタ対象
  "projectGroupKey": "string",    // リポジトリ/PJグループ名 ★スコープフィルタ対象
  "projectName": "string",        // マニフェスト/プロジェクト名
  "packageName": "string",        // ソフトウェア名
  "openSystem": true,             // 公開設定
  "hasPoc": true,                 // PoC有無
  "isKev": true,                  // CISA KEV該当
  "referenceId": "string",        // CVE-ID
  "solution": "string",           // 対応方法 ★修正に使う
  "scanTimestamp": "datetime",    // 最終スキャン日時
  "openTimestamp": "datetime",    // 検出日時
  "fixStartTimestamp": "datetime", // 対応開始日時
  "closedTimestamp": "datetime",  // 完了日時
  "yamoryVuln": "string"          // 脆弱性詳細URL
}]
```

---

## 2. コンテナイメージの脆弱性情報一覧

`GET /v1/image-vulns`

### クエリパラメータ

| パラメータ | 型 | 内容 |
|-----------|-----|------|
| keyword | string | ソフトウェア名、バージョン、CVE番号に部分一致 |
| triageLevel | string | `immediate`, `delayed`, `minor`, `none`（カンマ区切り複数可） |
| status | string | `open`, `in_progress`, `wont_fix_closed`, `not_vuln_closed`, `closed`（カンマ区切り複数可） |
| yamoryTags | string | 管理タグ（カンマ区切り複数可）※アプリにはないパラメータ |
| includeKev | boolean | CISA KEV該当のみ |
| includePoc | boolean | PoC存在のみ |
| cvssScore | string | 指定値以上（0〜10.0） |
| vulnType | string | アプリと同じ値 |
| openTimestamp | datetime | 指定日時以降に検出 |
| page | integer | ページ番号（0始まり） |
| size | integer | 1ページの件数（最大10,000） |

### レスポンス

```json
[{
  "id": "string",                  // 脆弱性ID（yamory内で一意）
  "triageLevel": "string",        // Immediate, Delayed, Minor, None ※大文字小文字がアプリと異なる
  "status": "string",             // OPEN, IN_PROGRESS, etc.
  "vulnTypes": "string",          // 脆弱性タイプ
  "teamName": "string",           // チーム名 ★スコープフィルタ対象
  "osFamilyAndVer": "string",     // OSバージョン（例: "Debian 10.9"）
  "family": "string",             // OSファミリー（例: "Debian"）
  "imageTitle": "string",         // イメージタイトル
  "imageName": "string",          // イメージ名（例: "debian:10.9"）
  "packageNameAndVer": "string",  // ソフトウェア名+バージョン
  "imageTags": ["string"],        // 管理タグ
  "openSystem": true,             // 公開設定
  "hasPoc": true,                 // PoC有無
  "isKev": true,                  // CISA KEV該当
  "solution": "string",           // 対応方法 ★修正に使う
  "ovalTitle": "string",          // OVALタイトル（CVE情報含む）
  "advisorySeverity": "string",   // アドバイザリ危険度
  "definitionId": "string",       // definition ID
  "fixedVersion": "string",       // 修正バージョン ★修正に使う
  "firstScanDateTime": "datetime",// 初回スキャン日時
  "scanTimestamp": "datetime",    // 最終スキャン日時
  "openTimestamp": "datetime",    // 検出日時
  "closedTimestamp": "datetime",  // 完了日時
  "yamoryVuln": "string"          // 脆弱性詳細URL
}]
```

---

## 3. ホストの脆弱性情報一覧

`GET /v1/host-vulns`

### クエリパラメータ

| パラメータ | 型 | 内容 |
|-----------|-----|------|
| keyword | string | ソフトウェア名、バージョン、ホスト名に部分一致 |
| triageLevel | string | `immediate`, `delayed`, `minor`, `none`（カンマ区切り複数可） |
| status | string | `open`, `in_progress`, `wont_fix_closed`, `not_vuln_closed`, `closed`（カンマ区切り複数可） |
| yamoryTags | string | タグ（カンマ区切り複数可） |
| includeKev | boolean | CISA KEV該当のみ |
| includePoc | boolean | PoC存在のみ |
| cvssScore | string | 指定値以上（0〜10.0） |
| vulnType | string | アプリ・コンテナと同じ値 |
| openTimestamp | datetime | 指定日時以降に検出 |
| page | integer | ページ番号（0始まり） |
| size | integer | 1ページの件数（最大10,000） |

### レスポンス

```json
[{
  "id": "string",                  // 脆弱性ID（yamory内で一意）
  "triageLevel": "string",        // IMMEDIATE, DELAYED, MINOR, NONE
  "teamName": "string",           // チーム名 ★スコープフィルタ対象
  "status": "string",             // OPEN, IN_PROGRESS, etc.
  "vulnTypes": "string",          // 脆弱性タイプ
  "hostTitle": "string",          // ホストタイトル
  "hostName": "string",           // ホスト名
  "hostIps": ["string"],          // IPアドレス
  "hostTags": ["string"],         // ホストタグ
  "family": "string",             // OSファミリー（例: "Ubuntu"）
  "osFamilyAndVer": "string",     // OSバージョン（例: "Ubuntu 14.04"）
  "packageNameAndVer": "string",  // ソフトウェア名+バージョン
  "openSystem": true,             // 公開設定
  "hasPoc": true,                 // PoC有無
  "isKev": true,                  // CISA KEV該当
  "solution": "string",           // 対応方法 ★修正に使う
  "fixedVersion": "string",       // 修正バージョン ★修正に使う
  "ovalTitle": "string",          // OVALタイトル（CVE情報含む）
  "advisorySeverity": "string",   // アドバイザリ危険度（例: "High"）
  "definitionId": "string",       // definition ID
  "scanTimestamp": "datetime",    // 最終スキャン日時
  "openTimestamp": "datetime",    // 検出日時
  "closedTimestamp": "datetime",  // 完了日時
  "yamoryVuln": "string"          // 脆弱性詳細URL
}]
```

---

## アプリ vs コンテナ vs ホスト 差分まとめ

| 項目 | アプリ (`/v1/app-vulns`) | コンテナ (`/v1/image-vulns`) | ホスト (`/v1/host-vulns`) |
|------|------------------------|---------------------------|--------------------------|
| keyword対象 | PJグループ、PJ名、グループID等 | ソフトウェア名、バージョン、CVE番号 | ソフトウェア名、バージョン、ホスト名 |
| 固有パラメータ | — | `yamoryTags` | `yamoryTags` |
| スコープフィルタキー | `teamName` + `projectGroupKey` | `teamName` のみ | `teamName` のみ |
| パッケージ名 | `packageName` | `packageNameAndVer`（バージョン含む） | `packageNameAndVer`（バージョン含む） |
| 修正バージョン | `solution` に含まれる | `fixedVersion` フィールドあり | `fixedVersion` フィールドあり |
| CVE-ID | `referenceId` | `ovalTitle` に含まれる | `ovalTitle` に含まれる |
| triageLevelの大文字小文字 | `IMMEDIATE` | `Immediate` | `IMMEDIATE` |
| 固有情報 | `projectGroupKey`, `projectName` | `imageName`, `imageTitle`, `osFamilyAndVer`, `family` | `hostName`, `hostTitle`, `hostIps`, `hostTags`, `osFamilyAndVer`, `family` |