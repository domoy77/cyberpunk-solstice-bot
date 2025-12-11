import axios from 'axios';
import cfonts from 'cfonts';
import gradient from 'gradient-string';
import chalk from 'chalk';
import fs from 'fs/promises';
import readline from 'readline';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import ProgressBar from 'progress';
import ora from 'ora';
import boxen from 'boxen';

// ================================
// 🌟 KONFIGURASI WARNA & TEMA BARU
// ================================

// Palet warna neon cyberpunk
const theme = {
  primary: chalk.hex('#00D4FF').bold,      // Cyan neon
  secondary: chalk.hex('#FF00FF').bold,    // Magenta neon
  success: chalk.hex('#00FF9D').bold,      // Green neon
  warning: chalk.hex('#FFE600').bold,      // Yellow neon
  error: chalk.hex('#FF0055').bold,        // Red neon
  info: chalk.hex('#9D4EDD').bold,         // Purple neon
  accent: chalk.hex('#FF6B35').bold,       // Orange neon
  muted: chalk.hex('#8B8B8B'),             // Gray
  highlight: chalk.hex('#FFE500').bgHex('#1A1A2E'), // Yellow on dark
};

// Gradients khusus
const gradients = {
  title: gradient('cyan', 'magenta', 'cyan'),
  subtitle: gradient('#FF0080', '#00D4FF'),
  successGradient: gradient('#00FF9D', '#00D4FF'),
  warningGradient: gradient('#FFE600', '#FF6B35'),
  errorGradient: gradient('#FF0055', '#FF0080'),
  infoGradient: gradient('#9D4EDD', '#00D4FF'),
};

// ================================
// 🎨 LOGGER DENGAN TAMPILAN BARU
// ================================

const logger = {
  info: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '✨';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.info(' INFO ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.infoGradient('┃')} ${level} ${emoji} ${context}${theme.primary(msg)}`;
    console.log(formattedMsg);
  },
  
  warn: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '⚠️ ';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.warning(' WARN ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.warningGradient('┃')} ${level} ${emoji} ${context}${theme.warning(msg)}`;
    console.log(formattedMsg);
  },
  
  error: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '💥';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.error(' ERROR ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.errorGradient('┃')} ${level} ${emoji} ${context}${theme.error(msg)}`;
    console.log(formattedMsg);
  },
  
  debug: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '🔍';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.secondary(' DEBUG ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.subtitle('┃')} ${level} ${emoji} ${context}${theme.muted(msg)}`;
    console.log(formattedMsg);
  },
  
  success: (msg, options = {}) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const emoji = options.emoji || '✅';
    const context = options.context ? `[${options.context}] ` : '';
    const level = theme.success(' SUCCESS ');
    const formattedMsg = `${theme.muted('╭─')} ${theme.muted(timestamp)} ${gradients.successGradient('┃')} ${level} ${emoji} ${context}${theme.success(msg)}`;
    console.log(formattedMsg);
  }
};

// ================================
// ⚡ FUNGSI UTILITAS DENGAN TAMPILAN BARU
// ================================

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function countdown(seconds, message) {
  return new Promise((resolve) => {
    let remaining = seconds;
    const spinnerFrames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
    let frame = 0;
    
    process.stdout.write(`\r${theme.info(spinnerFrames[frame])} ${gradients.subtitle(message)} ${theme.warning(`${remaining}s`)} ${theme.muted('remaining...')}`);
    
    const interval = setInterval(() => {
      remaining--;
      frame = (frame + 1) % spinnerFrames.length;
      
      process.stdout.write(`\r${theme.info(spinnerFrames[frame])} ${gradients.subtitle(message)} ${theme.warning(`${remaining}s`)} ${theme.muted('remaining...')}`);
      
      if (remaining <= 0) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(process.stdout.columns) + '\r');
        resolve();
      }
    }, 1000);
  });
}

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}

function centerText(text, width) {
  const cleanText = stripAnsi(text);
  const textLength = cleanText.length;
  const totalPadding = Math.max(0, width - textLength);
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return `${' '.repeat(leftPadding)}${text}${' '.repeat(rightPadding)}`;
}

