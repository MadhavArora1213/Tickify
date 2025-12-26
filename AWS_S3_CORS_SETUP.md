# AWS S3 CORS Configuration Guide

The `TypeError: Failed to fetch` error during image upload is caused by **Cross-Origin Resource Sharing (CORS)** blocks. Browsers block direct uploads to S3 unless the bucket explicitly allows it.

## How to Fix

1.  Log in to your **AWS Console**.
2.  Go to **S3** and open your bucket (`tickify-bucket` or whatever you named it).
3.  Click on the **Permissions** tab.
4.  Scroll down to **Cross-origin resource sharing (CORS)**.
5.  Click **Edit** and paste the following JSON configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

> **Note:** The `"AllowedOrigins": ["*"]` is insecure for production. For production, replace `"*"` with your actual domain name (e.g., `"https://tickify.com"`).

6.  Click **Save changes**.
7.  Try uploading the image again in the app.
