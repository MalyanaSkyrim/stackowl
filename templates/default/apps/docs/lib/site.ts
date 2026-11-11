import { brand } from '@starter/common'

/** The docs' name, and where "Edit on GitHub" points. */
export const site = {
  name: `${brand.displayName} docs`,
  description:
    'How the project is built, and every step to set it up: accounts, keys, cloud services and release.',
  repository: {
    owner: 'your-github-user',
    name: 'starter-app',
    branch: 'main',
  },
}

export const repositoryUrl = `https://github.com/${site.repository.owner}/${site.repository.name}`