function printHeader(title) {
  const width = 80;
  const border = '═'.repeat(width - 4);
  console.log(gradients.title(`╔${border}╗`));
  console.log(gradients.title(`║ ${centerText(title, width - 4)} ║`));
  console.log(gradients.title(`╚${border}╝`));
}

function printSection(title) {
  const width = 60;
  const border = '─'.repeat(width);
  console.log(`\n${theme.muted('┌')}${border}${theme.muted('┐')}`);
  console.log(`${theme.muted('│')} ${theme.secondary(title.padEnd(width - 2))} ${theme.muted('│')}`);
  console.log(`${theme.muted('└')}${border}${theme.muted('┘')}`);
}

function printInfo(label, value, context) {
  const formattedLabel = theme.accent(`${label}:`.padEnd(20));
  const formattedValue = theme.success(value);
  console.log(`  ${theme.muted('├─')} ${formattedLabel} ${formattedValue}`);
}

function printProfileInfo(username, checkInStreak, totalPoints, context) {
  printHeader(`📊 PROFILE INFO - ${context.toUpperCase()} 📊`);
  
  const profileBox = boxen(
    `${theme.primary('👤 Username:')}   ${theme.success(username || 'N/A')}\n` +
    `${theme.primary('🔥 Streak:')}      ${theme.warning(checkInStreak.toString())} days\n` +
    `${theme.primary('🏆 Total Points:')} ${theme.info(totalPoints.toString())}\n` +
    `${theme.muted('─'.repeat(30))}\n` +
    `${theme.muted('Last Updated:')} ${new Date().toLocaleTimeString()}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1A1A2E',
      title: '📈 STATISTICS',
      titleAlignment: 'center'
    }
  );
  
  console.log(profileBox);
}

// ================================
// 🌐 KONFIGURASI HTTP & PROXY
// ================================

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/102.0'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getAxiosConfig(proxy, token = null, additionalHeaders = {}) {
  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,id;q=0.7,fr;q=0.6,ru;q=0.5,zh-CN;q=0.4,zh;q=0.3',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'referer': 'https://kingdom.solflare.com/',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Opera";v="124"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-storage-access': 'active',
    'user-agent': getRandomUserAgent(),
    ...additionalHeaders
  };
  
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    headers,
    timeout: 60000
  };
  
  if (proxy) {
    config.httpsAgent = newAgent(proxy);
    config.proxy = false;
  }
  
  return config;
}

function newAgent(proxy) {
  if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
    return new HttpsProxyAgent(proxy);
  } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
    return new SocksProxyAgent(proxy);
  } else {
    logger.warn(`Unsupported proxy: ${proxy}`);
    return null;
  }
}

async function requestWithRetry(method, url, payload = null, config = {}, retries = 3, backoff = 2000, context) {
  for (let i = 0; i < retries; i++) {
    try {
      let response;
      if (method.toLowerCase() === 'get') {
        response = await axios.get(url, config);
      } else if (method.toLowerCase() === 'post') {
        response = await axios.post(url, payload, config);
      } else {
        throw new Error(`Method ${method} not supported`);
      }
      return response;
    } catch (error) {
      if (error.response && error.response.status >= 500 && i < retries - 1) {
        logger.warn(`Retrying ${method.toUpperCase()} ${url} (${i + 1}/${retries})`, { emoji: '🔄', context });
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      }
      if (i < retries - 1) {
        logger.warn(`Retrying ${method.toUpperCase()} ${url} (${i + 1}/${retries})`, { emoji: '🔄', context });
        await delay(backoff / 1000);
        backoff *= 1.5;
        continue;
      }
      throw error;
    }
  }
}

// ================================
// 📁 FILE OPERATIONS
// ================================

async function readTokens() {
  try {
    const data = await fs.readFile('token.txt', 'utf-8');
    const tokens = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    logger.success(`Loaded ${tokens.length} token${tokens.length === 1 ? '' : 's'}`, { emoji: '🔑' });
    return tokens;
  } catch (error) {
    logger.error(`Failed to read token.txt: ${error.message}`, { emoji: '❌' });
    return [];
  }
}

async function readProxies() {
  try {
    const data = await fs.readFile('proxy.txt', 'utf-8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (proxies.length === 0) {
      logger.warn('No proxies found. Proceeding without proxy.', { emoji: '⚠️' });
    } else {
      logger.success(`Loaded ${proxies.length} prox${proxies.length === 1 ? 'y' : 'ies'}`, { emoji: '🌐' });
    }
    return proxies;
  } catch (error) {
    logger.warn('proxy.txt not found.', { emoji: '⚠️' });
    return [];
  }
}

// ================================
// 🎮 GAME FUNCTIONS DENGAN SPINNER BARU
// ================================

async function fetchUserInfo(token, proxy, context) {
  const url = 'https://kingdom.solflare.com/api/v1/users/me';
  const spinner = ora({
    text: gradients.subtitle('Fetching user info...'),
    spinner: {
      interval: 80,
      frames: ['🔄', '⚡', '🚀', '💫', '🌟', '✨']
    },
    color: 'cyan'
  }).start();
  
  try {
    const config = getAxiosConfig(proxy, token);
    const response = await requestWithRetry('get', url, null, config, 3, 2000, context);
    spinner.stop();
    
    if (response.data.success) {
      const username = response.data.data.username || 'N/A';
      const checkInStreak = response.data.data.stats.checkInStreak || 0;
      const totalPoints = response.data.data.stats.totalPoints || 0;
      const availableTickets = response.data.data.stats.availableTickets || 0;
      return { username, checkInStreak, totalPoints, availableTickets };
    } else {
      throw new Error('Failed to fetch user info');
    }
  } catch (error) {
    spinner.fail(theme.error(`Failed to fetch user info: ${error.message}`));
    return { username: 'N/A', checkInStreak: 0, totalPoints: 0, availableTickets: 0 };
  }
}

async function fetchCheckInStatus(token, proxy, context) {
  const url = 'https://kingdom.solflare.com/api/v1/checkin/status';
  const spinner = ora({
    text: gradients.infoGradient('Checking daily status...'),
    spinner: 'dots',
    color: 'magenta'
  }).start();
  
  try {
    const config = getAxiosConfig(proxy, token);
    const response = await requestWithRetry('get', url, null, config, 3, 2000, context);
    spinner.stop();
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to fetch check-in status');
    }
  } catch (error) {
    spinner.fail(theme.error(`Failed to fetch check-in status: ${error.message}`));
    return null;
  }
}

async function performCheckIn(token, proxy, context) {
  const url = 'https://kingdom.solflare.com/api/v1/checkin';
  const payload = {};
  const config = getAxiosConfig(proxy, token);
  config.validateStatus = (status) => status >= 200 && status < 500;
  
  const spinner = ora({
    text: gradients.successGradient('Performing check-in...'),
    spinner: {
      interval: 80,
      frames: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']
    },
    color: 'green'
  }).start();
  
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, context);
    if (response.data.success) {
      spinner.succeed(theme.success('✓ Check-in Successful!'));
      return { success: true };
    } else {
      spinner.warn(theme.warning('! Already checked in today'));
      return { success: false };
    }
  } catch (error) {
    spinner.fail(theme.error(`✗ Failed to check-in: ${error.message}`));
    return { success: false };
  }
}

async function fetchGames(token, proxy, context) {
  const url = 'https://kingdom.solflare.com/api/v1/games/all';
  const spinner = ora({
    text: gradients.subtitle('Fetching available games...'),
    spinner: 'hearts',
    color: 'yellow'
  }).start();
  
  try {
    const config = getAxiosConfig(proxy, token);
    const response = await requestWithRetry('get', url, null, config, 3, 2000, context);
    spinner.stop();
    
    if (response.data.success) {
      const assetDropGame = response.data.data.find(game => game.name === 'Asset Drop');
      if (assetDropGame) {
        return { 
          gameId: assetDropGame.id, 
          ticketCost: assetDropGame.ticketCost, 
          pointsPerAsset: assetDropGame.metadata.pointsPerAsset 
        };
      } else {
        throw new Error('Asset Drop game not found');
      }
    } else {
      throw new Error('Failed to fetch games');
    }
  } catch (error) {
    spinner.fail(theme.error(`Failed to fetch games: ${error.message}`));
    return null;
  }
}

async function startGame(token, gameId, proxy, context) {
  const url = 'https://kingdom.solflare.com/api/v1/games/start';
  const payload = { gameId };
  const config = getAxiosConfig(proxy, token);
  
  const spinner = ora({
    text: gradients.successGradient('Starting game session...'),
    spinner: 'bouncingBar',
    color: 'cyan'
  }).start();
  
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, context);
    if (response.data.success) {
      spinner.succeed(theme.success('✓ Game started successfully'));
      return response.data.data.id;
    } else {
      throw new Error('Failed to start game');
    }
  } catch (error) {
    spinner.fail(theme.error(`✗ Failed to start game: ${error.message}`));
    return null;
  }
}

async function abandonGame(token, sessionId, proxy, context) {
  const url = `https://kingdom.solflare.com/api/v1/games/sessions/${sessionId}/abandon`;
  const payload = {};
  const config = getAxiosConfig(proxy, token);
  
  const spinner = ora({
    text: gradients.warningGradient('Abandoning current game...'),
    spinner: 'circleHalves',
    color: 'yellow'
  }).start();
  
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, context);
    if (response.data.success) {
      spinner.succeed(theme.success('✓ Game abandoned'));
      return true;
    } else {
      throw new Error('Failed to abandon game');
    }
  } catch (error) {
    spinner.fail(theme.error(`✗ Failed to abandon game: ${error.message}`));
    return false;
  }
}

