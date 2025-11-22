const axios = require('axios');
const { API_PROVIDERS } = require('../config/api-keys');

class MultiAPIClient {
  constructor() {
    this.providers = Object.keys(API_PROVIDERS);
    this.currentProviderIndex = 0;
    this.failureCount = {};
    this.lastSuccessfulProvider = null;
  }

  async makeAPICall(prompt, context = {}) {
    const maxRetries = this.providers.length;
    let attempts = 0;

    while (attempts < maxRetries) {
      const provider = this.getCurrentProvider();
      
      try {
        console.log(`🤖 Attempting API call with ${provider.toUpperCase()}...`);
        
        const response = await this.callProvider(provider, prompt, context);
        
        if (response && response.content) {
          this.onSuccess(provider);
          return {
            content: response.content,
            provider: provider,
            success: true,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} failed:`, error.message);
        this.onFailure(provider);
      }

      attempts++;
      this.moveToNextProvider();
    }

    // All providers failed
    return {
      content: this.getFallbackResponse(prompt),
      provider: 'fallback',
      success: false,
      error: 'All AI providers are currently unavailable',
      timestamp: new Date().toISOString()
    };
  }

  async callProvider(providerName, prompt, context) {
    const config = API_PROVIDERS[providerName];
    
    switch (providerName) {
      case 'openai':
        return await this.callOpenAI(config, prompt, context);
      case 'perplexity':
        return await this.callPerplexity(config, prompt, context);
      case 'gemini':
        return await this.callGemini(config, prompt, context);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  async callOpenAI(config, prompt, context) {
    const messages = [
      {
        role: 'system',
        content: `You are an AI wellness assistant for NeuraCare. Provide empathetic, actionable mental health insights. User context: mood=${context.mood || 'neutral'}, stress_level=${context.stressLevel || 'unknown'}.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return {
      content: response.data.choices[0]?.message?.content || '',
      usage: response.data.usage
    };
  }

  async callPerplexity(config, prompt, context) {
    const messages = [
      {
        role: 'system',
        content: `You are NeuraCare's AI wellness companion. Analyze mental health patterns and provide personalized recommendations. Context: ${JSON.stringify(context)}`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    return {
      content: response.data.choices[0]?.message?.content || '',
      usage: response.data.usage
    };
  }

  async callGemini(config, prompt, context) {
    const fullPrompt = `As NeuraCare's AI wellness assistant, analyze this mental health reflection and provide personalized insights.
    
User Context: ${JSON.stringify(context)}
User Input: ${prompt}

Please provide empathetic, actionable recommendations for mental wellness.`;

    const response = await axios.post(
      `${config.baseURL}/models/${config.model}:generateContent?key=${config.key}`,
      {
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          topP: 0.9,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 18000
      }
    );

    return {
      content: response.data.candidates[0]?.content?.parts[0]?.text || '',
      usage: response.data.usageMetadata
    };
  }

  getCurrentProvider() {
    return this.providers[this.currentProviderIndex];
  }

  moveToNextProvider() {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
  }

  onSuccess(provider) {
    this.lastSuccessfulProvider = provider;
    this.failureCount[provider] = 0;
    console.log(`✅ ${provider.toUpperCase()} API call successful`);
  }

  onFailure(provider) {
    this.failureCount[provider] = (this.failureCount[provider] || 0) + 1;
    console.log(`⚠️  ${provider.toUpperCase()} failure count: ${this.failureCount[provider]}`);
  }

  getFallbackResponse(prompt) {
    const fallbackResponses = [
      "Thank you for sharing your thoughts. While our AI assistants are temporarily unavailable, remember that your mental wellness journey is important. Consider taking a few deep breaths, practicing mindfulness, or reaching out to a trusted friend or mental health professional.",
      
      "I appreciate you taking time for self-reflection. Although our AI analysis is currently offline, this moment of introspection itself is valuable. Try some gentle movement, journaling, or a brief meditation to support your wellbeing right now.",
      
      "Your willingness to engage with your mental health is commendable. While our AI insights are temporarily unavailable, consider what emotions you're experiencing right now and practice self-compassion. Small acts of self-care can make a meaningful difference."
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  getProviderStats() {
    return {
      currentProvider: this.getCurrentProvider(),
      lastSuccessful: this.lastSuccessfulProvider,
      failureCounts: this.failureCount,
      availableProviders: this.providers
    };
  }
}

module.exports = new MultiAPIClient();