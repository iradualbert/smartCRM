# Quote Request API

POST /quote-requests/

## Payload
{
  "token": "ORG_TOKEN",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "items": [{ "product_id": "123", "quantity": 10 }],
  "message": "Requesting pricing"
}

## Purpose
Allow external systems to create quote requests.
