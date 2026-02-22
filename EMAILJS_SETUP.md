# EmailJS Setup Guide

This guide will help you set up EmailJS for OTP (One-Time Password) functionality in the MediSense application.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)
3. Verify your email address

## Step 2: Create an Email Service

1. Log in to your EmailJS dashboard
2. Navigate to **Email Services** in the left sidebar
3. Click **Add New Service**
4. Choose your email provider (Gmail, Outlook, etc.)
5. Follow the setup instructions for your provider:
   - For Gmail: You'll need to enable "Less secure app access" or use an App Password
   - For Outlook: Use your regular credentials
6. Give your service a name (e.g., "MediSense OTP Service")
7. Click **Create Service**
8. **Copy the Service ID** - you'll need this later

## Step 3: Create an Email Template

1. Navigate to **Email Templates** in the left sidebar
2. Click **Create New Template**
3. Give it a name (e.g., "OTP Verification")
4. Set up your template with the following variables:
   - `{{to_email}}` - Recipient email address
   - `{{otp_code}}` - The 6-digit OTP code
   - `{{user_email}}` - User's email address

5. Example template content:
   ```
   Subject: Your MediSense Verification Code
   
   Hello,
   
   Your verification code for MediSense is: {{otp_code}}
   
   This code will expire in 5 minutes.
   
   If you didn't request this code, please ignore this email.
   
   Best regards,
   MediSense Team
   ```

6. Click **Save**
7. **Copy the Template ID** - you'll need this later

## Step 4: Get Your Public Key

1. Navigate to **Account** → **General** in the left sidebar
2. Find your **Public Key** (also called API Key)
3. **Copy the Public Key** - you'll need this later

## Step 5: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add the following environment variables:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace:
- `your_service_id_here` with the Service ID from Step 2
- `your_template_id_here` with the Template ID from Step 3
- `your_public_key_here` with the Public Key from Step 4

## Step 6: Restart Your Development Server

After adding the environment variables:

1. Stop your development server (if running)
2. Restart it with:
   ```bash
   npm run dev
   ```

The environment variables will be loaded when the app starts.

## Step 7: Test the OTP Functionality

1. Start your application
2. Go to the Login page
3. Enter your email and password
4. Click "Send OTP"
5. Check your email for the OTP code
6. Enter the OTP code to complete login

## Troubleshooting

### OTP emails not being sent

1. **Check environment variables**: Make sure all three variables are set correctly in your `.env` file
2. **Check EmailJS dashboard**: Go to EmailJS dashboard → Logs to see if there are any errors
3. **Verify service connection**: Make sure your email service is properly connected
4. **Check email provider settings**: Some providers require special permissions (like Gmail App Passwords)

### "EmailJS is not configured" error

- Make sure all three environment variables are set
- Restart your development server after adding environment variables
- Check that variable names start with `VITE_` (required for Vite)

### OTP received but verification fails

- OTPs expire after 5 minutes
- Make sure you're entering the exact 6-digit code
- Try requesting a new OTP

## Production Deployment

For production:

1. Set the same environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Make sure the variables are marked as "Environment Variables" or "Secrets"
3. Redeploy your application

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file should be in your `.gitignore`
- EmailJS Public Key is safe to expose in frontend code (it's designed for client-side use)
- For production, consider rate limiting OTP requests to prevent abuse

## Additional Resources

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS React Integration](https://www.emailjs.com/docs/examples/reactjs/)
- [EmailJS Pricing](https://www.emailjs.com/pricing/)
