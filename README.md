# URL Shortener API

## API

1. `[POST] /urls`
    * Shorten input url
2. `[GET] /urls/{key}`
    * Redirect to original url
3. `[GET] /urls/{key}/stat`
    * Show statistics of the urls. (visit count, visit date)

> API Docs (Swagger) - `/api-docs`


## Databse Model

### urls
```sql
  url_id INT NOT NULL AUTO_INCREMENT,
  origin_url VARCHAR(500) NOT NULL,
  short_key CHAR(15) UNIQUE NOT NULL UNIQUE,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (url_id)
```

### url_logs
```sql
  id INT NOT NULL AUTO_INCREMENT,
  url_id INT,
  call_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (url_id) REFERENCES urls(url_id)
```

## API Detail

### 1. `[POST] /urls`

* Request
```json
POST
{
  "url": "https://www.naver.com/"
}
```

* Response
```json
{
  "short_url": "url-shortener.com/UQZTBM"
}
```


### 2. `[GET] /urls/{key}`

* Response
```json
Redirect to original URL
```


### 3. `[GET] /urls/{key}/stat`

* Response
```json
{
  "origin_url": "https://google.com",
  "created_date": "2020-09-06T10:39:29.000Z",
  "short_url": "domain-name/urls/1CiFQ9",
  "call_count": 2,
  "call_logs": [
    "2020-09-06T10:39:29.000Z",
    "2020-09-06T10:39:39.000Z",
    "2020-09-06T10:39:40.000Z"
  ]
}
```