async function completeGame(token, sessionId, score, duration, assetsClicked, difficulty, proxy, context) {
  const url = `https://kingdom.solflare.com/api/v1/games/complete/${sessionId}`;
  const payload = {
    score,
    gameData: {
      duration,
      assetsClicked,
      difficulty,
      timeRemaining: 0,
      calculatedDuration: 30
    }
  };
  const config = getAxiosConfig(proxy, token);
  
  const spinner = ora({
    text: gradients.successGradient('Completing game...'),
    spinner: 'triangle',
    color: 'green'
  }).start();
  
  try {
    const response = await requestWithRetry('post', url, payload, config, 3, 2000, context);
    if (response.data.success) {
      spinner.succeed(gradients.successGradient(`✓ Game Completed! +${score} Points 🎉`));
      return true;
    } else {
      throw new Error('Failed to complete game');
    }
  } catch (error) {
    spinner.fail(theme.error(`✗ Failed to complete game: ${error.message}`));
    return false;
  }
}

function calculateAssetsClicked(score, pointsPerAsset) {
  const specialCount = Math.floor(Math.random() * (Math.floor(score / 10) + 1));
  const regularCount = score - (specialCount * pointsPerAsset.special);
  return regularCount + specialCount;
}

// ================================
// 👤 ACCOUNT PROCESSING
// ================================

