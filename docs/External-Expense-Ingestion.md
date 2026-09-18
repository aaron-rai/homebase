# External Expense Ingestion

Expenses can be added from outside the app — e.g. an iOS Shortcut triggered right after an Apple Pay purchase — by hitting the `/api/expenses/quick-add` endpoint directly. This is separate from the normal session-based API: it authenticates with a personal API token instead of a login cookie, so any external tool or service can call it without a browser session.

## 1. Get an API token

1. Open the app and go to **Settings** (avatar in the top-left corner).
2. In the **API Token** card, click **Generate Token** (or **Regenerate Token** if one already exists).
3. Copy the token immediately — it's only shown once. It's stored server-side as a hash, so it can't be retrieved again; if you lose it, generate a new one (this invalidates the old one).

Treat this token like a password — anyone with it can add expenses to your account.

## 2. Endpoint

```bash
POST /api/expenses/quick-add
```

### Headers

| Header          | Value                     |
| --------------- | ------------------------- |
| `Authorization` | `Bearer <your-api-token>` |
| `Content-Type`  | `application/json`        |

### Body

| Field           | Required | Type            | Notes                                                         |
| --------------- | -------- | --------------- | ------------------------------------------------------------- |
| `amount`        | yes      | number          | e.g. `12.50`                                                  |
| `description`   | yes      | string          | e.g. merchant name                                            |
| `categoryId`    | yes      | string          | id of an existing category (see below for how to find one)    |
| `householdName` | yes      | string          | name of a household you belong to; matched case-insensitively |
| `date`          | no       | ISO 8601 string | defaults to the current time if omitted                       |

There is no solo/no-household mode for this endpoint — every expense must be linked to a household you're a member of, since that's currently the only thing the dashboard knows how to display.

### Responses

| Status | Meaning                                                                     |
| ------ | --------------------------------------------------------------------------- |
| `201`  | Created — `{ "message": "Expense added successfully", "expenseId": "..." }` |
| `400`  | Missing `amount`, `description`, `categoryId`, or `householdName`           |
| `401`  | Missing or invalid `Authorization` bearer token                             |
| `404`  | `householdName` doesn't match a household you belong to                     |
| `500`  | Server error — check server logs                                            |

## 3. Finding a `categoryId`

This endpoint doesn't expose a way to look up categories by name — `GET /api/categories` only accepts a logged-in browser session, not a bearer token. To get an id once:

- While logged in in the browser, visit `/api/categories` directly (session cookie is sent automatically), or
- Run `npx prisma studio` and copy an id from the `categories` table.

Hardcode the id you want (e.g. "Miscellaneous") into your Shortcut/integration — categories rarely change, so this only needs to be done once per category you use.

## 4. Example request

```bash
curl -X POST https://<your-domain>/api/expenses/quick-add \
  -H "Authorization: Bearer hb_xxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12.50,
    "description": "Coffee",
    "categoryId": "cmu66exmf000dpq8jqficekko",
    "householdName": "Rai Family"
  }'
```

## 5. iOS Shortcut sketch

1. Add inputs for amount and description (via "Ask for Input" or parsed from a Share Sheet input).
2. Add a "Get Contents of URL" action:
   - Method: `POST`
   - URL: `https://<your-domain>/api/expenses/quick-add`
   - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
   - Request Body (JSON): `amount`, `description`, a fixed `categoryId`, and a fixed `householdName`
3. Add "Show Notification" to surface success/failure based on the response.

There's no OS-level hook for "Apple Pay transaction occurred" — this is triggered manually (e.g. from the Home Screen, Action Button, or a Share Sheet action right after paying), not automatically.
