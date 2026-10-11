import { Config } from "@remotion/cli/config";

// The capture is 2x of a 1280x820 viewport and both compositions are 1920x1080,
// so every shot is mounted below the pixels it was taken at and nothing is ever
// enlarged. CRF 17 keeps the sidebar labels readable after a re-encode.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
