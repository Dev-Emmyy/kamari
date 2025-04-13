/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
            // Optional: You could make the pathname more specific if needed,
            // but just the hostname is often sufficient and easier.
            // pathname: '/v0/b/kamari-d27ba.appspot.com/o/**', // Example specific path
          },
          // Add other patterns here if you load images from other domains
        ],
        // --- Alternatively (less secure, but simpler if you prefer) ---
        // domains: ['firebasestorage.googleapis.com'],
      },
};

export default nextConfig;
