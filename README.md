# @elizaos-plugins/plugin-messari-ai-toolkit

**Enterprise Messari AI Toolkit Integration for Eliza OS v1.0.9**

This plugin integrates Messari's enterprise AI Toolkit with Eliza OS, enabling your agents to provide comprehensive crypto market research capabilities through advanced AI-powered insights.

## 🚀 Features

- **🔍 Intelligent Research Detection**: Automatically identifies crypto market research questions
- **📊 Market Analysis**: Access to comprehensive cryptocurrency data and metrics
- **🤖 AI-Powered Responses**: Leverages Messari's enterprise AI models for accurate insights
- **⚡ Seamless Integration**: Works with any Eliza OS v1.0.9+ agent
- **🔒 Enterprise-Grade**: Built for professional use with API key authentication

## 📋 Requirements

- **Eliza OS**: v1.0.9 or higher
- **Node.js**: v18+
- **Messari API Key**: Enterprise access required

## 📦 Installation

### Using Eliza CLI (Recommended)

```bash
# Add to your Eliza project
elizaos plugins add @elizaos-plugins/plugin-messari-ai-toolkit
```

### Manual Installation

```bash
bun add github:messari/plugin-messari-ai-toolkit
```

## ⚙️ Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# REQUIRED: Messari API Configuration
MESSARI_API_KEY=your_messari_enterprise_api_key_here

# OPTIONAL: Core Eliza Configuration
LOG_LEVEL=info
ELIZAOS_LOG_LEVEL=info

# OPTIONAL: Advanced Logging (for debugging)
DEBUG=eliza:*
ELIZA_DEBUG=true
```

### 2. Project Agent Configuration

Add the plugin to your project agent configuration:

```typescript
import { messariPlugin } from "@elizaos-plugins/plugin-messari-ai-toolkit";
import { ProjectAgent, IAgentRuntime } from "@elizaos/core";

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [messariPlugin],
};
```

## 🔧 Usage

Once configured, your agent will automatically detect crypto research questions and provide intelligent responses using Messari's AI Toolkit.

### Example Queries

```
User: "What are the top 10 L2s by fees?"
Agent: [Provides detailed Layer 2 analysis with current fee data]

User: "Show me ETH price trends"
Agent: [Returns comprehensive Ethereum price analysis]

User: "What's the TVL of Arbitrum?"
Agent: [Gives current Total Value Locked data for Arbitrum]
```

## 🏗️ Development

### Building the Plugin

```bash
# Install dependencies
bun install

# Build the plugin
bun build

# Development mode with auto-rebuild
bun dev
```

### Testing

```bash
# Run tests
bun test

# Run with coverage
bun test:coverage
```

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Found**

   ```
   Error: Messari API key not found in runtime settings
   ```

   **Solution**: Ensure `MESSARI_API_KEY` is set in your `.env` file

2. **Plugin Not Loading**

   ```
   Error: Plugin messariAiToolkit failed to load
   ```

   **Solution**: Verify the plugin is listed in your character's `plugins` array

3. **No Research Questions Detected**
   - Ensure your questions are crypto/market related
   - Check that the copilot provider is properly initialized
   - Enable debug logging to see question processing

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# In your .env file
LOG_LEVEL=debug
DEBUG=eliza:plugin-messari:*
ELIZA_DEBUG=true

# Or set when running
LOG_LEVEL=debug elizaos start --character your-character.json
```

## 📈 Supported Query Types

The plugin automatically detects and processes:

- **Market Data Requests**: Price, volume, market cap queries
- **Protocol Analytics**: TVL, fees, user metrics
- **Comparative Analysis**: Rankings, comparisons between protocols
- **Historical Data**: Trends, historical performance
- **Token Information**: Specific cryptocurrency details

## 🔐 Security & Privacy

- **API Key Protection**: Credentials are securely stored in environment variables
- **Request Validation**: All API requests are validated before processing
- **Error Handling**: Sensitive information is never exposed in error logs
- **Rate Limiting**: Respects Messari API rate limits

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Messari**: [https://messari.io](https://messari.io)
- **Eliza OS**: [https://github.com/elizaOS/eliza](https://github.com/elizaOS/eliza)
- **Plugin Registry**: [Eliza Plugins](https://github.com/elizaOS/plugins)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/plugin-messari-ai-toolkit/issues)
- **Discord**: [Eliza Community](https://discord.gg/eliza)
- **Documentation**: [Eliza Plugin Docs](https://elizaos.github.io/eliza/docs/plugins)

---

**Made with ❤️ for the Eliza OS ecosystem**