async function processAccount(token, index, total, proxy) {
  const context = `ACC-${String(index + 1).padStart(3, '0')}`;
  
  printHeader(`🚀 STARTING ACCOUNT ${index + 1}/${total}`);
  
  const { username: initialUsername } = await fetchUserInfo(token, proxy, context);
  
  printSection('🔍 ACCOUNT INFORMATION');
  printInfo('Username', initialUsername, context);
  const ip = await getPublicIP(proxy, context);
  printInfo('IP Address', ip, context);
  console.log();
  
  try {
    logger.info('Starting daily check-in process...', { emoji: '📅', context });
    const checkInStatus = await fetchCheckInStatus(token, proxy, context);
    
    if (checkInStatus && checkInStatus.canCheckInToday && !checkInStatus.hasCheckedInToday) {
      await performCheckIn(token, proxy, context);
    } else {
      logger.info('Already checked in today', { emoji: '✅', context });
    }
    
    logger.info('Starting auto-play games...', { emoji: '🎮', context });
    let userInfo = await fetchUserInfo(token, proxy, context);
    let availableTickets = userInfo.availableTickets;
    const gamesInfo = await fetchGames(token, proxy, context);
    
    if (!gamesInfo) {
      logger.warn('Skipping games due to fetch error', { emoji: '⚠️', context });
      return;
    }
    
    const { gameId, ticketCost, pointsPerAsset } = gamesInfo;
    const maxPlays = Math.floor(availableTickets / ticketCost);
    
    if (maxPlays === 0) {
      logger.info('No tickets available for play', { emoji: '🎫', context });
    } else {
      printSection('🎮 GAME STATISTICS');
      printInfo('Available Tickets', availableTickets, context);
      printInfo('Ticket Cost', ticketCost, context);
      printInfo('Max Plays', maxPlays, context);
      console.log();
      
      const bar = new ProgressBar(gradients.title('Playing Games [:bar] :percent :etas'), {
        complete: '█',
        incomplete: '░',
        width: 40,
        total: maxPlays
      });
      
      let remainingTickets = availableTickets;
      for (let i = 0; i < maxPlays; i++) {
        printSection(`🎯 GAME ${i + 1}/${maxPlays}`);
        printInfo('Remaining Tickets', remainingTickets, context);
        
        const sessionId = await startGame(token, gameId, proxy, context);
        if (!sessionId) continue;
        
        const playDelay = Math.floor(Math.random() * (55 - 30 + 1)) + 30;
        await countdown(playDelay, 'Playing game');
        
        await abandonGame(token, sessionId, proxy, context);
        
        const score = Math.floor(Math.random() * (900 - 500 + 1)) + 500;
        const difficulty = Math.floor(Math.random() * (700 - 580 + 1)) + 580 + Math.floor(score / 100);
        const assetsClicked = calculateAssetsClicked(score, pointsPerAsset);
        
        await completeGame(token, sessionId, score, playDelay, assetsClicked, difficulty, proxy, context);
        
        bar.tick();
        remainingTickets -= ticketCost;
        
        if (i < maxPlays - 1) {
          const nextDelay = Math.floor(Math.random() * (30 - 15 + 1)) + 15;
          console.log();
          await countdown(nextDelay, 'Cooling down');
        }
        console.log();
      }
      
      logger.success(`Processed ${maxPlays} games successfully`, { emoji: '🏆', context });
    }
    
    const finalUserInfo = await fetchUserInfo(token, proxy, context);
    printProfileInfo(finalUserInfo.username, finalUserInfo.checkInStreak, finalUserInfo.totalPoints, context);
    
    logger.success('Account processing completed', { emoji: '🎉', context });
    console.log(gradients.title('═'.repeat(80)));
  } catch (error) {
    logger.error(`Error processing account: ${error.message}`, { emoji: '💥', context });
  }
}

