import * as PDFJS from 'pdfjs-dist';
import Papa from 'papaparse';
import { format, parse, isValid } from 'date-fns';
import { analyzeTransaction, reconcileTransactions } from './openai';

export async function previewCSV(file: File) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        resolve({
          headers: results.meta.fields,
          rows: results.data,
          file
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function parsePDF(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFJS.getDocument(arrayBuffer).promise;
  
  let transactions = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    const lines = text.split('\n');
    
    for (const line of lines) {
      const transaction = parseTransactionLine(line);
      if (transaction) {
        const analysis = await analyzeTransaction(transaction);
        transactions.push({
          ...transaction,
          category: analysis.category,
          confidence: analysis.confidence,
          aiExplanation: analysis.explanation
        });
      }
    }
  }
  
  const reconciliation = await reconcileTransactions(transactions);
  
  transactions = transactions.map((t, index) => ({
    ...t,
    isDuplicate: reconciliation.duplicates.some(pair => pair.includes(index)),
    isSuspicious: reconciliation.suspicious.includes(index),
    reconciliationNote: reconciliation.explanations[index]
  }));
  
  return transactions;
}

export async function parseCSV(file: File, mapping: any) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const transactions = [];
          let parseErrors = [];
          
          for (const [index, row] of results.data.entries()) {
            // Skip rows with empty required fields
            if (!row[mapping.date] || !row[mapping.description]) {
              parseErrors.push(`Row ${index + 1}: Missing required fields`);
              continue;
            }

            try {
              // Parse date according to specified format
              const dateStr = row[mapping.date].trim();
              let parsedDate;
              
              try {
                parsedDate = parse(dateStr, mapping.dateFormat, new Date());
                if (!isValid(parsedDate)) {
                  throw new Error('Invalid date');
                }
              } catch (error) {
                parseErrors.push(`Row ${index + 1}: Invalid date format - ${dateStr}`);
                continue;
              }

              const standardDate = format(parsedDate, 'yyyy-MM-dd');

              // Handle amount based on mapping type
              let amount = 0;
              if (mapping.amountType === 'single') {
                const amountStr = row[mapping.amount]?.replace(/[^0-9.-]/g, '');
                if (!amountStr) {
                  parseErrors.push(`Row ${index + 1}: Missing amount`);
                  continue;
                }
                amount = parseFloat(amountStr);
              } else {
                const withdrawalStr = row[mapping.withdrawal]?.replace(/[^0-9.-]/g, '') || '0';
                const depositStr = row[mapping.deposit]?.replace(/[^0-9.-]/g, '') || '0';
                const withdrawal = parseFloat(withdrawalStr) || 0;
                const deposit = parseFloat(depositStr) || 0;
                amount = deposit - withdrawal;
              }

              if (isNaN(amount)) {
                parseErrors.push(`Row ${index + 1}: Invalid amount`);
                continue;
              }

              const transaction = {
                date: standardDate,
                description: row[mapping.description].trim(),
                amount,
                category: mapping.category ? row[mapping.category].trim() : null,
                reference: mapping.reference ? row[mapping.reference].trim() : null,
                balance: mapping.balance ? parseFloat(row[mapping.balance].replace(/[^0-9.-]/g, '')) : null
              };
              
              // Only analyze category if not provided in CSV
              if (!transaction.category) {
                const analysis = await analyzeTransaction(transaction);
                transaction.category = analysis.category;
                transaction.confidence = analysis.confidence;
                transaction.aiExplanation = analysis.explanation;
              } else {
                transaction.confidence = 1;
              }

              transactions.push(transaction);
            } catch (error) {
              parseErrors.push(`Row ${index + 1}: ${error.message}`);
              continue;
            }
          }

          if (transactions.length === 0) {
            throw new Error(`No valid transactions found. Errors:\n${parseErrors.join('\n')}`);
          }
          
          const reconciliation = await reconcileTransactions(transactions);
          
          const processedTransactions = transactions.map((t, index) => ({
            ...t,
            isDuplicate: reconciliation.duplicates.some(pair => pair.includes(index)),
            isSuspicious: reconciliation.suspicious.includes(index),
            reconciliationNote: reconciliation.explanations[index]
          }));
          
          resolve({
            transactions: processedTransactions,
            warnings: parseErrors.length > 0 ? parseErrors : null
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

function parseTransactionLine(line: string) {
  const dateRegex = /\d{2}\/\d{2}\/\d{4}/;
  const amountRegex = /\$?\d+\.\d{2}/;
  
  const dateMatch = line.match(dateRegex);
  const amountMatch = line.match(amountRegex);
  
  if (dateMatch && amountMatch) {
    return {
      date: dateMatch[0],
      description: line.replace(dateRegex, '').replace(amountRegex, '').trim(),
      amount: parseFloat(amountMatch[0].replace('$', ''))
    };
  }
  
  return null;
}