# Bolexa Web

Bolexa Web is the Angular MVP for a dark-mode-first ticketing platform focused on Venezuela. It includes consumer ticket purchase, organizer event management, and scanner/check-in demo flows backed by a persisted mock database.

## Stack

- Angular `21.2.x`
- Tailwind CSS plus daisyUI custom `bolexa` theme
- Vitest through Angular CLI
- Mock repositories backed by `localStorage`

## Commands

```bash
npm start
npm run build
npm test
npm run format
npm run format:check
```

## Demo Roles

Use the role switcher in the header.

- Consumer: `Andrea Perez`
- Organizer: `Producciones Avila`
- Scanner: `Carlos Entrada`

Organizer and scanner routes are protected by demo role guards. Switch roles before opening those sections.

## Key Routes

- `/` marketplace home
- `/events` event list
- `/events/caracas-music-fest` event detail
- `/checkout/event-caracas-music-fest` checkout
- `/my-tickets` consumer tickets
- `/organizer/dashboard` organizer dashboard
- `/organizer/events` organizer events
- `/scan/events` scanner event selector
- `/scan/events/event-caracas-music-fest/scanner?qr=BLX-CMF-GEN-1001` scanner with sample QR

## Demo Happy Path

Use the `Demo` dropdown in the app header to keep the walkthrough deterministic.

1. Click `Reset demo data` to restore seeded data and switch back to the consumer user.
2. Open `Comprar ticket` and buy one General ticket for Caracas Music Fest.
3. Open `Mis tickets` to show the issued QR tickets.
4. Open `Scanner con QR` or copy `BLX-CMF-GEN-1001` from the demo dropdown.
5. Validate the QR, then mark entry to show duplicate-prevention behavior.
6. Open `Dashboard` to review organizer metrics.

## Mock Data

The demo store is persisted in `localStorage` under `bolexa.mock-db.v1`. Use `Reset demo data` whenever a walkthrough needs a clean seed state.

Sample QR: `BLX-CMF-GEN-1001`.

## Documentation

- Frontend tickets: `../docs/frontend-tickets.md`
- BFF tickets: `../docs/bff-tickets.md`
- Design system notes: `../docs/opendesign-design-system.md`