async function getPublicIP(proxy, context) {
  try {
    const config = getAxiosConfig(proxy);
    const response = await requestWithRetry('get', 'https://api.ipify.org?format=json', null, config, 3, 2000, context);
    return response.data.ip || 'Unknown';
  } catch (error) {
    logger.error(`Failed to get IP: ${error.message}`, { emoji: '🌐', context });
    return 'Error retrieving IP';
  }
}

// ================================
// ⚙️ CONFIGURATION INITIALIZATION
// ================================

let globalUseProxy = false;
let globalProxies = [];

async function initializeConfig() {
  console.log('\n');
  const proxyQuestion = boxen(
    theme.primary('🔌 PROXY CONFIGURATION\n') +
    theme.muted('Do you want to use proxy for requests?\n') +
    theme.info('(Recommended for multiple accounts)\n\n') +
    theme.accent('Choose: [Y]es / [N]o :'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
      backgroundColor: '#1A1A2E',
      title: '⚙️ SETTINGS',
      titleAlignment: 'center'
    }
  );
  
  console.log(proxyQuestion);
  
  const useProxyAns = await askQuestion(theme.accent('➤ Your choice: '));
  
  if (useProxyAns.trim().toLowerCase() === 'y') {
    globalUseProxy = true;
    globalProxies = await readProxies();
    
    if (globalProxies.length === 0) {
      globalUseProxy = false;
      logger.warn('No proxies available, proceeding without proxy.', { emoji: '⚠️' });
    } else {
      logger.success(`Loaded ${globalProxies.length} proxy servers`, { emoji: '🌐' });
    }
  } else {
    logger.info('Proceeding without proxy.', { emoji: 'ℹ️' });
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    });
  });
}

