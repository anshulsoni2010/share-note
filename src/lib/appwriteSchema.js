// This file is for documentation purposes only and does not affect the actual Appwrite schema

const shareNoteSchema = {
  title: 'string',
  author: 'string',
  keywords: 'string[]',
  link: 'string',
  userLink: 'string',
  visibility: 'boolean',
  expiry: 'datetime',
  onceRead: 'boolean',
  viewCount: 'integer',
  likes: 'integer',
  dislikes: 'integer',
  password: 'string',
  createdAt: 'datetime'
};

// Remember to set appropriate indexes and constraints in the Appwrite console
// For example, 'link' should probably be unique and indexed for faster queries
