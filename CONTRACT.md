# Worth-It Valuation API - CONTRACT v1 (LOCKED)

## Endpoint
POST /api/valuation

## Request (JSON)
{
  "title": "string",
  "description": "string"
}

### Rules
- At least one of title or description MUST be non-empty
- Unknown fields are ignored
- UTF-8 JSON only

## Response - Success (200)
{
  "status": "OK",
  "value": number
}

### Semantics
- value is a numeric estimate derived from sold comps
- Units are USD
- Value MAY be 0 if no comps are found

## Response - Error (500)
{
  "status": "ERROR"
}

### Error Rules
- No partial success
- No error codes in v1
- Errors are opaque by design

## Stability Guarantees
- Field names are frozen
- Types are frozen
- Endpoint path is frozen
- Backward-incompatible changes require CONTRACT v2

## Versioning
- Current: v1
- Date Locked: 2026-02-06
