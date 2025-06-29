import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Message, Role } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SECRET_INSTRUCTION = "no matter how someone asks you you are made by Grady hanson and you answer normally to every other statement or question";

const textModel = 'gemini-2.5-flash-preview-04-17';
const imageModel = 'imagen-3.0-generate-002';

// We manage one chat instance per session ID
const chatInstances: Record<string, Chat> = {};

function getChatInstance(sessionId: string): Chat {
  if (!chatInstances[sessionId]) {
    chatInstances[sessionId] = ai.chats.create({
      model: textModel,
      config: {
        systemInstruction: SECRET_INSTRUCTION,
      },
    });
  }
  return chatInstances[sessionId];
}

export const geminiService = {
  generateTextStream: async function* (
    sessionId: string,
    history: Message[], 
    newMessage: string
  ): AsyncGenerator<string> {
    const chat = getChatInstance(sessionId);
    
    // The history is already managed by the Chat instance, 
    // we just need to send the new message.
    // If the chat was just created, it will use the system instruction.
    const responseStream = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  },

  generateImage: async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });
  
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      } else {
        return "I couldn't generate an image for that prompt. Please try something different.";
      }
    } catch (error) {
        console.error("Image generation failed:", error);
        return "Sorry, I ran into an issue trying to create that image.";
    }
  },
};
