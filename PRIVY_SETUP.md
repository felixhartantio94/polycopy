# Privy Wallet Integration with Server-Side Access

This project integrates Privy wallets with server-side access capabilities, following the [official Privy documentation](https://docs.privy.io/recipes/wallets/session-signer-use-cases/server-side-access). This allows your application to execute transactions on behalf of users even when they're offline.

## Setup Instructions

### 1. Get Privy Credentials

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select an existing one
3. Copy your **App ID** and **App Secret**

### 2. Enable Session Signers in Privy Dashboard

1. Navigate to **User Management > Authentication** in your Privy Dashboard
2. Under the **Advanced** tab, toggle on the **Server-side access** setting
3. Enable the **Require signed requests** setting
4. A modal will display a **Signing key** - copy and securely store this value (this is your Authorization Key private key)
5. Note the **Key Quorum ID** (also called Authorization Key ID) - you'll need this for `NEXT_PUBLIC_PRIVY_AUTHORIZATION_ID`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here

# Authorization Key ID (Key Quorum ID) from Privy Dashboard
# This is the signerId that will be used to grant server-side access
NEXT_PUBLIC_PRIVY_AUTHORIZATION_ID=your_authorization_key_id_here

# Authorization Key Private Key (store this securely, never commit to git)
# This is used to sign requests when executing transactions server-side
PRIVY_AUTHORIZATION_PRIVATE_KEY=your_authorization_key_private_key_here

# Node Environment
NODE_ENV=development
```

**Important:** 
- Never commit `.env.local` to version control
- The Authorization Key private key should be stored securely and encrypted in production
- The `.env.example` file is provided as a template

### 3. Database Setup (Required for Production)

You need to store signer information securely in your database. The signer's private key must be encrypted before storage.

Example schema:
```sql
CREATE TABLE signers (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  signer_id VARCHAR(255) NOT NULL UNIQUE,
  private_key_encrypted TEXT NOT NULL,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_wallet_address (wallet_address)
);
```

## How It Works

Following the [Privy server-side access guide](https://docs.privy.io/recipes/wallets/session-signer-use-cases/server-side-access):

### Client-Side Flow

1. **User Connects Wallet**: User clicks "Connect Wallet" in the navbar
2. **Enable Server Access**: User clicks "Enable Server Access" button
3. **Add Signer to Wallet**: The app uses `addSigners` to add the Authorization Key (Key Quorum) to the user's wallet
4. **User Consent**: The user grants consent to allow your server to execute transactions on their behalf

### Server-Side Flow

1. **Transaction Request**: Your server receives a request to execute a transaction
2. **Sign Request**: Server uses the Authorization Key private key to sign the request
3. **Execute Transaction**: Send the signed request to Privy API to execute the transaction
4. **Transaction Executed**: Transaction is executed on the blockchain on behalf of the user

## Implementation Details

### Client-Side (`app/components/Navbar.tsx`)

The `handleEnableServerAccess` function:
- Uses the Authorization Key ID from `NEXT_PUBLIC_PRIVY_AUTHORIZATION_ID`
- Calls `addSigners` to add the signer to the user's wallet
- Grants your server permission to execute transactions on behalf of the user

### Server-Side Transaction Execution

To execute transactions server-side, you need to:
1. Sign requests using the Authorization Key private key
2. Send signed requests to Privy's API
3. Privy executes the transaction on the blockchain

See the [Privy documentation on signing requests](https://docs.privy.io/wallets/using-wallets/session-signers/use-session-signers) for details.

## API Endpoints

### POST `/api/wallet/add-signer` (Legacy - Optional)

This endpoint can be used to create user-specific signers dynamically, but the recommended approach is to use the Authorization Key method described above.

**Request:**
```json
{
  "walletAddress": "0x...",
  "accessToken": "privy_access_token"
}
```

**Response:**
```json
{
  "success": true,
  "signerId": "signer_id",
  "message": "Signer created successfully"
}
```

### POST `/api/wallet/execute`

Executes a transaction using server-side access.

**Request:**
```json
{
  "walletAddress": "0x...",
  "to": "0x...",
  "value": "0",
  "data": "0x...",
  "chainId": 1
}
```

**Response:**
```json
{
  "success": true,
  "intentId": "intent_id",
  "transactionHash": "0x...",
  "message": "Transaction executed successfully"
}
```

## Security Considerations

1. **Private Key Storage**: Always encrypt private keys before storing in the database
2. **Access Control**: Verify user authentication before creating signers
3. **Policies**: Use Privy policies to restrict what signers can do
4. **Environment Variables**: Never expose `PRIVY_APP_SECRET` to the client

## Next Steps

1. Implement database storage for signers (see TODO comments in code)
2. Add encryption/decryption for private keys
3. Configure Privy policies to restrict signer permissions
4. Add error handling and logging
5. Test with a testnet before deploying to mainnet

## Resources

- [Privy Server-Side Access Documentation](https://docs.privy.io/recipes/wallets/session-signer-use-cases/server-side-access)
- [Privy Dashboard](https://dashboard.privy.io/)
- [Privy API Reference](https://docs.privy.io/api-reference)


