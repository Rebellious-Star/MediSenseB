# MongoDB Setup Guide

This guide will help you set up MongoDB for the MediSense application.

## Option 1: Local MongoDB Installation

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Server from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will be installed and started as a Windows service by default

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Verify MongoDB is Running

Open a terminal and run:
```bash
mongosh
```

If MongoDB is running, you'll see the MongoDB shell prompt.

### Step 3: Configure Environment Variable

Create a `.env` file in your project root (same directory as `package.json`):

```env
MONGODB_URI=mongodb://localhost:27017/medisense
```

Or if MongoDB requires authentication:
```env
MONGODB_URI=mongodb://username:password@localhost:27017/medisense?authSource=admin
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (M0 cluster is free forever)
3. Create a new cluster (choose a free tier)

### Step 2: Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter username and password (save these!)
5. Set user privileges to **Read and write to any database**
6. Click **Add User**

### Step 3: Whitelist Your IP Address

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development) or add your specific IP
4. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database user password
6. Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/medisense`

### Step 5: Configure Environment Variable

Add to your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medisense?retryWrites=true&w=majority
```

Replace:
- `username` with your database username
- `password` with your database password
- `cluster` with your cluster name

## Step 6: Start Your Server

1. Make sure MongoDB is running (local) or your Atlas cluster is active
2. Start your server:
   ```bash
   npm run server
   ```

You should see:
```
✅ Connected to MongoDB successfully
📊 Database: medisense
MediSense API running at http://localhost:3000
```

## Troubleshooting

### "MongoDB connection error"

**Local MongoDB:**
- Make sure MongoDB service is running:
  - Windows: Check Services (services.msc) for "MongoDB"
  - macOS: `brew services list` (should show mongodb-community as started)
  - Linux: `sudo systemctl status mongodb`
- Check if MongoDB is on the default port (27017):
  ```bash
  mongosh
  ```

**MongoDB Atlas:**
- Verify your IP address is whitelisted
- Check username and password are correct
- Make sure the cluster is running (not paused)
- Verify the connection string format is correct

### "Cannot find module 'mongoose'"

Run:
```bash
npm install
```

### "Database connection timeout"

- Check your internet connection (for Atlas)
- Verify firewall settings aren't blocking MongoDB
- For Atlas, make sure your IP is whitelisted

### Environment Variable Not Loading

- Make sure `.env` file is in the project root (same directory as `package.json`)
- Restart your server after adding/changing environment variables
- For Vite frontend, variables must start with `VITE_`
- For Node.js backend, variables don't need a prefix

## Environment Variables Summary

Create a `.env` file in your project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/medisense
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medisense

# Backend API URL (for frontend)
VITE_API_URL=http://localhost:3000

# EmailJS Configuration (for OTP)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Security Notes

- **Never commit your `.env` file** to version control
- Add `.env` to your `.gitignore` file
- For production, use environment variables provided by your hosting platform
- Use strong passwords for MongoDB users
- Regularly rotate database passwords
- For Atlas, use IP whitelisting to restrict access

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Add `MONGODB_URI` to your `.env` file
3. Start your server: `npm run server`
4. Verify connection in the console logs
5. Test the application - all data will now persist in MongoDB!
