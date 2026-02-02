# ShortyPro Mobile App

Mobile companion app for ShortyPro.com - Your all-in-one marketing platform.

## Features

### Dashboard
The main hub showing quick stats and access to all ShortyPro tools.

### Shorty Magic
AI-powered video creation tool. Create stunning short-form videos with:
- Multiple video styles (Product, Testimonial, Tutorial, Promo)
- AI script generation
- Video processing status tracking

### Chatterly
AI chat assistant for:
- Content creation
- Marketing strategy
- Customer response templates
- Business guidance

### Magna Hive
Funnel builder for high-converting landing pages:
- Pre-built templates
- Visitor and conversion tracking
- Draft, Published, and Archived states

### Connectify
CRM to manage customer relationships:
- Contact management with lead/prospect/customer status
- Search and filter contacts
- Company and contact details

### Analytics
Cross-platform social media analytics dashboard:
- Track metrics across all connected social accounts
- View total followers, engagement, impressions, and clicks
- Platform-specific analytics with weekly trend charts
- Engagement breakdown (likes, comments, shares)

### Connect Accounts
Social media account integration hub:
- Connect 15+ social platforms (Google, Facebook, TikTok, Instagram, YouTube, X/Twitter, LinkedIn, Threads, Pinterest, Snapchat, Reddit, Twitch, Discord, WhatsApp, Telegram)
- Secure OAuth-style connection flow
- Manage and disconnect accounts
- Real-time connection status tracking

## Backend Connection

The app connects to ShortyPro.com backend via REST API:
- Base URL: `https://shortypro.com`
- Authentication: Bearer token
- Endpoints defined in `src/lib/api.ts`

## App Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── analytics.tsx  # Social media analytics
│   │   ├── connect.tsx    # Connect social accounts
│   │   └── profile.tsx    # User profile
│   ├── login.tsx          # Authentication
│   ├── shorty-magic.tsx   # Video creation
│   ├── chatterly.tsx      # AI chat
│   ├── magna-hive.tsx     # Funnel builder
│   └── connectify.tsx     # CRM
├── components/            # Reusable UI components
└── lib/
    ├── api.ts             # ShortyPro API service
    └── state/
        ├── auth-store.ts           # Authentication state
        └── social-accounts-store.ts # Social accounts & analytics state
```
