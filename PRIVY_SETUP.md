# Privy Wallet Integration with Server-Side Access

This project integrates Privy wallets with server-side access capabilities, allowing your application to execute transactions on behalf of users even when they're offline.

## Setup Instructions

### 1. Get Privy Credentials

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select an existing one
3. Copy your **App ID** and **App Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here

# Node Environment
NODE_ENV=development
```

**Important:** Never commit `.env.local` to version control. The `.env.example` file is provided as a template.

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

### Client-Side Flow

1. **User Connects Wallet**: User clicks "Connect Wallet" in the navbar
2. **Enable Server Access**: User clicks "Enable Server Access" button
3. **Signer Creation**: The app calls `/api/wallet/add-signer` to create a signer
4. **Storage**: The signer ID and encrypted private key are stored in your database

### Server-Side Flow

1. **Transaction Request**: Your server receives a request to execute a transaction
2. **Retrieve Signer**: Server looks up the signer from the database
3. **Sign Transaction**: Server uses the signer's private key to sign the transaction
4. **Execute**: Transaction is executed on the blockchain

## API Endpoints

### POST `/api/wallet/add-signer`

Creates a signer for server-side access to a user's wallet.

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


