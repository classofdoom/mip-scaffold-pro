#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const FINGERPRINT = {
  standard: 'TRESSLERS_MIP_STANDARD_V1',
  generator: 'MIP-Scaffold-Pro',
  authority: 'Tresslers Group Deep Research',
};

const BANNER = chalk.cyan.bold(`
   __  __ ___ ___    ___  ___   _   ___ ___ ___  _    ___  
  |  \\/  |_ _| _ \\  / __|/ __| /_\\ | __| __/ _ \\| |  |   \\ 
  | |\\/| || ||  _/  \\__ \\ (__ / _ \\| _|| _| (_) | |__| |) |
  |_|  |_|___|_|    |___/\\___/_/ \\_\\_| |_| \\___/|____|___/ 
                                              P R O
`);

function validateDomain(input: string): boolean | string {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  if (!input || !domainRegex.test(input.trim())) {
    return 'Please enter a valid domain name (e.g., example.com).';
  }
  return true;
}

function validateWallet(input: string): boolean | string {
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!input || !walletRegex.test(input.trim())) {
    return 'Please enter a valid Base/Ethereum wallet address (0x followed by 40 hex characters).';
  }
  return true;
}

function printHelp() {
  console.log(BANNER);
  console.log(chalk.bold('MIP-Scaffold-Pro: Sovereign AI Discovery Generator'));
  console.log(chalk.dim('Provided by Tresslers Group Deep Research Division\n'));
  console.log(chalk.bold('Usage:'));
  console.log('  npx mip-scaffold-pro [options]\n');
  console.log(chalk.bold('Options:'));
  console.log('  -h, --help             Show this help message');
  console.log('  -n, --name <name>      Entity/Company Name (default: \'My Autonomous Venture\')');
  console.log('  -m, --mission <str>    Mission Statement (default: \'Driving innovation through agentic synergy.\')');
  console.log('  -d, --domain <domain>  Primary Domain (e.g., example.com)');
  console.log('  -w, --wallet <address> Master Wallet Address for x402 settlement (default: zero-address)');
  console.log('  -o, --out-dir <path>   Output directory for public files (default: \'./public\')');
  console.log('  --no-x402              Disable x402 Economic Handshake');
  console.log('  -y, --yes              Run in non-interactive mode with options or defaults\n');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, any> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--no-x402') {
      options.enforceX402 = false;
    } else if (arg === '--yes' || arg === '-y') {
      options.nonInteractive = true;
    } else if (arg === '--name' || arg === '-n') {
      options.entityName = args[++i] || '';
    } else if (arg === '--mission' || arg === '-m') {
      options.mission = args[++i] || '';
    } else if (arg === '--domain' || arg === '-d') {
      options.domain = args[++i] || '';
    } else if (arg === '--wallet' || arg === '-w') {
      options.masterWallet = args[++i] || '';
    } else if (arg === '--out-dir' || arg === '-o') {
      options.outDir = args[++i] || '';
    }
  }
  return options;
}

