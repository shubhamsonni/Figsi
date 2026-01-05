import type { NextConfig } from "next";

const nextConfig = {
 images:{
  remotePatterns: [
  {
    protocol:'https',
    hostname: 'liveblocks.io',
    port: ''
  }
 ]
 }
 

};

export default nextConfig;
