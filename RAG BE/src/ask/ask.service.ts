import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from '../qdrant/qdrant.service';
import { OpenaiService } from '../openai/openai.service';
import OpenAI, { OpenAIError } from 'openai';
import { extractJSON } from '../utils/extractJsonFromText';

@Injectable()
export class AskService {
  private logger = new Logger(AskService.name);
  constructor(
    private readonly qdrantService: QdrantService,
    private readonly openaiService: OpenaiService,
  ) {}

  async askQuestion(
    question: string,
    chatThreadId?: string,
    onDelta?: (textDelta: OpenAI.Beta.Threads.Messages.TextDelta, threadId: string, sources: string[]) => void,
    onEnd?: (message: string) => void,
    onError?: (error: OpenAIError, message: string) => void
  ) {
    const queryEmbedding = await this.openaiService.getEmbeddingForText(question);
    const results = await this.qdrantService.search(queryEmbedding);

    const contextDocs = results.map(res => res.payload.chunk).join('\n');
    const sources: string[] = results.map(r => (r.payload.source as string).replace(/\.[^/.]+$/, '') as string);
    const uniqueSources = [...new Set(sources)];

    this.logger.log(`Document context: ${contextDocs}`);


    const sanitizedData = await this.getSanitizedData(contextDocs, question);
    this.logger.log(`Sanitized data: ${sanitizedData}`);

    // const validatedData = await this.getValidatedData(contextDocs);
    // this.logger.log(`Validated data: ${validatedData}`);

    // const jsonValidated = this.extractJSON(validatedData);
    // this.logger.log(`Extracted validated JSON: ${JSON.stringify(jsonValidated)}`);

    const prompt = this.createPrompt(sanitizedData, question);

    const { answer, threadId: threadId } = await this.openaiService.generateAnswerInThread(prompt, chatThreadId, onDelta, onEnd, onError, uniqueSources);

    this.logger.log(`Answer: ${answer}`);
    return { answer, sources: uniqueSources, threadId: threadId };
  }

  async getSuggestionForClient(question: string, answer: string): Promise<string[]> {
    const prompt = `
Prompt:
Provide three follow-up questions that a user might ask based on the following conversation. The questions should be relevant, engaging, and encourage further discussion.

PROVIDE A JSON RESPONSE ONLY, STRUCTURED AS FOLLOWS:

\`\`\`json
[
    "A first follow-up question for ChatGPT.",
    "A second follow-up question for ChatGPT.",
    "A third follow-up question for ChatGPT."
]
\`\`\`

  User question: ${question}

  Response to user's question: ${answer}
  
  JSON Answer:`;

    const response = await this.openaiService.generateAnswerCompletion(prompt);
    const json = extractJSON(response);
    this.logger.log(`Extracted JSON: ${response}`);
    return json;
  }


  private createPrompt(contextDocs: string, question: string): string {
    return `
Instructions:
- Consider all provided context carefully.
- Do not fabricate details that cannot be supported by the context.
- If uncertain, acknowledge the uncertainty.
- Structure your answer in a logical, easy-to-understand manner, and cite references to the provided context if helpful.
  - IF USER DO NOT ASKED QUESTION, ASK HIM HOW YOU CAN HELP HIM.
  - If user asks something not related to parenting, ask him about his children or parenting issues. 
  - If user asks parenting related question use only information from the context that is relevant to the user's question. 
  - Answer should be written in a friendly, informative tone as person would write it. 
  - You can paraphrase the context, but do not copy it verbatim.
  - Avoid complex words and term.",
Provided Context:
${contextDocs}

User Question: ${question}

Answer:`;
  }


  private async getSanitizedData(text: string, question: string): Promise<string> {
    const prompt = `
    Prompt:
You are an AI assistant tasked with extracting useful parenting information from text while discarding any irrelevant or non-informative details (e.g., authors, sources, references, and metadata). Given a medical or educational text, process it by doing the following:

1. Break the text into meaningful, relevant chunks based on context and topic.
2. For each chunk, identify and summarize:
2.1 Relevant Context: Remove any information that is irrelevant to user's question(e.g. info about other child's ages).
2.2 Topics Covered: Summarize the key parenting or developmental topics addressed (e.g., sleep habits, discipline techniques, nutrition).
2.3 Key Advice or Information: Highlight actionable advice or core insights useful to parents.
Guidelines:

Focus on information directly relevant to parenting and child development.
Exclude any citations, author names, sources, and other metadata.
Ensure each chunk is concise and contextually clear.

User Question: ${question}

Text: `
    return await this.openaiService.generateAnswerCompletion(prompt + text);
  }

  private async getValidatedData(text: string): Promise<string> {
    const prompt = `
Prompt:
You are an expert AI assistant tasked with reviewing parenting or medical advice to ensure it is accurate, safe, and appropriate. Given the following text, assess it for potential issues.

Text to Review: 
${text}

Check the text for:
1. Medical Claims: Identify statements that require verification or are potentially misleading.
2. Safety Concerns: Flag any advice that may pose a risk to children or parents.
3. Absolute Statements: Note if the advice uses words like "always" or "never," which may not be universally applicable.
4. Emergency Advice: Verify that any guidance related to emergencies is accurate and appropriate.
5. Age-Appropriate Recommendations: Ensure the advice matches the developmental stage mentioned.

PROVIDE A JSON RESPONSE ONLY, STRUCTURED AS FOLLOWS:
\`\`\`json
{
  "needsReview": true/false,
  "concerns": [
    "Description of concern 1",
    "Description of concern 2"
  ],
  "confidence": 0-1
}
\`\`\`

Guidelines:

1. Set "needsReview" to true if any issues are identified; otherwise, set it to false.
2. In the "concerns" list, provide specific descriptions of any issues found.
3. Assign a confidence score between 0 (very low confidence) and 1 (very high confidence) based on the overall safety and accuracy of the text.

Text: `
    return await this.openaiService.generateAnswerCompletion(prompt + text);
  }
}