// ================================
// 🔄 MAIN CYCLE FUNCTION
// ================================

async function runCycle() {
  const tokens = await readTokens();
  if (tokens.length === 0) {
    logger.error('No tokens found in token.txt. Exiting cycle.', { emoji: '❌' });
    return;
  }
  
  for (let i = 0; i < tokens.length; i++) {
    const proxy = globalUseProxy ? globalProxies[i % globalProxies.length] : null;
    try {
      await processAccount(tokens[i], i, tokens.length, proxy);
    } catch (error) {
      logger.error(`Error processing account: ${error.message}`, { 
        emoji: '💥', 
        context: `ACC-${String(i + 1).padStart(3, '0')}` 
      });
    }
    
    if (i < tokens.length - 1) {
      console.log('\n' + gradients.title('═'.repeat(80)) + '\n');
      await delay(5);
    }
  }
}

// ================================
// 🚀 SPLASH SCREEN YANG FIXED
// ================================

function displaySplashScreen() {
  console.clear();
  
  const width = 80;
  const line = (char = '═') => char.repeat(width);
  
  // Garis atas
  console.log(gradients.title(line('═')));
  
  // Nama aplikasi dalam ASCII art
  const asciiArt = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ░█████╗░██╗░░██╗███████╗      ██████╗░░█████╗░███╗░░░███╗░█████╗░██╗░░░██╗  ║
║  ██╔══██╗██║░░██║██╔════╝      ██╔══██╗██╔══██╗████╗░████║██╔══██╗╚██╗░██╔╝  ║
║  ██║░░╚═╝███████║█████╗░░      ██║░░██║██║░░██║██╔████╔██║██║░░██║░╚████╔╝░  ║
║  ██║░░██╗██╔══██║██╔══╝░░      ██║░░██║██║░░██║██║╚██╔╝██║██║░░██║░░╚██╔╝░░  ║
║  ╚█████╔╝██║░░██║███████╗      ██████╔╝╚█████╔╝██║░╚═╝░██║╚█████╔╝░░░██║░░░  ║
║  ░╚════╝░╚═╝░░╚═╝╚══════╝      ╚═════╝░░╚════╝░╚═╝░░░░░╚═╝░╚════╝░░░░╚═╝░░░  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
  
  // Tampilkan ASCII art dengan warna
  console.log(gradients.title(asciiArt));
  
  // Judul utama
  console.log('\n' + gradients.title(centerText('▀▄▀▄▀▄ CYBERPUNK SOLSTICE BOT v2.0 ▄▀▄▀▄▀', width)));

  // Subtitle
  console.log(gradients.subtitle(centerText('⚡ Cyberpunk Edition ⚡', width)));
  
  // Garis pemisah
  console.log(gradients.title(line('─')));
  
  // Informasi
//console.log(gradients.title(centerText('CYBERPUNK SOLSTICE BOT v2.0', width)));
//console.log(gradients.subtitle(centerText('⚡ Repository: github.com/domoy77/cyberpunk-solstice-bot', width)));
  console.log(theme.primary(centerText('🎮 Auto Check-in & Play Bot for Solstice Kingdom', width)));
  console.log(theme.muted(centerText('Automate daily check-ins and game plays to maximize points', width)));
  console.log('\n');
  
  // Credits box
  const creditsContent = 
    theme.secondary('👨‍💻 Developer : ') + theme.primary('CHE DOMOY\n') +
    theme.secondary('🐦 Twitter (X) : ') + theme.info('@Domoy77\n') +
    theme.secondary('🚀 Version     : ') + theme.success('2.0.0 Cyberpunk\n') +
    theme.secondary('📅 Released    : ') + theme.muted('December 2025');
  
  const creditsBox = boxen(creditsContent, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'magenta',
    backgroundColor: '#0F0F23',
    title: '✨ CREDITS & INFO',
    titleAlignment: 'center',
    width: width - 4
  });
  
  // Split dan center box
  const creditBoxLines = creditsBox.split('\n');
  creditBoxLines.forEach(lineText => {
    console.log(centerText(lineText, width));
  });
  
  // Garis bawah
  console.log('\n' + gradients.title(line('═')));
  
  // Tips
  console.log(theme.muted(centerText('💡 Tip: Make sure token.txt and proxy.txt are properly configured', width)));
  console.log(theme.muted(centerText('⚠️  Warning: Use responsibly and comply with Solstice Terms of Service', width)));
  console.log(gradients.title(line('═')));
}

