// gist.js - Gist integration for milestones

export let gistId = null;
export const GIST_FILENAME = 'yearprogress-milestones.json';

export function resetGistId() {
  gistId = null;
}

export async function findOrCreateMilestoneGist(token) {
  const resList = await fetch('https://api.github.com/gists', {
    headers: { Authorization: `token ${token}` },
  });
  if (!resList.ok) throw new Error('Failed to list gists');
  const gistsArr = await resList.json();
  let found = gistsArr.find((g) => g.files && g.files[GIST_FILENAME]);
  if (found) {
    gistId = found.id;
    console.log('Using existing Gist ID:', gistId);
    return gistId;
  }
  // 2. Create a new Gist
  const resCreate = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    body: JSON.stringify({
      description: 'Year Progress Milestones',
      public: false,
      files: {
        [GIST_FILENAME]: { content: '[]' },
      },
    }),
  });
  if (!resCreate.ok) throw new Error('Failed to create gist');
  const newGistObj = await resCreate.json();
  gistId = newGistObj.id;
  console.log('Created new Gist ID:', gistId);
  return gistId;
}

export async function loadMilestonesFromGist(token) {
  if (!gistId) gistId = await findOrCreateMilestoneGist(token);
  const resGist = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `token ${token}` },
  });
  if (!resGist.ok) {
    console.error('Failed to load gist:', resGist.status, await resGist.text());
    throw new Error('Failed to load gist');
  }
  const gistObj = await resGist.json();
  const file = gistObj.files[GIST_FILENAME];
  if (file && file.content) {
    try {
      return JSON.parse(file.content);
    } catch {
      return [];
    }
  } else {
    return [];
  }
}

export async function saveMilestonesToGist(token, milestones) {
  if (!gistId) gistId = await findOrCreateMilestoneGist(token);
  const resSave = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${token}`,
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: { content: JSON.stringify(milestones, null, 2) },
      },
    }),
  });
  if (!resSave.ok) throw new Error('Failed to save milestones to gist');
}
