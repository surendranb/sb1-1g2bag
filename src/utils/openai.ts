import OpenAI from 'openai';
import { config } from '../config/env';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true
});

export async function analyzeTransaction(transaction: {
  date: string;
  description: string;
  amount: number;
}) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a financial analysis assistant. Analyze the transaction and categorize it accurately.'
        },
        {
          role: 'user',
          content: `Please analyze this transaction:
            Date: ${transaction.date}
            Description: ${transaction.description}
            Amount: ${transaction.amount}
            
            Provide the following in JSON format:
            1. Category (Food, Transport, Shopping, Bills, Entertainment, Income, or Other)
            2. Confidence score (0-1)
            3. Brief explanation`
        }
      ],
      model: config.openai.model,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    return {
      category: 'Other',
      confidence: 0.5,
      explanation: 'Failed to analyze transaction with AI'
    };
  }
}

export async function reconcileTransactions(transactions: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a financial reconciliation assistant. Help identify potential duplicates and inconsistencies in transactions.'
        },
        {
          role: 'user',
          content: `Please analyze these transactions for potential duplicates or inconsistencies:
            ${JSON.stringify(transactions, null, 2)}
            
            Provide the following in JSON format:
            1. List of potential duplicate transaction pairs (indices)
            2. List of suspicious transactions (indices)
            3. Brief explanation for each flag`
        }
      ],
      model: config.openai.model,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error reconciling transactions:', error);
    return {
      duplicates: [],
      suspicious: [],
      explanations: {}
    };
  }
}

export async function analyzeSpending(transactions: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a financial insights assistant. Analyze spending patterns and provide actionable insights.'
        },
        {
          role: 'user',
          content: `Please analyze these transactions and provide financial insights:
            ${JSON.stringify(transactions, null, 2)}
            
            Provide the following in JSON format:
            1. Top spending categories
            2. Monthly trends
            3. Unusual patterns
            4. Saving opportunities
            5. Budget recommendations`
        }
      ],
      model: config.openai.model,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing spending:', error);
    return {
      topCategories: [],
      trends: [],
      patterns: [],
      opportunities: [],
      recommendations: []
    };
  }
}

export type TransactionAnalysis = {
  category: string;
  confidence: number;
  explanation: string;
};

export type ReconciliationResult = {
  duplicates: number[][];
  suspicious: number[];
  explanations: Record<number, string>;
};

export type SpendingAnalysis = {
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  trends: Array<{
    month: string;
    total: number;
    change: number;
  }>;
  patterns: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  opportunities: Array<{
    description: string;
    potentialSavings: number;
  }>;
  recommendations: Array<{
    category: string;
    currentSpending: number;
    recommendedSpending: number;
    advice: string;
  }>;
};