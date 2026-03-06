// GitHub Integration - Push project to new repository
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  const repoName = process.argv[2] || 'operator-os';
  const description = 'OperatorOS - Behavioral tracking and leverage creation tool for operators';
  
  console.log('🔗 Connecting to GitHub...');
  const octokit = await getUncachableGitHubClient();
  
  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Authenticated as: ${user.login}`);
  
  // Check if repo already exists
  try {
    await octokit.repos.get({ owner: user.login, repo: repoName });
    console.log(`⚠️  Repository ${user.login}/${repoName} already exists.`);
    console.log(`   Using existing repository...`);
  } catch (error: any) {
    if (error.status === 404) {
      // Create new repository
      console.log(`📦 Creating new repository: ${repoName}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description,
        private: false,
        auto_init: false
      });
      console.log(`✅ Repository created: https://github.com/${user.login}/${repoName}`);
    } else {
      throw error;
    }
  }
  
  // Get access token for git operations
  const accessToken = await getAccessToken();
  const remoteUrl = `https://${user.login}:${accessToken}@github.com/${user.login}/${repoName}.git`;
  
  // Configure git and push
  console.log('📤 Pushing code to GitHub...');
  
  try {
    // Remove existing remote if it exists
    try {
      execSync('git remote remove github-origin 2>/dev/null || true', { stdio: 'pipe' });
    } catch {}
    
    // Add remote and push
    execSync(`git remote add github-origin "${remoteUrl}"`, { stdio: 'pipe' });
    execSync('git push -u github-origin main --force', { stdio: 'inherit' });
    
    console.log('');
    console.log('🎉 Success! Your project is now on GitHub:');
    console.log(`   https://github.com/${user.login}/${repoName}`);
  } catch (error) {
    console.error('Failed to push:', error);
    throw error;
  } finally {
    // Clean up remote to avoid token exposure
    try {
      execSync('git remote remove github-origin 2>/dev/null || true', { stdio: 'pipe' });
    } catch {}
  }
}

main().catch(console.error);
