# Authentication

# Authentication

Every request (except the internal PSP webhook endpoint) must include HTTP **Basic Auth**:

| Credential | Type | Example |
|---|---|---|
| Username | Store **API Key** — an unsigned integer | `100042` |
| Password | Store **API Secret** — as UUID as example  | `550e8400-e29b-41d4-a716-446655440000` |

Find these in the Merchant Portal under **Store → API Settings**.

## Examples

### curl

```bash
curl https://api.elpay.online/int/assets \
  -u "100042:550e8400-e29b-41d4-a716-446655440000"
```

### Python

```python
import httpx

API_KEY    = "100042"
API_SECRET = "550e8400-e29b-41d4-a716-446655440000"

client = httpx.Client(auth=(API_KEY, API_SECRET))
response = client.get("https://api.elpay.online/int/assets")
```

### Go

```go
const (
    apiKey    = "100042"
    apiSecret = "550e8400-e29b-41d4-a716-446655440000"
)

req, _ := http.NewRequest("GET", "https://api.elpay.online/int/assets", nil)
req.SetBasicAuth(apiKey, apiSecret)
```

### JavaScript (fetch)

```js
const API_KEY    = "100042";
const API_SECRET = "550e8400-e29b-41d4-a716-446655440000";

const credentials = btoa(`${API_KEY}:${API_SECRET}`);

const res = await fetch("https://api.elpay.online/int/assets", {
  headers: { Authorization: `Basic ${credentials}` },
});
```

## Security

> **Keep your API Secret private.** Treat it like a password — never expose it in
> client-side code, mobile apps, or public repositories.

- Rotate your API Secret in the Merchant Portal if you suspect it has been leaked.
- Each Store has its own API Key / Secret pair. Payments created with a key are
  associated with that store.
- Credentials are validated on every request. A wrong or missing secret returns
  **HTTP 401**.