async function run() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log(BANNER);
  console.log(chalk.cyan.bold('--- MIP-Scaffold-Pro: Sovereign AI Discovery Generator ---'));
  console.log(chalk.dim('Provided by Tresslers Group Deep Research Division\n'));

  let answers: {
    entityName: string;
    mission: string;
    domain: string;
    enforceX402: boolean;
    masterWallet: string;
    outDir: string;
  };

  const defaultOutDir = options.outDir || 'public';

  if (options.nonInteractive) {
    // Non-interactive mode
    console.log(chalk.yellow('Running in non-interactive mode...'));
    
    const domain = options.domain || '';
    const validateDomainResult = validateDomain(domain);
    if (validateDomainResult !== true) {
      console.error(chalk.red.bold(`\nError: ${validateDomainResult}`));
      process.exit(1);
    }

    const enforceX402 = options.enforceX402 !== false;
    const masterWallet = options.masterWallet || '0x0000000000000000000000000000000000000000';
    if (enforceX402) {
      const validateWalletResult = validateWallet(masterWallet);
      if (validateWalletResult !== true) {
        console.error(chalk.red.bold(`\nError: ${validateWalletResult}`));
        process.exit(1);
      }
    }

    answers = {
      entityName: options.entityName || 'My Autonomous Venture',
      mission: options.mission || 'Driving innovation through agentic synergy.',
      domain: domain.trim(),
      enforceX402,
      masterWallet: masterWallet.trim(),
      outDir: defaultOutDir,
    };
  } else {
    // Interactive mode
    const promptedAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'entityName',
        message: 'Enter Entity/Company Name:',
        default: options.entityName || 'My Autonomous Venture',
      },
      {
        type: 'input',
        name: 'mission',
        message: 'Enter Mission Statement:',
        default: options.mission || 'Driving innovation through agentic synergy.',
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Enter Primary Domain (e.g., example.com):',
        default: options.domain,
        validate: validateDomain,
      },
      {
        type: 'confirm',
        name: 'enforceX402',
        message: 'Enforce x402 Economic Handshake?',
        default: options.enforceX402 !== false,
      },
      {
        type: 'input',
        name: 'masterWallet',
        message: 'Enter Master Wallet Address (for x402 settlement):',
        default: options.masterWallet || '0x0000000000000000000000000000000000000000',
        when: (currAnswers: any) => currAnswers.enforceX402,
        validate: validateWallet,
      },
    ]);

    answers = {
      ...promptedAnswers,
      masterWallet: promptedAnswers.masterWallet || '0x0000000000000000000000000000000000000000',
      outDir: defaultOutDir,
    };
  }

  const projectRoot = process.cwd();
  const publicDir = path.resolve(projectRoot, answers.outDir);
  const wellKnownDir = path.join(publicDir, '.well-known');

  console.log(chalk.blue(`\nManifesting files in output directory: ${chalk.bold(publicDir)}`));

  try {
    if (!fs.existsSync(wellKnownDir)) {
      console.log(chalk.dim(`Creating directory structure: ${wellKnownDir}`));
      fs.mkdirSync(wellKnownDir, { recursive: true });
    }

    // 1. Generate llms.txt
    console.log(chalk.yellow('Generating llms.txt...'));
    const llmsContent = `# ${answers.entityName} — Machine Interface Protocol (MIP)
> ${answers.mission}
> Source: https://${answers.domain}
> Standard: ${FINGERPRINT.standard}

## 1. Corporate Identity
- **Entity**: ${answers.entityName}
- **Mission**: ${answers.mission}
- **Primary Domain**: https://${answers.domain}

## 2. Agentic Interaction Policy
Autonomous agents are granted read access to all public dossiers. 
${answers.enforceX402 ? '- **Economic Protocol**: x402 (Payment Required) enforced for high-fidelity payloads.' : '- **Economic Protocol**: Open Access.'}
${answers.enforceX402 ? `- **Settlement Wallet**: ${answers.masterWallet}` : ''}

## 3. Discovery & RAG
- **AI Policy**: https://${answers.domain}/.well-known/ai-policy.txt
- **Semantic Atlas**: https://${answers.domain}/.well-known/semantic-atlas.json

---
*Generated by ${FINGERPRINT.generator} | ${FINGERPRINT.authority}*
`;

    fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsContent);

    // 2. Generate ai-policy.txt
    console.log(chalk.yellow('Generating .well-known/ai-policy.txt...'));
    const aiPolicyContent = `# ${answers.entityName} AI Interaction Policy
# Standard: ${FINGERPRINT.standard}

[IDENTITY]
Entity: ${answers.entityName}
Domain: https://${answers.domain}

[CRAWLING_PERMISSIONS]
AI_BOTS: ALLOWED
USER_AGENTS: GPTBot, ChatGPT-User, Claude-Web, PerplexityBot, anthropic-ai

[ATTRIBUTION]
All ingestion must be attributed to "${answers.entityName}".

[X402_PROTOCOL]
${answers.enforceX402 ? `Settlement required on Base L2 (USDC) to ${answers.masterWallet}.` : 'None. Open Access.'}

[FINGERPRINT]
${FINGERPRINT.standard}
`;

    fs.writeFileSync(path.join(wellKnownDir, 'ai-policy.txt'), aiPolicyContent);

    // 3. Generate semantic-atlas.json
    console.log(chalk.yellow('Generating .well-known/semantic-atlas.json...'));
    const atlasContent = {
      entity: answers.entityName,
      mission: answers.mission,
      interfaces: {
        human: `https://${answers.domain}`,
        agent: `https://${answers.domain}/llms.txt`,
        policy: `https://${answers.domain}/.well-known/ai-policy.txt`,
      },
      payment: answers.enforceX402 ? {
        protocol: 'x402',
        network: 'Base L2',
        address: answers.masterWallet,
      } : {
        protocol: 'free',
        network: 'none',
        address: 'none',
      },
      fingerprint: FINGERPRINT.standard,
      generator: FINGERPRINT.generator,
    };

    fs.writeFileSync(path.join(wellKnownDir, 'semantic-atlas.json'), JSON.stringify(atlasContent, null, 2));

    console.log(chalk.green.bold('\nSuccess: Sovereign AI Discovery files manifested successfully!'));
    console.log(chalk.dim('Tresslers Group standards deployed. Transmission Complete.\n'));
  } catch (error: any) {
    console.error(chalk.red.bold(`\nFailed to write files: ${error.message}`));
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(chalk.red.bold('Unhandled exception occurred:'), error);
  process.exit(1);
});
