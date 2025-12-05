import mammoth from "mammoth";

export interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount?: number;
  wordCount?: number;
  documentType?: string;
}

export interface ProcessedDocument {
  text: string;
  metadata: DocumentMetadata;
}

/**
 * Process PDF file
 */
export async function processPDF(
  buffer: Buffer,
  filename: string,
): Promise<ProcessedDocument> {
  console.log(`   📄 Processing PDF: ${filename}`);
  
  // Use pdf2json - more robust for handling problematic PDFs
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require("pdf2json");
  
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    
    // Handle parsing errors
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error(`   ⚠️  PDF parsing error: ${errData.parserError}`);
      // Try to extract whatever text we can, even if there are errors
      // Don't reject immediately, let it try to parse
    });
    
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        // Extract text from all pages
        let fullText = "";
        const pages = pdfData.Pages || [];
        
        for (const page of pages) {
          const texts = page.Texts || [];
          for (const textObj of texts) {
            // Text is stored in R array with decoded content
            if (textObj.R && Array.isArray(textObj.R)) {
              for (const r of textObj.R) {
                if (r.T) {
                  // Decode URI component if needed
                  try {
                    fullText += decodeURIComponent(r.T) + " ";
                  } catch {
                    fullText += r.T + " ";
                  }
                }
              }
            }
          }
          fullText += "\n"; // New line between pages
        }
        
        const numPages = pages.length || 1;
        const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
        
        // Extract metadata if available
        const info = pdfData.Meta || {};
        
        // Helper function to safely parse dates
        const parseDate = (dateValue: any): Date | undefined => {
          if (!dateValue) return undefined;
          try {
            const date = new Date(dateValue);
            // Check if date is valid
            if (date instanceof Date && !isNaN(date.getTime())) {
              return date;
            }
          } catch {
            // Invalid date, return undefined
          }
          return undefined;
        };
        
        const documentMetadata: DocumentMetadata = {
          title: info.Title || filename.replace(/\.pdf$/i, ""),
          author: info.Author,
          creationDate: parseDate(info.CreationDate),
          modificationDate: parseDate(info.ModDate),
          pageCount: numPages,
          wordCount: wordCount,
          documentType: "pdf",
        };

        console.log(`   ✅ PDF processed: ${numPages} pages, ${wordCount} words`);
        
        resolve({
          text: fullText.trim(),
          metadata: documentMetadata,
        });
      } catch (error) {
        reject(new Error(`Failed to extract text from PDF: ${error}`));
      }
    });
    
    // Parse the PDF buffer
    try {
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(new Error(`Failed to parse PDF buffer: ${error}`));
    }
  });
}

/**
 * Process Word document (.docx)
 */
export async function processWord(
  buffer: Buffer,
  filename: string,
): Promise<ProcessedDocument> {
  console.log(`   📝 Processing Word document: ${filename}`);
  
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  
  // Try to extract metadata from document properties if available
  // Note: mammoth doesn't extract metadata by default, so we'll use basic info
  const metadata: DocumentMetadata = {
    title: filename.replace(/\.(docx|doc)$/i, ""),
    wordCount: text.split(/\s+/).length,
    documentType: "word",
  };

  console.log(`   ✅ Word document processed: ${metadata.wordCount} words`);
  
  return {
    text,
    metadata,
  };
}

/**
 * Process plain text or markdown
 */
export function processText(
  text: string,
  filename: string,
): ProcessedDocument {
  console.log(`   📋 Processing text file: ${filename}`);
  
  const isMarkdown = filename.toLowerCase().endsWith('.md') || 
                     filename.toLowerCase().endsWith('.markdown');
  
  const metadata: DocumentMetadata = {
    title: filename.replace(/\.(txt|md|markdown)$/i, ""),
    wordCount: text.split(/\s+/).length,
    documentType: isMarkdown ? "markdown" : "text",
  };

  console.log(`   ✅ Text file processed: ${metadata.wordCount} words`);
  
  return {
    text,
    metadata,
  };
}

/**
 * Auto-detect and process document based on file extension
 */
export async function processDocument(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
): Promise<ProcessedDocument> {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.endsWith('.pdf') || mimeType === 'application/pdf') {
    return processPDF(buffer, filename);
  } else if (lowerFilename.endsWith('.docx') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return processWord(buffer, filename);
  } else if (lowerFilename.endsWith('.txt') || lowerFilename.endsWith('.md') || lowerFilename.endsWith('.markdown')) {
    const text = buffer.toString('utf-8');
    return processText(text, filename);
  } else {
    // Try to process as text by default
    console.log(`   ⚠️  Unknown document type, processing as text: ${filename}`);
    const text = buffer.toString('utf-8');
    return processText(text, filename);
  }
}

