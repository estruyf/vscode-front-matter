export const FrameworkDetectors = [{
    framework: {
      name: "gatsby",
      dist: "public",
      static: "static",
      build: "gatsby build"
    },
    requiredFiles: ["gatsby-config.js"],
    requiredDependencies: ["gatsby"],
    commands: {
      start: "npx gatsby develop"
    }
  },
  {
    framework: {
      name: "hugo",
      dist: "public",
      static: "static",
      build: "hugo"
    },
    requiredFiles: ["config.toml", "config.yaml", "config.yml"],
    commands: {
      start: "hugo server -D"
    }
  },
  {
    framework: {
      name: "next",
      dist: ".next",
      static: "public",
      build: "next build"
    },
    requiredFiles: ["next.config.js"],
    requiredDependencies: ["next"],
    commands: {
      start: "npx next dev"
    }
  },
  {
    framework: {
      name: "nuxt",
      dist: "dist",
      static: "static",
      build: "nuxt"
    },
    requiredFiles: ["nuxt.config.js"],
    requiredDependencies: ["nuxt"],
    commands: {
      start: "npx nuxt"
    }
  },
  {
    framework: {
      name: "jekyll",
      dist: "_site",
      static: "assets",
      build: "bundle exec jekyll build"
    },
    requiredFiles: ["Gemfile"],
    requiredDependencies: ["jekyll"],
    commands: {
      start: "bundle exec jekyll serve --livereload"
    }
  },
  {
    framework: {
      name: "docusaurus",
      dist: "build",
      static: "static",
      build: "npx docusaurus build"
    },
    requiredFiles: ["docusaurus.config.js"],
    requiredDependencies: ["@docusaurus/core"],
    commands: {
      start: "npx docusaurus start"
    }
  },
  {
    framework: {
      name: "11ty",
      dist: "_site",
      build: "npx @11ty/eleventy"
    },
    requiredDependencies: ["@11ty/eleventy"],
    commands: {
      start: "npx @11ty/eleventy --serve"
    }
  },
  {
    framework: {
      name: "hexo",
      dist: "public",
      build: "npx hexo-cli generate"
    },
    requiredFiles: ["_config.js"],
    requiredDependencies: ["hexo"],
    commands: {
      start: "npx hexo-cli server"
    }
  }
];