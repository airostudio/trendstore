export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error);

  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
  }
}

export function logInfo(context: string, message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}]`, message, data || '');
  }
}
