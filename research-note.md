# Research Note

## Topic

Using Local Storage for Client Management in Vanilla JavaScript.

---

## Purpose

Before implementing the CRM application, research was conducted to understand how Local Storage can be used to persist application data without a backend.

---

## Findings

Local Storage stores data as key-value pairs in the browser.

Objects and arrays must be converted to JSON using JSON.stringify() before saving.

Saved data can be restored using JSON.parse().

Local Storage keeps data after page refresh or browser restart until it is manually removed.

It is suitable for small projects and prototypes but should not be used for sensitive information such as passwords in production applications.

---

## Application in this Project

The project uses Local Storage to store:

- Registered users
- Active session
- Clients
- Theme preference

This allows the CRM to preserve user data between page reloads without requiring a database.

---

## Sources

- MDN Web Docs — Local Storage
- MDN Web Docs — Fetch API
- DummyJSON API Documentation