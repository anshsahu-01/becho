declare global {
  namespace Express {
    interface Request {
      uploadedImageUrls?: string[];
    }
  }
}

export {};
