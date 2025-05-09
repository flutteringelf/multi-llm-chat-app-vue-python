import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import type { APISettings } from '@/types/api';
import { storageService } from '@/services/storage/indexeddb-service';
import { conversationService } from '@/services/domain/conversation-service';
import type { Message } from '@/types/messages';
import { useSettingsStore } from '@/store/settings';
import type { Conversation, ConversationState, ConversationFolder } from '@/types/conversation';

// Remove old version migration logic. 
// FYI: Commit 9871698

export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    currentConversationId: null,
    conversationList: [],
    folders: [],
  }),
  actions: {
    async initializeConversationStore() {

      // Load data using new storage service methods
      this.conversationList = await storageService.getAllConversationMetas();
      this.folders = await storageService.getAllFolders();
      this.currentConversationId = await storageService.getCurrentConversationId();
      
      // --- Start Fallback Logic ---
      // Create a set of valid folder IDs
      const validFolderIds = new Set(this.folders.map(f => f.id));
      const conversationsToUpdate: Conversation[] = [];

      // Check conversation list and mark those needing update
      this.conversationList.forEach(conversation => {
        if (conversation.folderId && !validFolderIds.has(conversation.folderId)) {
          console.warn(`Conversation "${conversation.title}" (${conversation.conversationId}) had an invalid folderId "${conversation.folderId}". Moving to root.`);
          conversation.folderId = null;
          conversationsToUpdate.push(conversation);
        }
      });

      // Save updates for affected conversations individually
      if (conversationsToUpdate.length > 0) {
        console.log(`Saving updates for ${conversationsToUpdate.length} conversations after cleaning invalid folderIds.`);
        await Promise.all(
          conversationsToUpdate.map(conv => storageService.saveConversationMeta(conv))
        );
      }
      // --- End Fallback Logic ---
    },

    async createNewConversation() {
      const existingEmptyConversation = this.conversationList.find(
        (conversation) =>
          conversation.title === 'New Chat' && conversation.createdAt === conversation.updatedAt
      );
    
      if (existingEmptyConversation) {
        // If an empty "New Chat" exists, just select it
        this.currentConversationId = existingEmptyConversation.conversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
      } else {
        // Create a new conversation
        const newConversationId = `conv-${uuidv4()}`;
        const nowDate = new Date().toISOString();
        const settingsStore = useSettingsStore();
        
        let modelId = settingsStore.defaultModel;
        if (settingsStore.defaultVendor === 'openrouter') {
          modelId = settingsStore.validateModelSelection(modelId, settingsStore.defaultVendor);
        }
        const model = settingsStore.getModelById(modelId);
        console.log("model?", model) 
        const newConversation: Conversation = {
          conversationId: newConversationId,
          title: 'New Chat',
          createdAt: nowDate,
          updatedAt: nowDate,
          system: '',
          settings: {
            vendor: settingsStore.defaultVendor,
            model: modelId,
            maxTokens: settingsStore.defaultMaxTokens,
            temperature: model?.unsupportsTemperature ? undefined : settingsStore.defaultTemperature,
            reasoningEffort: settingsStore.getEffectiveReasoningEffort(modelId),
            budgetTokens: model?.reasoningParameters?.type === 'budget' ? model.reasoningParameters.budgetTokens : undefined,
            isReasoningSupported: model?.supportsReasoning,
            reasoningParameterType: model?.reasoningParameters?.type,
            toolUse: false, //settingsStore.toolUse,
            multimodal: model?.multimodal ?? false,
            imageGeneration: model?.imageGeneration ?? false,
          },
          historyLength: 0,
          // Ensure no messages property is included when saving meta
          // messages: [], // Removed
        };

        // Add to local state
        this.conversationList.unshift(newConversation);
        // Save the metadata of the new conversation
        await storageService.saveConversationMeta(newConversation);
        // Select the new conversation
        this.currentConversationId = newConversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
        // Clear messages for the new conversation in storage (optional, but good practice)
        await storageService.saveConversationMessages(newConversationId, []);
      }
    },
        
    async selectConversation(conversationId: string) {
      this.currentConversationId = conversationId;
      await storageService.saveCurrentConversationId(this.currentConversationId);
    },

    async updateConversationTitle(conversationId: string, newTitle: string) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].title = newTitle;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },
    
    async updateConversationSettings(conversationId: string, settings: APISettings) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        // If this is an OpenRouter vendor, validate the model selection
        if (settings.vendor === 'openrouter') {
          const settingsStore = useSettingsStore();
          settings.model = settingsStore.validateModelSelection(settings.model, settings.vendor);
        }
        
        this.conversationList[conversationIndex].settings = settings;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },

    async updateConversationSystem(conversationId: string, system: string, personaId: string) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].system = system;
        this.conversationList[conversationIndex].personaId = personaId;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },
    
    async updateConversationHistoryLength(conversationId: string, historyLength: number) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].historyLength = historyLength;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },

    async updateConversationDate(conversationId: string) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].updatedAt = new Date().toISOString();
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },

    async updateConversationFiles(conversationId: string, files: { [key: string]: string }) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].files = files;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },

    async deleteConversationFile(conversationId: string, fileName: string) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        const conversation = this.conversationList[conversationIndex];
        if (conversation.files) {
          delete conversation.files[fileName];
          // Save the updated individual conversation metadata
          await storageService.saveConversationMeta(conversation);
        }
      }
    },

    async deleteConversation(conversationId: string) {
      // Remove from local list first
      this.conversationList = this.conversationList.filter(c => c.conversationId !== conversationId);
      
      // Call the combined delete method in storageService
      await storageService.deleteConversation(conversationId);

      // Handle selecting a new current conversation if the deleted one was active
      if (this.currentConversationId === conversationId) {
        let nextConversationId: string | null = null;
        if (this.conversationList.length > 0) {
          nextConversationId = this.conversationList[0].conversationId;
        } else {
          // No conversations left, create a new one implicitly?
          // Or just set currentConversationId to null?
          // For now, just setting to null and letting UI handle empty state.
          nextConversationId = null;
        }
        this.currentConversationId = nextConversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
      }
    },

    async exportConversation(messages: Message[]) {
      const currentConversation = this.conversationList.find(
        conversation => conversation.conversationId === this.currentConversationId
      );

      if (currentConversation) {
        await conversationService.exportConversation(currentConversation, messages);
      }
    },

    async importConversation(file: File) {
      try {
        const importedData = await conversationService.importConversation(file);
        const importedConversation = importedData.conversation;
        const importedMessages = importedData.messages;
    
        const newConversationId = `conv-${uuidv4()}`
    
        const newConversation: Conversation = {
          ...importedConversation,
          conversationId: newConversationId,
          // Ensure messages are not included in the meta object
          // messages: undefined, // Remove this line
        };
    
        this.conversationList.unshift(newConversation);
    
        // Save metadata and messages separately
        await storageService.saveConversationMeta(newConversation);
        await storageService.saveConversationMessages(newConversationId, importedMessages);
    
        this.currentConversationId = newConversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
      } catch (error) {
        console.error('Error importing conversation:', error);
        throw error;
      }
    },

    async duplicateConversation(conversationId: string) {
      try {
        const conversationToDuplicate = this.conversationList.find(
          c => c.conversationId === conversationId
        );
        
        if (!conversationToDuplicate) {
          throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        const newConversationId = `conv-${uuidv4()}`;
        const nowDate = new Date().toISOString();
        const title = `Copy-${nowDate.split('T')[0]} ${conversationToDuplicate.title}`;
        
        const duplicatedConversationMeta: Omit<Conversation, 'messages'> = {
          ...JSON.parse(JSON.stringify(conversationToDuplicate)), // Deep copy meta
          conversationId: newConversationId,
          title,
          createdAt: nowDate,
          updatedAt: nowDate,
        };
        delete (duplicatedConversationMeta as any).messages; // Ensure no messages prop

        // Add to local list (casting back to Conversation for the list type)
        this.conversationList.unshift(duplicatedConversationMeta as Conversation);
        
        // Save the duplicated metadata
        await storageService.saveConversationMeta(duplicatedConversationMeta);
        
        const messages = await storageService.getConversationMessages(conversationId);
        
        // Save the duplicated messages
        if (messages && messages.length > 0) {
          await storageService.saveConversationMessages(newConversationId, JSON.parse(JSON.stringify(messages)));
        }
        
        this.currentConversationId = newConversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
        
        return newConversationId;
      } catch (error) {
        console.error('Error duplicating conversation:', error);
        throw error;
      }
    },

    async createBranchFromMessage(messageId: string) {
      try {
        if (!this.currentConversationId) {
          throw new Error('No current conversation');
        }
        
        const currentConversation = this.conversationList.find(
          c => c.conversationId === this.currentConversationId
        );
        
        if (!currentConversation) {
          throw new Error(`Current conversation not found`);
        }
        
        const allMessages = await storageService.getConversationMessages(this.currentConversationId);
        
        const messageIndex = allMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) {
          throw new Error(`Message with ID ${messageId} not found`);
        }
        
        const messagesUpToSpecified = allMessages.slice(0, messageIndex + 1);
        
        const newConversationId = `conv-${uuidv4()}`;

        const nowDate = new Date().toISOString();
        const title = `Branch-${nowDate.split('T')[0]} ${currentConversation.title}`;
        
        const branchedConversationMeta: Omit<Conversation, 'messages'> = {
          ...JSON.parse(JSON.stringify(currentConversation)),
          conversationId: newConversationId,
          title: title,
          createdAt: nowDate, // Use full ISO string?
          updatedAt: nowDate,
          historyLength: messagesUpToSpecified.length // Set history length based on branched messages
        };
        delete (branchedConversationMeta as any).messages; // Ensure no messages prop

        // Add to local list
        this.conversationList.unshift(branchedConversationMeta as Conversation);
        
        // Save the new metadata
        await storageService.saveConversationMeta(branchedConversationMeta);
        
        // Save the partial messages
        await storageService.saveConversationMessages(newConversationId, JSON.parse(JSON.stringify(messagesUpToSpecified)));
        
        this.currentConversationId = newConversationId;
        await storageService.saveCurrentConversationId(this.currentConversationId);
        
        return newConversationId;
      } catch (error) {
        console.error('Error creating branch from message:', error);
        throw error;
      }
    },

    // フォルダ関連のアクション
    async createFolder(name: string) {
      const folderId = `folder-${uuidv4()}`;
      const newFolder: ConversationFolder = {
        id: folderId,
        name,
        isExpanded: true
      };
      
      this.folders.unshift(newFolder);
      // Save the individual folder
      await storageService.saveFolder(newFolder);
      return folderId;
    },
    
    async updateFolderName(folderId: string, newName: string) {
      const folderIndex = this.folders.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        this.folders[folderIndex].name = newName;
        // Save the updated individual folder
        await storageService.saveFolder(this.folders[folderIndex]);
      }
    },
    
    async deleteFolder(folderId: string) {
      const conversationsToUpdate: Conversation[] = [];
      // Update conversations in local state
      this.conversationList.forEach(conversation => {
        if (conversation.folderId === folderId) {
          conversation.folderId = null;
          conversationsToUpdate.push(conversation);
        }
      });
      
      // Remove folder from local state
      this.folders = this.folders.filter(f => f.id !== folderId);
      
      // Delete the folder from storage
      await storageService.deleteFolder(folderId);
      
      // Save updates for affected conversations individually
      if (conversationsToUpdate.length > 0) {
        await Promise.all(
          conversationsToUpdate.map(conv => storageService.saveConversationMeta(conv))
        );
      }
    },
    
    async toggleFolderExpanded(folderId: string) {
      const folderIndex = this.folders.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        this.folders[folderIndex].isExpanded = !this.folders[folderIndex].isExpanded;
        // Save the updated individual folder
        await storageService.saveFolder(this.folders[folderIndex]);
      }
    },
    
    async moveConversationToFolder(conversationId: string, folderId: string | null) {
      const conversationIndex = this.conversationList.findIndex(c => c.conversationId === conversationId);
      if (conversationIndex !== -1) {
        this.conversationList[conversationIndex].folderId = folderId;
        // Save the updated individual conversation metadata
        await storageService.saveConversationMeta(this.conversationList[conversationIndex]);
      }
    },
  },
  getters: {
    // フォルダ内の会話を取得するゲッター
    getConversationsInFolder: (state) => (folderId: string | null) => {
      return state.conversationList.filter(conversation => conversation.folderId === folderId);
    },
    
    // ルート（フォルダに属さない）会話を取得するゲッター
    getRootConversations: (state) => {
      return state.conversationList.filter(conversation => !conversation.folderId);
    }
  }
});