// ================================
// 🎬 MAIN FUNCTION
// ================================

async function run() {
  try {
    // Tampilkan splash screen yang sudah fixed
    displaySplashScreen();
    
    // Tunggu 1.5 detik untuk efek
    await delay(1.5);
    
    // Initialize configuration
    await initializeConfig();
    
    let cycleCount = 0;
    while (true) {
      cycleCount++;
      
      // Header untuk cycle
      console.log('\n');
      printHeader(`🔄 CYCLE ${cycleCount} STARTING 🚀`);
      
      // Jalankan cycle
      await runCycle();
      
      // Tampilkan completion message
      console.log('\n');
      const completionBox = boxen(
        gradients.successGradient(`✅ Cycle ${cycleCount} Completed Successfully!\n\n`) +
        theme.muted('⏳ Next cycle will start in 24 hours\n') +
        theme.info(`🕐 Scheduled: ${new Date(Date.now() + 86400000).toLocaleString()}\n`) +
        theme.muted('\n' + '─'.repeat(40) + '\n') +
        theme.accent('📊 Statistics:\n') +
        theme.muted(`• Total cycles completed: ${cycleCount}\n`) +
        theme.muted(`• Next run: ${new Date(Date.now() + 86400000).toLocaleTimeString()}`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
          backgroundColor: '#1A1A2E',
          title: '📅 SCHEDULER',
          titleAlignment: 'center'
        }
      );
      
      console.log(completionBox);
      
      // Tunggu 24 jam
      logger.info('Waiting 24 hours for next cycle...', { emoji: '⏳' });
      await delay(86400);
    }
  } catch (error) {
    logger.error(`Fatal error in main execution: ${error.message}`, { emoji: '💀' });
    
    // Error box
    const errorBox = boxen(
      theme.error(`❌ CRITICAL ERROR\n\n`) +
      theme.muted(`Message: ${error.message}\n`) +
      theme.muted(`Stack: ${error.stack?.split('\n')[1] || 'N/A'}\n\n`) +
      theme.warning('🔄 Bot will restart in 30 seconds...'),
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'red',
        backgroundColor: '#2A1A1A',
        title: '🚨 SYSTEM FAILURE',
        titleAlignment: 'center'
      }
    );
    
    console.log('\n' + errorBox);
    await delay(30);
    
    // Restart bot
    console.clear();
    logger.info('Restarting bot...', { emoji: '🔄' });
    await run();
  }
}

// ================================
// 🎬 START APPLICATION
// ================================

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { emoji: '💥' });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, { emoji: '💥' });
});

// Start the bot
run().catch(error => {
  logger.error(`Failed to start bot: ${error.message}`, { emoji: '💀' });
  process.exit(1);
});
