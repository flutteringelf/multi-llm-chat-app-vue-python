import type { Model } from '@/types/models';
import type { ReasoningParameters } from '@/types/reasoning';

export const MODELS: { [key: string]: { [key: string]: Model } } = {
  anthropic: {
    CLAUDE_3_7_SONNET: {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude 3.7 Sonnet',
      contextWindow: 200000,
      maxTokens: 8192,
      multimodal: true,
      supportFunctionCalling: true,
      supportsReasoning: false,
    },
    CLAUDE_3_7_SONNET_THINKING: {
      id: 'claude-3-7-sonnet-20250219-thinking',
      name: 'Claude 3.7 Sonnet (with Thinking)',
      contextWindow: 200000,
      maxTokens: 128000,
      multimodal: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'budget',
        budgetTokenLimit: 32768,
        budgetTokens: 4096,
      },
    },
    CLAUDE_3_5_SONNET: {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      contextWindow: 200000,
      maxTokens: 8192,
      multimodal: true,
      supportsReasoning: false,
    },
    CLAUDE_3_HAIKU: {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      contextWindow: 200000,
      maxTokens: 4096,
      multimodal: true,
      supportsReasoning: false,
    }
  },
  openai: {
    OPENAI_GPT_4_1: {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      contextWindow: 1047576,
      maxTokens: 32768,
      multimodal: true,
      supportsReasoning: false,
      supportFunctionCalling: true,
    },
    OPENAI_GPT_4_1_MINI: {
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 Mini',
      contextWindow: 1047576,
      maxTokens: 32768,
      multimodal: true,
      supportsReasoning: false,
      supportFunctionCalling: true,
    },
    OPENAI_GPT_4_1_NANO: {
      id: 'gpt-4.1-nano',
      name: 'GPT-4.1 nano',
      contextWindow: 1047576,
      maxTokens: 32768,
      multimodal: true,
      supportsReasoning: false,
      supportFunctionCalling: true,
    },
    OPENAI_O3: {
      id: 'o3',
      name: 'o3',
      contextWindow: 200000,
      maxTokens: 100000,
      multimodal: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'medium',
      },
      unsupportsTemperature: true,
      supportFunctionCalling: true,
    },
    OPENAI_O4_MINI: {
      id: 'o4-mini',
      name: 'o4-mini',
      contextWindow: 200000,
      maxTokens: 100000,
      multimodal: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'medium',
      },
      unsupportsTemperature: true,
      supportFunctionCalling: true,
    },
    OPENAI_O1: {
      id: 'o1',
      name: 'o1',
      contextWindow: 200000,
      maxTokens: 100000,
      multimodal: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'medium',
      },
      unsupportsTemperature: true,
      supportFunctionCalling: true,
    },
    OPENAI_O3_MINI: {
      id: 'o3-mini',
      name: 'o3-mini',
      contextWindow: 200000,
      maxTokens: 100000,
      multimodal: false,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'medium',
      },
      unsupportsTemperature: true,
      supportFunctionCalling: true,
    },
    OPENAI_CHATGPT_4_O: {
      id: 'chatgpt-4o-latest',
      name: 'ChatGPT-4o',
      contextWindow: 128000,
      maxTokens: 16384,
      multimodal: true,
      supportsReasoning: false,
    },
    OPENAI_GPT_4_5_PREVIEW: {
      id: 'gpt-4.5-preview',
      name: 'GPT-4.5 Preview',
      contextWindow: 128000,
      maxTokens: 16384,
      multimodal: true,
      supportsReasoning: false,
      supportFunctionCalling: true,
    },
    OPENAI_GPT_4_O: {
      id: 'gpt-4o',
      name: 'GPT-4o',
      contextWindow: 128000,
      maxTokens: 16384,
      multimodal: true,
      supportsReasoning: false,
      supportFunctionCalling: true,
    }
  },
  google: {
    GEMINI_2_5_FLASH:{
      id: 'gemini-2.5-flash-preview-04-17',
      name: 'Gemini 2.5 Flash Preview 04-17',
      contextWindow: 1048576,
      maxTokens: 65536,
      multimodal: true,
      supportFunctionCalling: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'budget',
        budgetTokenLimit: 24576,
        budgetTokens: 4096,
      },
    },
    GEMINI_2_5_PRO_EXP: {
      id: 'gemini-2.5-pro-exp-03-25',
      name: 'Gemini 2.5 Pro Experimental 03-25',
      contextWindow: 1048576,
      maxTokens: 65536,
      multimodal: true,
      supportFunctionCalling: true,
      supportsReasoning: true,
    },
    GEMINI_2_5_PRO_PREVIEW: {
      id: 'gemini-2.5-pro-preview-03-25',
      name: 'Gemini 2.5 Pro Preview 03-25',
      contextWindow: 1048576,
      maxTokens: 65536,
      multimodal: true,
      supportFunctionCalling: true,
      supportsReasoning: true,
    },
    GEMINI_2_0_FLASH_EXP_IMAGE_GENERATION: {
      id: 'gemini-2.0-flash-exp-image-generation',
      name: 'Gemini 2.0 Flash (Image Generation) Experimental',
      contextWindow: 32768,
      maxTokens: 8192,
      multimodal: true,
      imageGeneration: true,
      supportFunctionCalling: true,
      supportsReasoning: false,
    },
    GEMINI_2_0_FLASH: {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      contextWindow: 1048576,
      maxTokens: 8192,
      multimodal: true,
      supportFunctionCalling: true,
      supportsReasoning: false,
    },
    GEMINI_2_0_FLASH_THINKING_EXP: {
      id: 'gemini-2.0-flash-thinking-exp-01-21',
      name: 'Gemini 2.0 Flash Thinking Experimental',
      contextWindow: 1048576,
      maxTokens: 65536,
      multimodal: true,
      supportsReasoning: true,
    },
    GEMINI_2_0_PRO_EXP: {
      id: 'gemini-2.0-pro-exp-02-05',
      name: 'Gemini 2.0 Pro Experimental',
      contextWindow: 2097152,
      maxTokens: 8192,
      multimodal: true,
      supportsReasoning: false,
    },
  },
  xai: {
    XAI_GROK_3_MINI_BETA: {
      id: 'grok-3-mini-beta',
      name: 'Grok 3 Mini Beta',
      contextWindow: 131072,
      maxTokens: 131072,
      multimodal: false,
      supportFunctionCalling: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'high',
      },
    },
    XAI_GROK_3_BETA: {
      id: 'grok-3-beta',
      name: 'Grok 3 Beta',
      contextWindow: 131072,
      maxTokens: 131072,
      multimodal: false,
      supportFunctionCalling: true,
      supportsReasoning: false,
    },
    XAI_GROK_3_MINI_FAST_BETA: {
      id: 'grok-3-mini-fast-beta',
      name: 'Grok 3 Mini Fast Beta',
      contextWindow: 131072,
      maxTokens: 131072,
      multimodal: false,
      supportFunctionCalling: true,
      supportsReasoning: true,
      reasoningParameters: {
        type: 'effort',
        effort: 'high',
      },
    },
    XAI_GROK_3_FAST_BETA: {
      id: 'grok-3-fast-beta',
      name: 'Grok 3 Fast Beta',
      contextWindow: 131072,
      maxTokens: 131072,
      multimodal: false,
      supportFunctionCalling: true,
      supportsReasoning: false,
    },
  },
  openrouter: {
  },
};