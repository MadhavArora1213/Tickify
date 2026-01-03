# � CRITICAL: Fix "Access Denied" when saving Policy

You are getting an error because **AWS blocks public policies by default**. You must turn this safety feature **OFF** before you can add the policy.

Follow these exact steps in order:

### 1️⃣ Step 1: Turn OFF "Block Public Access"
1. Go to your Bucket (`tickify`) in the AWS Console.
2. Click the **Permissions** tab.
3. Look for the section **"Block public access (bucket settings)"**.
4. Click **Edit**.
5. **UNCHECK** the box that says **"Block all public access"**.
   - (Ensure all 4 sub-boxes are unchecked).
6. Click **Save changes**.
7. AWS will ask you to type **"confirm"** in a text box. Type it and confirm.

---

### 2️⃣ Step 2: NOW Add the Bucket Policy
Once Step 1 is done, try adding the policy again:

1. Scroll down to **Bucket policy**.
2. Click **Edit**.
3. Paste this JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tickify/*"
        }
    ]
}
```
4. Click **Save changes**.

### ✅ Success!
Now your uploaded images will work, and the upload errors will stop.
