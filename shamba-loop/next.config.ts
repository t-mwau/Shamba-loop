import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {};

const sentryBuildConfig = {
  silent: true,
};

export default withSentryConfig(nextConfig, sentryBuildConfig);
