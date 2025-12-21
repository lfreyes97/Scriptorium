
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Eres el asistente de IA de "Scriptorium", el entorno de trabajo académico e interno de Presuposicionalismo.com.
Tu rol es el de un amanuense digital erudito: intelectualmente riguroso, técnicamente preciso y con un profundo respeto por la exégesis y la lógica.
Tu idioma principal es el ESPAÑOL. Mantén un tono académico-profesional, evitando la superficialidad.
Estás diseñado para un grupo selecto de usuarios expertos que buscan profundidad en sus investigaciones teológicas y filosóficas.`;

export const sendMessageToGemini = async (
  prompt: string, 
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview'; 
    
    const contents = [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ];
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Lo siento, no pude generar una respuesta.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.status === 429 || (error.message && error.message.includes('429')) || error.status === 'RESOURCE_EXHAUSTED') {
      return "⚠️ **Límite de Cuota Excedido**. El Scriptorium ha alcanzado su capacidad máxima temporal.";
    }
    return "Encontré un error al conectar con el servicio de IA.";
  }
};

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: "Transcribe este audio para el Scriptorium. Prioriza la fidelidad textual y estructural." },
        ],
      },
    });
    return response.text || "No se pudo transcribir el audio.";
  } catch (error) {
    console.error("Transcription error:", error);
    return "Ocurrió un error al intentar transcribir el audio.";
  }
};

export const executeWorkflowAction = async (text: string, actionId: string): Promise<string> => {
  try {
    let instruction = "";
    switch (actionId) {
      case 'clean': instruction = "Limpia este texto eliminando ruido lingüístico y redundancias."; break;
      case 'summary_exec': instruction = "Genera una síntesis académica de alto nivel."; break;
      case 'rewrite_article': instruction = "Reescribe este material como un ensayo estructurado para el Scriptorium."; break;
      case 'extract_quotes': instruction = "Extrae las premisas y citas fundamentales."; break;
      case 'trans_en': instruction = "Traduce fielmente al inglés académico."; break;
      case 'trans_es': instruction = "Traduce fielmente al español académico."; break;
      default: instruction = "Procesa el texto bajo los estándares del Scriptorium.";
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${instruction}\n\nTexto:\n${text}`,
    });
    return response.text || "Error al procesar el texto.";
  } catch (error) {
    return "Error al ejecutar la acción del flujo de trabajo.";
  }
};

export const generateImage = async (prompt: string, inlineImageBase64?: string): Promise<string | null> => {
  try {
    const parts: any[] = [{ text: `High fidelity scholarly aesthetic: ${prompt}` }];
    if (inlineImageBase64) {
      const splitData = inlineImageBase64.split(',');
      const mimeType = splitData[0].match(/:(.*?);/)?.[1] || 'image/png';
      const data = splitData[1] || splitData[0];
      parts.unshift({ inlineData: { data, mimeType } });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};
