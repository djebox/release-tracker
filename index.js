import fs from "fs";
import fetch from "node-fetch";

const repos = JSON.parse(fs.readFileSync("repos.json", "utf-8"));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function getLatestRelease(repo) {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
    },
  });

  if (res.status === 404) {
    console.log(`⚠️ no release fo ${repo}`);
    return null;
  }

  if (!res.ok) {
    console.error(`Error for ${repo}: ${res.status}`);
    return null;
  }

  const data = await res.json();
  return {
    repo,
    tag: data.tag_name,
    name: data.name,
    url: data.html_url,
    published: data.published_at,
  };
}

async function main() {
  for (const repo of repos) {
    const release = await getLatestRelease(repo);
    if (release) {
      console.log(`✅ ${repo}: ${release.tag} (${release.published}) → ${release.url}`);
    }
  }
}

main();